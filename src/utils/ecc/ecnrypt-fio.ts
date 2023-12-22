import BigInteger from 'bigi';
import * as cryptoaes from 'browserify-aes';
import { Buffer } from 'buffer';
import createHash from 'create-hash';
import createHmac from 'create-hmac';
import { getCurveByName, Point } from 'ecurve';
import randomBytes from 'randombytes';

import hash from './hash';
import { checkDecode } from './key_utils';

import {
  createInitialTypes,
  getTypesFromAbi,
  SerialBuffer,
} from '../chain-serialize';

import fioAbi from '../../abi/encryption-fio.abi.json';
import { FIO_CHAIN_NAME } from '../../constants';

const curve = getCurveByName('secp256k1');

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const fioTypes = getTypesFromAbi(createInitialTypes(), fioAbi);

function serialize(
  serialBuffer: SerialBuffer,
  type: string,
  value: any,
): void {
  fioTypes.get(type).serialize(serialBuffer, value);
};

const checkEncrypt = ({
  secret,
  message,
}: {
  secret: Buffer;
  message: Buffer;
}): Buffer => {
  const K = createHash('sha512').update(secret).digest();
  const Ke = K.subarray(0, 32); // Encryption
  const Km = K.subarray(32); // MAC
  const IV = randomBytes(16);

  // Cipher performs PKCS#5 padded automatically
  const cipher = cryptoaes.createCipheriv('aes-256-cbc', Ke, IV);
  const C = Buffer.concat([cipher.update(message), cipher.final()]);
  // Include in the HMAC input everything that impacts the decryption
  const M = createHmac('sha256', Km)
    .update(Buffer.concat([IV, C]))
    .digest(); // AuthTag

  return Buffer.concat([IV, C, M]);
};

/**
 * ECIES
 *
 * @param {BigInteger} privateKeyInt - PrivateKey in BigInteger
 * @returns {Buffer} 64 byte shared secret
 */

const getSharedSecret = async ({ privateKeyInt, encryptionPublicKey }: { privateKeyInt: BigInteger; encryptionPublicKey: string }) => {
  const prefixMatch = new RegExp("^" + FIO_CHAIN_NAME);
  if (prefixMatch.test(encryptionPublicKey)) {
    encryptionPublicKey = encryptionPublicKey.substring(FIO_CHAIN_NAME.length)
  }

  const encryptionPublicKeyBuffer = checkDecode(encryptionPublicKey);
  const encryptionPublicKeyPoint = Point.decodeFrom(curve, encryptionPublicKeyBuffer);
  const encryptionPublicKeyBufferCurve = encryptionPublicKeyPoint.getEncoded(false);
  const uncompressedEncryptionPublicKeyPoint = Point.decodeFrom(curve, encryptionPublicKeyBufferCurve); // Convert to uncompressed

  const KB = uncompressedEncryptionPublicKeyPoint.getEncoded(uncompressedEncryptionPublicKeyPoint.compressed);

  const KBP = Point.fromAffine(
    curve,
    BigInteger.fromBuffer(KB.slice(1, 33)), // x
    BigInteger.fromBuffer(KB.slice(33, 65)), // y
  );
  const r = privateKeyInt.toBuffer(32);
  const P = KBP.multiply(BigInteger.fromBuffer(r));
  const S = P.affineX.toBuffer(32);
  // SHA512 used in ECIES
  return hash.sha512(S);
};

/**
 * Encrypt the content of a FIO message.
 *
 * @param fioContentType - `new_funds_content`, etc
 * @param {object} content
 * @param publicKey - FIO PublicKey
 * @param {Buffer} [IV = randomBytes(16)] - An unpredictable strong random value
 * is required and supplied by default.  Unit tests may provide a static value
 * to achieve predictable results.
 * @returns {string} cipher base64
 */

export const getCipherContent = async ({
  fioContentType,
  content,
  privateKeyBuffer,
  encryptionPublicKey,
}: {
  fioContentType: string;
  content: any;
  publicKey: string;
  privateKeyBuffer: Buffer;
  encryptionPublicKey: string;
}): Promise<string> => {
  const buffer = new SerialBuffer({
    textEncoder,
    textDecoder,
  });
  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);
  
  const sharedSecret = await getSharedSecret({ privateKeyInt, encryptionPublicKey });

  serialize(buffer, fioContentType, content);

  const message = Buffer.from(buffer.asUint8Array());

  const cipherbuffer = checkEncrypt({ secret: sharedSecret, message });
  return cipherbuffer.toString('base64');
};
