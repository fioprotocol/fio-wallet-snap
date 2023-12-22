import BigInteger from 'bigi';
import { Buffer } from 'buffer';

import { enforceType } from './enforce_types';

export const ECSignature = (r, s) => {
  enforceType(BigInteger, r);
  enforceType(BigInteger, s);

  const toDER = () => {
    const rBa = r.toDERInteger();
    const sBa = s.toDERInteger();

    let sequence = [];

    // INTEGER
    sequence.push(0x02, rBa.length);
    sequence = sequence.concat(rBa);

    // INTEGER
    sequence.push(0x02, sBa.length);
    sequence = sequence.concat(sBa);

    // SEQUENCE
    sequence.unshift(0x30, sequence.length);

    return Buffer.from(sequence);
  };

  return { r, s, toDER };
};
