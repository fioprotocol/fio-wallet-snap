import { DataParams } from '../../types';
import { getCipherContent } from '../encrypt/ecnrypt-fio';

export const cypherContent = ({
  content,
  contentType,
  encryptionPublicKey,
  privateKeyBuffer,
}: {
  content: DataParams['content'];
  contentType: string;
  encryptionPublicKey: string;
  privateKeyBuffer: Buffer;
}): string => {
  if (!content) {
    throw new Error('Missing content parameter');
  }
  if (!contentType) {
    throw new Error('Missing FIO content type');
  }
  if (!encryptionPublicKey) {
    throw new Error('Missing encrypt public key');
  }

  const cypheredContent = getCipherContent({
    content,
    fioContentType: contentType,
    privateKeyBuffer: privateKeyBuffer.subarray(1),
    encryptionPublicKey,
  });

  return cypheredContent;
};
