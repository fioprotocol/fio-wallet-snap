import { divider, panel, text, heading } from '@metamask/snaps-sdk';

import {
  DEFAULT_TIMEOUT_OFFSET,
  FIO_ENVIRONMENT_CHAIN_NAMES,
  FIO_TRANSACTION_ACTION_NAMES,
} from '../../constants';
import type { DataParams, RequestParams, RequestParamsItem, SignedTransaction } from '../../types';
import { getChainInfo } from '../chain/chain-get-info';
import { signTx } from '../chain/chain-jssig';
import { arrayToHex } from '../chain/chain-numeric';
import { getPrivateKeyBuffer, getPublicKey } from '../getKeys';
import { serializeAction } from '../serialize/serialize-action';
import { serializeTransaction } from '../serialize/serialize-transaction';
import { createTransaction } from './create-transaction';
import { cypherContent } from './cypher-content';

export const signTransaction = async ({
  requestParams,
}: {
  requestParams: RequestParams;
}) => {
  const { actionParams, apiUrl } = requestParams;

  const transactions: {
    successed: Array<SignedTransaction>;
    failed: Array<{ id?: string; error: Error }>;
  } = {
    successed: [],
    failed: [],
  };

  const chainInfo = await getChainInfo({ apiUrl });

  const chainId = chainInfo.info.chain_id;
  const chainName = FIO_ENVIRONMENT_CHAIN_NAMES[chainId];

  if (!chainId || !chainName) {
    throw new Error('Cannot identify FIO chain');
  }

  const mapEntries = (contentData: DataParams) => {
    return Object.entries(contentData).map(([key, value]) => {
      if (typeof value === 'object') {
        return text(`${key}: ${JSON.stringify(value)}`);
      }

      return text(`${key}: ${value}`);
    });
  };

  const mapActionsEntries = (actionParams: Array<RequestParamsItem>) => {
    return actionParams.map((actionParamsItem, index)=> {
      return [
        text(`#${index + 1}. Transaction name: **${actionParamsItem.action}**`),
        divider(),
        text(`FIO Chain: ${chainName}`),
        divider(),
        text('Transaction details:'),
        ...mapEntries(actionParamsItem.data),
        divider(),
      ];
  }).flat();
  };

  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign FIO Transactions`),
        text(`${actionParams.length} transaction${actionParams.length > 1 ? 's' : ''}`),
        divider(),
        text('Please approve the following transactions.'),
        ...mapActionsEntries(actionParams),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Sign transaction canceled');
  }

  for (const actionParamItem of actionParams) {
    try {
      const {
        action,
        authActor,
        account,
        contentType,
        data,
        dataActor,
        derivationIndex,
        id,
        payeeFioPublicKey,
        payerFioPublicKey,
        timeoutOffset = DEFAULT_TIMEOUT_OFFSET,
      } = actionParamItem;

      const fioPubKey = await getPublicKey({ derivationIndex });
      const privateKeyBuffer = await getPrivateKeyBuffer({ derivationIndex });

      const transaction = createTransaction({
        account,
        action,
        authActor,
        chainInfo,
        data,
        dataActor,
        fioPubKey,
        timeoutOffset,
      });

      if (
        (action === FIO_TRANSACTION_ACTION_NAMES.newfundsreq ||
          action === FIO_TRANSACTION_ACTION_NAMES.recordobt) &&
        contentType
      ) {
        const encryptionPublicKey =
          payerFioPublicKey ?? payeeFioPublicKey ??
          (typeof data?.content === 'object' &&
            data?.content?.payee_public_address);

        if (encryptionPublicKey) {
          const cypheredContent = cypherContent({
            content: data.content,
            contentType,
            encryptionPublicKey,
            privateKeyBuffer,
          });

          if (transaction.actions[0] && typeof transaction.actions[0].data === 'object') {
            transaction.actions[0].data.content = cypheredContent;
          }
        }
      }

      const serializedAction = await serializeAction({
        account,
        action,
        apiUrl,
        transaction,
      });

      const serializedTransaction = await serializeTransaction({
        apiUrl,
        serializedAction,
        transaction,
      });

      const signedTxnSignatures = signTx({
        chainId,
        privateKeyBuffer: privateKeyBuffer.subarray(1),
        serializedTransaction,
      });

      const signedTransaction = {
        id,
        signatures: signedTxnSignatures,
        compression: 0,
        packed_context_free_data: arrayToHex(new Uint8Array(0)),
        packed_trx: arrayToHex(serializedTransaction),
      };

      transactions.successed.push(signedTransaction);
    } catch (error) {
      if (error instanceof Error) {
        const errorToPush: {
          error: Error;
          id?: string;
        } = { error };
        if ((actionParamItem as unknown as RequestParamsItem)?.id) {
          errorToPush.id = (actionParamItem as unknown as RequestParamsItem)?.id;
        }
        transactions.failed.push(errorToPush);
      }
    }
  }

  return JSON.stringify(transactions);
};
