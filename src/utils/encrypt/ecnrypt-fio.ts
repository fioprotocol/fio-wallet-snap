import BigInteger from 'bigi';
import * as cryptoaes from 'browserify-aes';
import { Buffer } from 'buffer';
import { getCurveByName, Point } from 'ecurve';
import randomBytes from 'randombytes';

import {
  createInitialTypes,
  getTypesFromAbi,
  SerialBuffer,
} from '../chain/chain-serialize';
import { sha512, HmacSHA256 } from './hash';
import { checkDecode } from './key_utils';

import fioAbi from '../../abi/encryption-fio.abi.json';
import { FIO_CHAIN_NAME } from '../../constants';
import { DataParams } from '../../types';

const curve = getCurveByName('secp256k1');

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const fioTypes = getTypesFromAbi(createInitialTypes(), fioAbi);

function serialize(serialBuffer: SerialBuffer, type: string, value: DataParams['content']): void {
  fioTypes.get(type)!.serialize(serialBuffer, value);
}

const checkEncrypt = ({
  secret,
  message,
}: {
  secret: Buffer;
  message: Buffer;
}): Buffer => {
  const K = sha512(secret);
  const Ke = K instanceof Buffer ? K.subarray(0, 32): Buffer.from(K).subarray(0, 32); // Encryption
  const Km = K instanceof Buffer ? K.subarray(32) : Buffer.from(K).subarray(32); // MAC
  const IV = randomBytes(16);

  // Cipher performs PKCS#5 padded automatically
  const cipher = cryptoaes.createCipheriv('aes-256-cbc', Ke, IV);
  const C = Buffer.concat([cipher.update(message), cipher.final()]);
  // Include in the HMAC input everything that impacts the decryption
  const M = HmacSHA256(Buffer.concat([IV, C]), Km);
  return Buffer.concat([IV, C, M]);
};

const getSharedSecret = async ({
  privateKeyInt,
  encryptionPublicKey,
}: {
  privateKeyInt: BigInteger;
  encryptionPublicKey: string;
}) => {
  const prefixMatch = new RegExp('^' + FIO_CHAIN_NAME);
  if (prefixMatch.test(encryptionPublicKey)) {
    encryptionPublicKey = encryptionPublicKey.substring(FIO_CHAIN_NAME.length);
  }

  const encryptionPublicKeyBuffer = checkDecode({ keyString: encryptionPublicKey });
  const encryptionPublicKeyPoint = Point.decodeFrom(
    curve,
    encryptionPublicKeyBuffer,
  );
  const encryptionPublicKeyBufferCurve =
    encryptionPublicKeyPoint.getEncoded(false);
  const uncompressedEncryptionPublicKeyPoint = Point.decodeFrom(
    curve,
    encryptionPublicKeyBufferCurve,
  ); // Convert to uncompressed

  const KB = uncompressedEncryptionPublicKeyPoint.getEncoded(
    uncompressedEncryptionPublicKeyPoint.compressed,
  );

  const KBP = Point.fromAffine(
    curve,
    BigInteger.fromBuffer(KB.slice(1, 33)), // x
    BigInteger.fromBuffer(KB.slice(33, 65)), // y
  );
  const r = privateKeyInt.toBuffer(32);
  const P = KBP.multiply(BigInteger.fromBuffer(r));
  const S = P.affineX.toBuffer(32);
  // SHA512 used in ECIES
  return sha512(S);
};

export const getCipherContent = async ({
  fioContentType,
  content,
  privateKeyBuffer,
  encryptionPublicKey,
}: {
  fioContentType: string;
  content: DataParams['content'];
  privateKeyBuffer: Buffer;
  encryptionPublicKey: string;
}): Promise<string> => {
  const buffer = new SerialBuffer({
    textEncoder,
    textDecoder,
  });
  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);

  const sharedSecret = await getSharedSecret({
    privateKeyInt,
    encryptionPublicKey,
  });

  serialize(buffer, fioContentType, content);

  const message = Buffer.from(buffer.asUint8Array());

  const cipherbuffer = checkEncrypt({ secret: sharedSecret instanceof Buffer ? sharedSecret : Buffer.from(sharedSecret), message });
  return cipherbuffer.toString('base64');
};
