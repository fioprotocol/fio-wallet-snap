import assert from 'assert';
import BigInteger from 'bigi';
import { Buffer } from 'buffer';
import ecurve from 'ecurve';

import { ecdsaSign, calcPubKeyRecoveryParam } from './ecdsa';
import hash from './hash';
import keyUtils from './key_utils';

const curve = ecurve.getCurveByName('secp256k1');

const signature = (r: any, s: any, i: any): any => {
  assert.equal(r != null, true, 'Missing parameter');
  assert.equal(s != null, true, 'Missing parameter');
  assert.equal(i != null, true, 'Missing parameter');

  function toBuffer() {
    let buf;
    buf = Buffer.alloc(65);
    buf.writeUInt8(i, 0);
    r.toBuffer(32).copy(buf, 1);
    s.toBuffer(32).copy(buf, 33);
    return buf;
  }

  const signatureCache = `SIG_K1_${keyUtils.checkEncode(toBuffer(), 'K1')}`;
  return signatureCache;
};

/**
    * Sign a buffer of exactally 32 bytes in size (sha256(text))

    @param {string|Buffer} dataSha256 - 32 byte buffer or string
    @arg {Uint8Array} privateKeyBuffer
    @arg {String} [encoding] - dataSha256 encoding (if string)
    @return {Signature}
*/

const signHash = ({ dataSha256, encoding = 'hex', privateKeyBuffer }: any): any => {
  if (typeof dataSha256 === 'string') {
    dataSha256 = Buffer.from(dataSha256, encoding);
  }
  if (dataSha256.length !== 32 || !Buffer.isBuffer(dataSha256)) {
    throw new Error('dataSha256: 32 byte buffer requred');
  }

  const ptivateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);
  const publicKeyCurve = curve.G.multiply(ptivateKeyInt);

  let der, e, ecsignature, i, lenR, lenS, nonce;
  i = null;
  nonce = 0;
  e = BigInteger.fromBuffer(dataSha256);
  while (true) {
    ecsignature = ecdsaSign({
      curve,
      hash: dataSha256,
      d: ptivateKeyInt,
      nonce: nonce++,
    });

    der = ecsignature.toDER();
    lenR = der[3];
    lenS = der[5 + lenR];
    if (lenR === 32 && lenS === 32) {
      i = calcPubKeyRecoveryParam({
        curve,
        e,
        signature: ecsignature,
        Q: publicKeyCurve,
      });
      i += 4; // compressed
      i += 27; // compact  //  24 or 27 :( forcing odd-y 2nd key candidate)
      break;
    }
    if (nonce % 10 === 0) {
      console.log(`WARN: ${nonce} attempts to find canonical signature`);
    }
  }

  return signature(ecsignature.r, ecsignature.s, i);
};

/**
 * Hash and sign arbitrary data.
 *
 * @param {string|Buffer} data - full data
 * @param {wif|PrivateKey} privateKey
 * @param {string} [encoding] - data encoding (if string)
 * @returns {Signature}
 */

export const signChainTx = ({ data, encoding = 'utf8', privateKeyBuffer }: any): any => {
  if (typeof data === 'string') {
    data = Buffer.from(data, encoding);
  }
  assert(Buffer.isBuffer(data), 'data is a required String or Buffer');
  data = hash.sha256(data);
  return signHash({ dataSha256: data, privateKeyBuffer });
};
