import { divider, panel, text, heading } from '@metamask/snaps-sdk';

import {
  DEFAULT_TIMEOUT_OFFSET,
  FIO_ENVIRONMENT_CHAIN_NAMES,
  FIO_TRANSACTION_ACTION_NAMES,
} from '../../constants';
import type { DataParams, RequestParams } from '../../types';
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
  const fioPubKey = await getPublicKey({ derivationIndex: requestParams.derivationIndex });
  const privateKeyBuffer = await getPrivateKeyBuffer({ derivationIndex: requestParams.derivationIndex });

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

  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign transaction!`),
        divider(),
        text(`Transaction name: **${action}**`),
        divider(),
        text(`Chain name: ${chainName}`),
        divider(),
        ...mapEntries(data),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Sign transaction cacneled');
  }

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
      payerFioPublicKey ??
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
    signatures: signedTxnSignatures,
    compression: 0,
    packed_context_free_data: arrayToHex(new Uint8Array(0)),
    packed_trx: arrayToHex(serializedTransaction),
  };

  return signedTransaction;
};
