import { panel, heading, text } from '@metamask/snaps-sdk';

import { getPrivateKeyBuffer } from '../getKeys';
import { getUncipherContent } from './encrypt-fio';

export const decryptContent = async ({
  content,
  derivationIndex,
  encryptionPublicKey,
  fioContentType,
}: {
  content: string | undefined;
  derivationIndex: number | undefined;
  encryptionPublicKey: string | undefined;
  fioContentType: string | undefined;
}) => {
  const confirmResult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(`Decrypt FIO Data`),
        text('Please approve the decryption of FIO Data. For your security and privacy, FIO Data is always encrypted and has to be decrypted before viewing.'),
      ]),
    },
  });

  if (!confirmResult) {
    throw new Error('Decrypt FIO data canceled');
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

  const privateKeyBuffer = await getPrivateKeyBuffer({ derivationIndex });

  const uncipheredContent = getUncipherContent({
    encryptionPublicKey,
    fioContentType,
    content,
    privateKeyBuffer: privateKeyBuffer.subarray(1)
  });

  return uncipheredContent;
};