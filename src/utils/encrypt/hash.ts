import createHash from 'create-hash';
import createHmac from 'create-hmac';

/** @namespace hash */

/** @arg {string|Buffer} data
    @arg {string} [resultEncoding = null] - 'hex', 'binary' or 'base64'
    @return {string|Buffer} - Buffer when resultEncoding is null, or string
*/

export const sha256 = (data: any, resultEncoding?: any) => {
  if (resultEncoding) {
    return createHash('sha256').update(data).digest(resultEncoding);
  }
  return createHash('sha256').update(data).digest();
};

/** @arg {string|Buffer} data
    @arg {string} [resultEncoding = null] - 'hex', 'binary' or 'base64'
    @return {string|Buffer} - Buffer when resultEncoding is null, or string
*/

export const sha512 = (data: any, resultEncoding?: any) => {
  if (resultEncoding) {
    return createHash('sha512').update(data).digest(resultEncoding);
  }
  return createHash('sha512').update(data).digest();
};

export const HmacSHA256 = (buffer, secret) => {
  return createHmac('sha256', secret).update(buffer).digest();
};

export const ripemd160 = (data: any, hex?: any) => {
  try {
    if (hex) {
      return createHash('rmd160').update(data).digest(hex);
    }
    return createHash('rmd160').update(data).digest();
  } catch (e) {
    return createHash('ripemd160').update(data).digest();
  }
};
