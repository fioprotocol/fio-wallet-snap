const base58 = require('bs58')
const assert = require('assert')

const hash = require('./hash');

module.exports = {
    checkEncode,
    checkDecode
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

/**
  @arg {Buffer} keyString data
  @arg {string} keyType = sha256x2, K1, etc
  @return {string} checksum encoded base58 string
*/
function checkDecode(keyString, keyType = null) {
    assert(keyString != null, 'private key expected')
    const buffer = Buffer.from(base58.decode(keyString))
    const checksum = buffer.subarray(-4)
    const key = buffer.subarray(0, -4)

    let newCheck
    if (keyType === 'sha256x2') { // legacy
        newCheck = hash.sha256(hash.sha256(key)).slice(0, 4) // WIF (legacy)
    } else {
        const check = [key]
        if (keyType) {
            check.push(Buffer.from(keyType))
        }
        newCheck = hash.ripemd160(Buffer.concat(check)).slice(0, 4) //PVT
    }

    if (checksum.toString() !== newCheck.toString()) {
        throw new Error('Invalid checksum, ' +
            `${checksum.toString('hex')} != ${newCheck.toString('hex')}`
        )
    }

    return key
}
