import assert from 'assert';
import BigInteger from 'bigi';
import { Buffer } from 'buffer';
import ecurve from 'ecurve';
import { encoding } from 'create-hash';

import { ecdsaSign, calcPubKeyRecoveryParam } from './ecdsa';
import { sha256 } from './hash';
import { checkEncode } from './key_utils';

const curve = ecurve.getCurveByName('secp256k1');

const signature = (r: BigInteger, s: BigInteger, i: number): string => {
  assert.equal(r != null, true, 'Missing parameter');
  assert.equal(s != null, true, 'Missing parameter');
  assert.equal(i != null, true, 'Missing parameter');

  const toBuffer = () => {
    let buf;
    buf = Buffer.alloc(65);
    buf.writeUInt8(i, 0);
    r.toBuffer(32).copy(buf, 1);
    s.toBuffer(32).copy(buf, 33);
    return buf;
  };

  const signatureCache = `SIG_K1_${checkEncode({ keyBuffer: toBuffer(), keyType: 'K1' })}`;
  
  return signatureCache;
};

const signHash = ({ dataSha256, encoding = 'hex', privateKeyBuffer }: { dataSha256: string | Buffer; encoding?: encoding; privateKeyBuffer: Uint8Array }): string => {
  if (typeof dataSha256 === 'string') {
    dataSha256 = Buffer.from(dataSha256, encoding);
  }
  if (dataSha256.length !== 32 || !Buffer.isBuffer(dataSha256)) {
    throw new Error('dataSha256: 32-byte buffer required');
  }

  const privateKeyInt = BigInteger.fromBuffer(privateKeyBuffer);
  const publicKeyCurve = curve.G.multiply(privateKeyInt);

  let der, e: BigInteger, ecsignature, i, lenR, lenS, nonce;
  i = null;
  nonce = 0;
  e = BigInteger.fromBuffer(dataSha256);
  while (true) {
    ecsignature = ecdsaSign({
      curve,
      hash: dataSha256,
      d: privateKeyInt,
      nonce: nonce++,
    });

    der = ecsignature.toDER();
    lenR = der[3];

    if (typeof lenR !== 'undefined') {
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
    }

    if (nonce % 10 === 0) {
      console.log(`WARN: ${nonce} attempts to find a canonical signature`);
    }
  }

  return signature(ecsignature.r, ecsignature.s, i);
};



export const signSignature = ({ data, encoding = 'utf8', privateKeyBuffer }: { data: Buffer | string; encoding?: BufferEncoding; privateKeyBuffer: Uint8Array }): string => {
  if (typeof data === 'string') {
    data = Buffer.from(data, encoding);
  }
  assert(Buffer.isBuffer(data), 'data is a required String or Buffer');
  const dataSha256 = sha256(data);
  data = Buffer.isBuffer(dataSha256) ? dataSha256 : Buffer.from(dataSha256, encoding);
  return signHash({ dataSha256: data, privateKeyBuffer });
};
