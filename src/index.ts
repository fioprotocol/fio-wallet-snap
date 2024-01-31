import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import type { RequestParams, RequestParamsTranasction } from './types';
import { getPublicKey } from './utils/getKeys';
import { signTransaction } from './utils/transaction/sign-transaction';
import { signNonce } from './utils/signNonce';
import { decryptContent } from './utils/encrypt/decrypt-fio';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const requestParams = request?.params as RequestParams | RequestParamsTranasction;
  switch (request.method) {
    case 'showPublicKey': {
      if ('derivationIndex' in requestParams) {
        return await getPublicKey({ derivationIndex: requestParams?.derivationIndex });
      }
    }
    case 'signTransaction': {
      if ('actionParams' in requestParams ) {
        return await signTransaction({ requestParams });
      }
    }
    case 'signNonce': {
      if ('nonce' in requestParams) {
        return await signNonce({ nonce: requestParams.nonce, derivationIndex: requestParams?.derivationIndex });
      }
    }
    case 'decryptContent': {
      if ('content' in requestParams) {
        return await decryptContent({
          content: requestParams.content,
          derivationIndex: requestParams?.derivationIndex,
          encryptionPublicKey: requestParams.encryptionPublicKey,
          fioContentType: requestParams.contentType
        });
      }
    }
    default:
      throw new Error('Method not found.');
  }
};
