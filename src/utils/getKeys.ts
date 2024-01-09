import type { BIP44Node } from '@metamask/key-tree';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import base58 from 'bs58';

import { ripemd160 } from './encrypt/hash';
import { FIO_CHAIN_NAME } from '../constants';

const getDerivedAddress = async ({ derivationIndex }: { derivationIndex?: number | undefined } = {}): Promise<BIP44Node> => {
  const fioNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 235,
    },
  });

  const deriveFioAddress = await getBIP44AddressKeyDeriver(fioNode);
  const derivationAddressIndex = derivationIndex || 0;

  return await deriveFioAddress(derivationAddressIndex);
};

export const getPublicKey = async ({ derivationIndex }: { derivationIndex?: number | undefined } = {}): Promise<string> => {
  const derivedAddress = await getDerivedAddress({ derivationIndex });

  const publicKeyBuffer = Buffer.from(derivedAddress.compressedPublicKeyBytes);
  const checksumPublicKeyValue = ripemd160(publicKeyBuffer, 'hex'); 
  const checksumPublicKeyString: string = checksumPublicKeyValue instanceof Buffer ? checksumPublicKeyValue.toString('hex') : checksumPublicKeyValue;
  const checksumPublicKey = checksumPublicKeyString.slice(0, 8);

  return FIO_CHAIN_NAME.concat(
    base58.encode(Buffer.concat([publicKeyBuffer, Buffer.from(checksumPublicKey, 'hex')])),
  );
};

export const getPrivateKeyBuffer = async ({ derivationIndex }: { derivationIndex?: number | undefined } = {}): Promise<Buffer> => {
  const derivedAddress = await getDerivedAddress({ derivationIndex });

  const versionByte = Buffer.from('80', 'hex');

  if (!derivedAddress.privateKeyBytes)
    throw new Error('Derivied address private key is missing');

  return Buffer.concat([
    versionByte,
    Buffer.from(derivedAddress.privateKeyBytes),
  ]);
};
