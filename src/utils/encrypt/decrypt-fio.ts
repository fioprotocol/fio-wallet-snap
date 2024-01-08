import { panel, heading } from '@metamask/snaps-sdk';

import { getPrivateKeyBuffer } from '../getKeys';
import { getUncipherContent } from './ecnrypt-fio';

export const decryptContent = async ({
  content,
  encryptionPublicKey,
  fioContentType
}: {
  content: string | undefined;
  encryptionPublicKey: string | undefined;
  fioContentType: string | undefined;
}) => {
  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Decrypt FIO content`),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Decrypt FIO content canceled');
  }

  if (!content) {
    throw new Error('Missing content parameter to decrypt');
  }
  if (!encryptionPublicKey) {
    throw new Error('Missing encryption Public Key parameter to decrypt');
  }
  if (!fioContentType) {
    throw new Error('Missing content type parameter to decrypt');
  }

  const privateKeyBuffer = await getPrivateKeyBuffer();

  const uncipheredContent = getUncipherContent({
    encryptionPublicKey,
    fioContentType,
    content,
    privateKeyBuffer: privateKeyBuffer.subarray(1)
  });

  return uncipheredContent;
};