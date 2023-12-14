import { BIP44Node, getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import base58 from 'bs58';

import { ripemd160 } from './ecc/hash';

const getDerivedAddress = async (): Promise<BIP44Node> => {
  const fioNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 235,
    },
  });

  const deriveFioAddress = await getBIP44AddressKeyDeriver(fioNode);
  return await deriveFioAddress(0);
}

export const getPublicKey = async (): Promise<string> => {
  const derivedAddress = await getDerivedAddress();

  const pubBuffer = Buffer.from(derivedAddress.compressedPublicKeyBytes);
  const checksumPubK: string = ripemd160(pubBuffer, 'hex').slice(0, 8);

  return 'FIO'.concat(
    base58.encode(
      Buffer.concat([pubBuffer, Buffer.from(checksumPubK, 'hex')]),
    ),
  );
}

export const getPrivateKeyBuffer = async (): Promise<Buffer> => {
  const derivedAddress = await getDerivedAddress();

  const versionByte = Buffer.from('80', 'hex');

  if (!derivedAddress.privateKeyBytes) throw new Error('Derivied address private key is missing')

  return Buffer.concat([
    versionByte,
    Buffer.from(derivedAddress.privateKeyBytes),
  ]);
}