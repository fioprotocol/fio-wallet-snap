var assert = require('assert') // from https://github.com/bitcoinjs/bitcoinjs-lib
var enforceType = require('./enforce_types')

var BigInteger = require('bigi')

function ECSignature(r, s) {
  enforceType(BigInteger, r)
  enforceType(BigInteger, s)

  function toDER() {
    var rBa = r.toDERInteger()
    var sBa = s.toDERInteger()

    var sequence = []

    // INTEGER
    sequence.push(0x02, rBa.length)
    sequence = sequence.concat(rBa)

    // INTEGER
    sequence.push(0x02, sBa.length)
    sequence = sequence.concat(sBa)

    // SEQUENCE
    sequence.unshift(0x30, sequence.length)

    return Buffer.from(sequence)
  }

  return { r, s, toDER }
}

module.exports = ECSignature
