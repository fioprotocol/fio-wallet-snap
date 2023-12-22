import { getCipherContent } from '../encrypt/ecnrypt-fio';

export const cypherContent = async ({
  content,
  contentType,
  encryptionPublicKey,
  privBuffer,
}: {
  action: string;
  content: any;
  contentType: string;
  encryptionPublicKey: string;
  privBuffer: Buffer;
}) => {
  if (!content) {
    throw new Error('Missing content parameter');
  }
  if (!contentType) {
    throw new Error('Missing FIO content type');
  }
  if (!encryptionPublicKey) {
    throw new Error('Missing encrypt public key');
  }

  const cypheredContent = await getCipherContent({
    content,
    fioContentType: contentType,
    privateKeyBuffer: privBuffer.slice(1),
    encryptionPublicKey,
  });

  return cypheredContent;
};
