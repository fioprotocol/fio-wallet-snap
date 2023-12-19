import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { panel, text } from '@metamask/snaps-sdk';

import { signTx } from './utils/chain-jssig';
import { arrayToHex } from './utils/chain-numeric';
import {
  getTypesFromAbi,
  createInitialTypes,
  SerialBuffer,
} from './utils/chain-serialize';
import { accountHash } from './utils/general';
import { getPrivateKeyBuffer, getPublicKey } from './utils/getKeys';

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const requestParams = request?.params as unknown;
  switch (request.method) {
    case 'showPublicKey': {
      return await getPublicKey();
    }
    case 'signTransaction': {
      const fioPubKey = await getPublicKey();
      const privBuffer = await getPrivateKeyBuffer();

      const { action, authActor, apiUrl, account, data, dataActor } =
        requestParams;

      const info = await (await fetch(`${apiUrl}/v1/chain/get_info`)).json();
      const blockInfo = await (
        await fetch(`${apiUrl}/v1/chain/get_block`, {
          body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`,
          method: 'POST',
        })
      ).json();
      const chainId = info.chain_id;
      const currentDate = new Date();
      const timePlusTen = currentDate.getTime() + 10000;
      const timeInISOString = new Date(timePlusTen).toISOString();
      const expiration = timeInISOString.substr(0, timeInISOString.length - 1);

      const userAccount = accountHash(fioPubKey);

      const transaction = {
        expiration,
        ref_block_num: blockInfo.block_num & 0xffff,
        ref_block_prefix: blockInfo.ref_block_prefix,
        actions: [
          {
            account,
            name: action,
            authorization: [
              {
                actor: authActor || userAccount,
                permission: 'active',
              },
            ],
            data: {
              ...data,
              actor: dataActor || userAccount,
            },
          },
        ],
      };

      const abiFioAddress = await (
        await fetch(`${apiUrl}/v1/chain/get_abi`, {
          body: `{"account_name": ${account}}`,
          method: 'POST',
        })
      ).json();

      // Get a Map of all the types from fio.address
      const typesFioAddress = getTypesFromAbi(
        createInitialTypes(),
        abiFioAddress.abi,
      );

      // Get the addaddress action type
      let fioAction = typesFioAddress.get(action);

      const buffer = new SerialBuffer({ textEncoder, textDecoder });
      fioAction.serialize(buffer, transaction.actions[0].data);
      const serializedData = arrayToHex(buffer.asUint8Array());

      let serializedAction = transaction.actions[0];
      serializedAction = {
        ...serializedAction,
        data: serializedData,
      };

      const abiMsig = await (
        await fetch(`${apiUrl}/v1/chain/get_abi`, {
          body: `{"account_name": "eosio.msig"}`,
          method: 'POST',
        })
      ).json();

      const typesTransaction = getTypesFromAbi(
        createInitialTypes(),
        abiMsig.abi,
      );

      // Get the transaction action type
      let txnAction = typesTransaction.get('transaction');

      const rawTransaction = {
        ...transaction,
        max_net_usage_words: 0,
        max_cpu_usage_ms: 0,
        delay_sec: 0,
        context_free_actions: [],
        actions: [serializedAction], // Actions have to be an array
        transaction_extensions: [],
      };

      // Serialize the transaction
      const buffer2 = new SerialBuffer({ textEncoder, textDecoder });
      txnAction.serialize(buffer2, rawTransaction);
      const serializedTransaction = buffer2.asUint8Array();

      const signedTxnSignatures = await signTx({
        chainId,
        privateKeyBuffer: privBuffer.slice(1),
        serializedTransaction,
      });

      const txn = {
        signatures: signedTxnSignatures,
        compression: 0,
        packed_context_free_data: arrayToHex(new Uint8Array(0)),
        packed_trx: arrayToHex(serializedTransaction),
      };

      // const pushResult = await fetch(apiUrl + '/v1/chain/push_transaction', {
      //   body: JSON.stringify(txn),
      //   method: 'POST',
      // });

      // const jsonResult = await pushResult.json();

      // if (jsonResult.transaction_id) {
      //   console.log('Success. \nTransaction: ', jsonResult);
      // } else if (jsonResult.code) {
      //   console.log('Error: ', jsonResult.error);
      // } else {
      //   console.log('Error: ', jsonResult);
      // }

      return txn;

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    }
    default:
      throw new Error('Method not found.');
  }
};
