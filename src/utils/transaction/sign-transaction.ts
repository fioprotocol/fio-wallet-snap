import { divider, panel, text, heading } from '@metamask/snaps-sdk';

import {
  DEFAULT_TIMEOUT_OFFSET,
  FIO_TRANSACTION_ACTION_NAMES,
} from '../../constants';
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
  requestParams: {
    apiUrl: string;
    account: string;
    action: string;
    authActor: string | undefined;
    contentType: string | undefined;
    data: any;
    dataActor: string | undefined;
    fioPubKey: string;
    payerFioPublicKey: string | undefined;
    timeoutOffset: number;
  };
}) => {
  const fioPubKey = await getPublicKey();
  const privBuffer = await getPrivateKeyBuffer();

  const {
    action,
    authActor,
    apiUrl,
    account,
    contentType,
    data,
    dataActor,
    payerFioPublicKey,
    timeoutOffset = DEFAULT_TIMEOUT_OFFSET,
  } = requestParams;

  const mapEntries = (data: any) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object') {
        return text(`${key}: ${JSON.stringify(value)}`);
      }
      return text(`${key}: ${value}`);
    });
  };

  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign transaction!`),
        divider(),
        text(`Transaction name: **${action}**`),
        divider(),
        ...mapEntries(data),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Sign transaction cacneled');
  }

  const chainInfo = await getChainInfo({ apiUrl });
  const chainId = chainInfo.info.chain_id;

  const transaction = await createTransaction({
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
      payerFioPublicKey ?? data?.content?.payee_public_address;

    const cypheredContent = await cypherContent({
      action,
      content: data.content,
      contentType,
      encryptionPublicKey,
      privBuffer,
    });

    transaction.actions[0].data.content = cypheredContent;
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

  const signedTxnSignatures = await signTx({
    chainId,
    privateKeyBuffer: privBuffer.slice(1),
    serializedTransaction,
  });

  const signedTransaction = {
    signatures: signedTxnSignatures,
    compression: 0,
    packed_context_free_data: arrayToHex(new Uint8Array(0)),
    packed_trx: arrayToHex(serializedTransaction),
  };

  return signedTransaction;
};
