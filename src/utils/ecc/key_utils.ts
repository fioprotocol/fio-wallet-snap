const base58 = require('bs58')
const assert = require('assert')

const hash = require('./hash');

module.exports = {
    checkEncode
}


/**
  @arg {Buffer} keyBuffer data
  @arg {string} keyType = sha256x2, K1, etc
  @return {string} checksum encoded base58 string
*/
function checkEncode(keyBuffer, keyType = null) {
    assert(Buffer.isBuffer(keyBuffer), 'expecting keyBuffer<Buffer>')
    if (keyType === 'sha256x2') { // legacy
        const checksum = hash.sha256(hash.sha256(keyBuffer)).slice(0, 4)
        return base58.encode(Buffer.concat([keyBuffer, checksum]))
    } else {
        const check = [keyBuffer]
        if (keyType) {
            check.push(Buffer.from(keyType))
        }
        const checksum = hash.ripemd160(Buffer.concat(check)).slice(0, 4)
        return base58.encode(Buffer.concat([keyBuffer, checksum]))
    }
}
