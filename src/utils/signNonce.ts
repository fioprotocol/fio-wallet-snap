import { panel, heading } from '@metamask/snaps-sdk';

import { getPrivateKeyBuffer } from './getKeys';
import { signSignature } from './encrypt/signature';

export const signNonce = async ({ nonce }: { nonce: string | Buffer | undefined }) => {
  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign nonce`),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Sign nonce canceled');
  }

  const privateKeyBuffer = await getPrivateKeyBuffer();

  if (!nonce) throw new Error('Missing nonce for signing nonce.');

  const signature = signSignature({ data: nonce, privateKeyBuffer: privateKeyBuffer.subarray(1) });

  return signature;
};
