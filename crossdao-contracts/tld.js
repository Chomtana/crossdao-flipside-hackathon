var ethers = require('ethers')
var dotenv = require('dotenv')

// console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('attest')))
// console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('revoke')))

const ROOT =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

dotenv.config()

console.log(process.env.TLD)

console.log(
  ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [ROOT, ethers.utils.keccak256(ethers.utils.toUtf8Bytes(process.env.TLD))],
  ),
)
console.log(ethers.utils.namehash(process.env.TLD))

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(process.env.TLD)))

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('register')))
console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('renew')))
console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('takeover')))

console.log('earth.838earth.bored')
let earth = ethers.utils.solidityKeccak256(
  ['bytes32', 'bytes32'],
  [ROOT, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('bored'))],
)

earth = ethers.utils.solidityKeccak256(
  ['bytes32', 'bytes32'],
  [earth, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('838earth'))],
)

earth = ethers.utils.solidityKeccak256(
  ['bytes32', 'bytes32'],
  [earth, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('earth'))],
)

console.log(earth)

console.log('addr.reverse')
let reverse = ethers.utils.solidityKeccak256(
  ['bytes32', 'bytes32'],
  [ROOT, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('reverse'))],
)

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('reverse')))
console.log(reverse)

let addrReverse = ethers.utils.solidityKeccak256(
  ['bytes32', 'bytes32'],
  [reverse, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('addr'))],
)

console.log(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('addr')))
console.log(addrReverse)

{
  console.log('axl.axelar.op')
  let op = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [ROOT, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('op'))],
  )

  console.log(op)

  axelar = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [op, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('axelar'))],
  )

  console.log(axelar)

  axl = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [axelar, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('axl'))],
  )

  console.log(axl)

  gateway = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [axelar, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('gateway'))],
  )

  console.log(gateway)

  gasservice = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [axelar, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('gasservice'))],
  )

  console.log(gasservice)

  resolver = ethers.utils.solidityKeccak256(
    ['bytes32', 'bytes32'],
    [axelar, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('resolver'))],
  )

  console.log(resolver)
}
