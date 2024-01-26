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

function deserialize(serialBuffer: SerialBuffer, type: string): any {
  return fioTypes.get(type)!.deserialize(serialBuffer);
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

const checkDecrypt = ({ secret, message }:{ secret: Buffer; message: Buffer }): Buffer => {
  const K = sha512(secret);
  const Ke = K instanceof Buffer ? K.subarray(0, 32) : Buffer.from(K).subarray(0, 32); // Encryption
  const Km = K instanceof Buffer ? K.subarray(32) : Buffer.from(K).subarray(32); // MAC
  const IV = message.subarray(0, 16);
  const C = message.subarray(16, message.length - 32);
  const M = message.subarray(message.length - 32);

  // Side-channel attack protection: First verify the HMAC, then and only then proceed to the decryption step
  const Mc = HmacSHA256(Buffer.concat([IV, C]), Km);

  if (Buffer.compare(M, Mc) !== 0) {
    throw new Error('Decrypt failed');
  }

  // Cipher performs PKCS#5 padded automatically
  const cipher = cryptoaes.createDecipheriv('aes-256-cbc', Ke, IV);
  return Buffer.concat([cipher.update(C, 'binary'), cipher.final()]);
}

const getSharedSecret = ({
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

export const getCipherContent = ({
  fioContentType,
  content,
  privateKeyBuffer,
  encryptionPublicKey,
}: {
  fioContentType: string;
  content: DataParams['content'];
  privateKeyBuffer: Buffer;
  encryptionPublicKey: string;
}): string => {
  const buffer = new SerialBuffer({
    textEncoder,
    textDecoder,
  });
  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);

  const sharedSecret = getSharedSecret({
    privateKeyInt,
    encryptionPublicKey,
  });

  serialize(buffer, fioContentType, content);

  const message = Buffer.from(buffer.asUint8Array());

  const cipherbuffer = checkEncrypt({ secret: sharedSecret instanceof Buffer ? sharedSecret : Buffer.from(sharedSecret), message });
  return cipherbuffer.toString('base64');
};

export const getUncipherContent = ({
  encryptionPublicKey,
  fioContentType,
  content,
  privateKeyBuffer
}: {
  encryptionPublicKey: string;
    fioContentType: string;
  content: string;
  privateKeyBuffer: Buffer
}): Promise<any> => {
  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);

  const sharedSecret = getSharedSecret({
    privateKeyInt,
    encryptionPublicKey,
  });

  const message = checkDecrypt({ secret: Buffer.isBuffer(sharedSecret) ? sharedSecret : Buffer.from(sharedSecret), message: Buffer.from(content, 'base64')});
  const messageArray = Uint8Array.from(message);

  const buffer = new SerialBuffer({
    array: messageArray,
    textEncoder,
    textDecoder,
  });

  const deserializedContent = deserialize(buffer, fioContentType);

  return deserializedContent;
};
