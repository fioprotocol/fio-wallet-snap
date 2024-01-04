import bs58 from 'bs58';
import Long from 'long';

import { FIO_CHAIN_NAME } from '../constants';

export const accountHash = (pubkey: string): string => {
  const updPubkey = pubkey.substring(FIO_CHAIN_NAME.length, pubkey.length);

  const decoded58 = bs58.decode(updPubkey);
  const long = shortenKey(decoded58);

  const output = stringFromUInt64T(long);
  return output;
};

function shortenKey(key: Uint8Array): Long {
  let res: Long = Long.fromValue(0, true);
  let temp: Long = Long.fromValue(0, true);
  let toShift: number = 0;
  let i: number = 1;
  let len: number = 0;

  while (len <= 12) {
    // assert(i < 33, "Means the key has > 20 bytes with trailing zeroes...")
    if (key[i] !== undefined) {
      temp = Long.fromValue(key[i] as number, true).and(len === 12 ? 0x0f : 0x1f);

      if (!temp.equals(0)) {
        if (len === 12) {
          toShift = 0;
        } else {
          toShift = 5 * (12 - len) - 1;
        }
        temp = Long.fromValue(temp, true).shiftLeft(toShift);

        res = Long.fromValue(res, true).or(temp);
        len += 1;
      }
    }

    i += 1;
  }

  return res;
}


function stringFromUInt64T(temp: Long): string {
  const charmap = '.12345abcdefghijklmnopqrstuvwxyz'.split('');

  const str = new Array(13);
  str[12] = charmap[temp.and(0x0f).toNumber()];

  let updTemp = temp.shiftRight(4);
  for (let i = 1; i <= 12; i++) {
    const charStr = charmap[updTemp.and(0x1f).toNumber()];
    str[12 - i] = charStr;
    updTemp = updTemp.shiftRight(5);
  }

  let result = str.join('');
  if (result.length > 12) {
    result = result.substring(0, 12);
  }
  return result;
}

