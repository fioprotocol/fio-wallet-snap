import bs58 from 'bs58';
import Long from 'long';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * invoked the snap.
 * @param pubkey - Users public key to get an account name.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export function accountHash(pubkey: string): any {
  const updPubkey = pubkey.substring('FIO'.length, pubkey.length);

  const decoded58 = bs58.decode(updPubkey);
  const long = shortenKey(decoded58);

  const output = stringFromUInt64T(long);
  return output;
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 * @param key - This is a key as number.
 * @returns Result of function.
 * @throws If the request method is not valid for this snap.
 */
function shortenKey(key: Uint8Array): any {
  let res = Long.fromValue(0, true);
  let temp = Long.fromValue(0, true);
  let toShift = 0;
  let i = 1;
  let len = 0;

  while (len <= 12) {
    // assert(i < 33, "Means the key has > 20 bytes with trailing zeroes...")
    temp = Long.fromValue(key[i], true).and(len == 12 ? 0x0f : 0x1f);
    if (temp === 0) {
      i += 1;
      continue;
    }
    if (len === 12) {
      toShift = 0;
    } else {
      toShift = 5 * (12 - len) - 1;
    }
    temp = Long.fromValue(temp, true).shiftLeft(toShift);

    res = Long.fromValue(res, true).or(temp);
    len += 1;
    i += 1;
  }

  return res;
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * invoked the snap.
 * @param temp - Some param.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
function stringFromUInt64T(temp: any): string {
  const charmap = '.12345abcdefghijklmnopqrstuvwxyz'.split('');

  const str = new Array(13);
  str[12] = charmap[Long.fromValue(temp, true).and(0x0f)];

  let updTemp = Long.fromValue(temp, true).shiftRight(4);
  for (let i = 1; i <= 12; i++) {
    const charStr = charmap[Long.fromValue(updTemp, true).and(0x1f)];
    str[12 - i] = charStr;
    updTemp = Long.fromValue(updTemp, true).shiftRight(5);
  }
  let result = str.join('');
  if (result.length > 12) {
    result = result.substring(0, 12);
  }
  return result;
}
