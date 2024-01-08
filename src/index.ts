import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import type { RequestParams } from './types';
import { getPublicKey } from './utils/getKeys';
import { signTransaction } from './utils/transaction/sign-transaction';
import { signNonce } from './utils/signNonce';
import { decryptContent } from './utils/encrypt/decrypt-fio';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const requestParams = request?.params as RequestParams;
  switch (request.method) {
    case 'showPublicKey': {
      return await getPublicKey();
    }
    case 'signTransaction': {
      return await signTransaction({ requestParams });
    }
    case 'signNonce': {
      return await signNonce({ nonce: requestParams.nonce });
    }
    case 'decryptContent': {
      return await decryptContent({
        content: requestParams.content,
        encryptionPublicKey: requestParams.encryptionPublicKey,
        fioContentType: requestParams.contentType
      });
    }
    default:
      throw new Error('Method not found.');
  }
};
