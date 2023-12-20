import BigInteger from 'bigi';
import * as cryptoaes from 'browserify-aes';
import { Buffer } from 'buffer';
import createHash from 'create-hash';
import createHmac from 'create-hmac';
import { getCurveByName, Point } from 'ecurve';
import randomBytes from 'randombytes';

import fioAbi from '../../abi/encryption-fio.abi.json';
import {
  createInitialTypes,
  getTypesFromAbi,
  SerialBuffer,
} from '../chain-serialize';
import hash from './hash';

const curve = getCurveByName('secp256k1');

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const fioTypes = getTypesFromAbi(createInitialTypes(), fioAbi);

const serialize = (
  serialBuffer: SerialBuffer,
  type: string,
  value: any,
): void => {
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
  const Ke = K.slice(0, 32); // Encryption
  const Km = K.slice(32); // MAC
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

const getSharedSecret = ({ privateKeyInt }: { privateKeyInt: BigInteger }) => {
  const publicKeyCurve = curve.G.multiply(privateKeyInt);
  const bufPubKeyCurve = publicKeyCurve.getEncoded(false);
  const point = Point.decodeFrom(curve, bufPubKeyCurve); // toUncompressed
  const KB = point.getEncoded(point.compressed);

  const KBP = Point.fromAffine(
    curve,
    BigInteger.fromBuffer(KB.slice(1, 33)), // x
    BigInteger.fromBuffer(KB.slice(33, 65)), // y
  );
  const r = privateKeyInt.toBuffer(32);
  const P = KBP.multiply(BigInteger.fromBuffer(r));
  const S = P.affineX.toBuffer({ size: 32 });
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

export const getCipherContent = ({
  fioContentType,
  content,
  privateKeyBuffer,
}: {
  fioContentType: string;
  content: any;
  publicKey: string;
  privateKeyBuffer: Buffer;
}): string => {
  console.log('fioContentType', fioContentType);
  console.log('content', content);
  const buffer = new SerialBuffer({
    textEncoder,
    textDecoder,
  });
  console.log('buffer', buffer);
  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);
  const sharedSecret = getSharedSecret({ privateKeyInt });
  console.log('sharedSecret', sharedSecret);
  serialize(buffer, fioContentType, content);
  const message = Buffer.from(buffer.asUint8Array());
  console.log('message', message);
  const cipherbuffer = checkEncrypt({ secret: sharedSecret, message });
  console.log('cipherbuffer', cipherbuffer);
  console.log('cipher', cipherbuffer.toString('base64'));
  return cipherbuffer.toString('base64');
};
