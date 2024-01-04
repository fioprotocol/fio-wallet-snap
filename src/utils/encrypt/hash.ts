import createHash, { encoding } from 'create-hash';
import createHmac from 'create-hmac';

export const sha256 = (data: Buffer, resultEncoding?: encoding) => {
  if (resultEncoding) {
    return createHash('sha256').update(data).digest(resultEncoding);
  }
  return createHash('sha256').update(data).digest();
};

export const sha512 = (data: string | Buffer, resultEncoding?: encoding) => {
  if (resultEncoding) {
    return createHash('sha512').update(data).digest(resultEncoding);
  }
  return createHash('sha512').update(data).digest();
};

export const HmacSHA256 = (buffer: Buffer, secret: Buffer) => {
  return createHmac('sha256', secret).update(buffer).digest();
};

export const ripemd160 = (data: string | Buffer, hex?: encoding) => {
  try {
    if (hex) {
      return createHash('rmd160').update(data).digest(hex);
    }
    return createHash('rmd160').update(data).digest();
  } catch (e) {
    if (hex) {
      return createHash('rmd160').update(data).digest(hex);
    }
    return createHash('ripemd160').update(data).digest();
  }
};
