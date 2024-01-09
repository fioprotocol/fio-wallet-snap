import { panel, heading } from '@metamask/snaps-sdk';

import { getPrivateKeyBuffer } from './getKeys';
import { signSignature } from './encrypt/signature';

export const signNonce = async ({ nonce, derivationIndex }: { nonce: string | Buffer | undefined; derivationIndex?: number | undefined }) => {
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

  const privateKeyBuffer = await getPrivateKeyBuffer({ derivationIndex });

  if (!nonce) throw new Error('Missing nonce for signing nonce.');

  const signature = signSignature({ data: nonce, privateKeyBuffer: privateKeyBuffer.subarray(1) });

  return signature;
};
