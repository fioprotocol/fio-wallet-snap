import { divider, panel, heading, text } from '@metamask/snaps-sdk';

import { getPrivateKeyBuffer } from './getKeys';
import { signSignature } from './encrypt/signature';

export const signNonce = async ({ nonce, derivationIndex }: { nonce: string | Buffer | undefined; derivationIndex?: number | undefined }) => {
  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Sign-in to FIO App`),
        text('Please approve this nonce signature to sign-in to the FIO App. Nonce signature proves that you are the owner of the associated FIO Public Key.'),
        divider(),
        text(`Random nonce: ${nonce}`),
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
