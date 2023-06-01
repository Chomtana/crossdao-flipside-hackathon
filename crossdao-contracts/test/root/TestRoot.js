const Root = artifacts.require('./Root.sol')
const ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry.sol')

const { exceptions, evm } = require('@ensdomains/test-utils')
const namehash = require('eth-ens-namehash')
const sha3 = require('js-sha3').keccak_256

const OPERATOR_PRIVATE_KEY =
  '0x350eb01e05065a387df6c36c2fc290cf74cc5fbe2079f3a82c41e5dc7ffbae00'
const OPERATOR_ADDRESS = '0x18d469c50C2481eCbC7F35e39E8AbA8f5862eEC3'

const TOPIC_LOCK = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('lock'))
const TOPIC_EXECUTE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('execute'),
)
const TOPIC_TRANSFER_OWNERSHIP = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('transferOwnership'),
)
const TOPIC_SET_CONTROLLER = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('setController'),
)

contract('Root', function (accounts) {
  let node
  let ens, root

  let now = Math.round(new Date().getTime() / 1000)

  function generateSignature(topic, nonce, digestIn) {
    // Define the input types and values of the transaction data
    const inputTypes = [
      'bytes1',
      'bytes1',
      'address',
      'bytes32',
      'uint256',
      'bytes32',
    ]
    const inputValues = ['0x19', '0x00', root.address, topic, nonce, digestIn]

    // ABI-encode the transaction data
    const digest = ethers.utils.solidityKeccak256(inputTypes, inputValues)

    // console.log(
    //   digest,
    //   controller.address,
    //   network.config.chainId,
    //   isTakeover
    //     ? '0x0548274c4be004976424de9f6f485fbe40a8f13e41524cd574fead54e448415c'
    //     : '0xdd007bd789f73e08c2714644c55b11c7d202931d717def434e3c9caa12a9f583',
    //   commitment,
    // )

    const signingKey = new ethers.utils.SigningKey(OPERATOR_PRIVATE_KEY)
    const signature = signingKey.signDigest(digest)

    return ethers.utils.hexlify(
      ethers.utils.concat([
        signature.r,
        signature.s,
        ethers.utils.hexlify(signature.v),
      ]),
    )
  }

  beforeEach(async function () {
    node = namehash.hash('eth')

    root = await Root.new(OPERATOR_ADDRESS)
    ens = await ENS.new(root.address)

    await root.setController(
      accounts[1],
      true,
      generateSignature(
        TOPIC_SET_CONTROLLER,
        0,
        ethers.utils.solidityKeccak256(
          ['address', 'bool'],
          [accounts[1], true],
        ),
      ),
    )
  })

  describe('setSubnodeOwner', async () => {
    it('should allow controllers to set subnodes', async () => {
      await root.setSubnodeOwner(ens.address, '0x' + sha3('eth'), accounts[2], {
        from: accounts[1],
      })
      assert.equal(accounts[2], await ens.owner(node))
    })

    it('should fail when non-controller tries to set subnode', async () => {
      await exceptions.expectFailure(
        root.setSubnodeOwner(ens.address, '0x' + sha3('eth'), accounts[1], {
          from: accounts[0],
        }),
      )
    })

    it('should allow owner to use execute to set subnodes', async () => {
      const iface = new ethers.utils.Interface([
        'function setSubnodeOwner(bytes32,bytes32,address) returns (bytes32)',
      ])
      const calldata = iface.encodeFunctionData('setSubnodeOwner', [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x' + sha3('eth'),
        accounts[2],
      ])

      console.log(calldata)

      await root.execute(
        ens.address,
        calldata,
        generateSignature(
          TOPIC_EXECUTE,
          1,
          ethers.utils.solidityKeccak256(
            ['address', 'bytes'],
            [ens.address, calldata],
          ),
        ),
        {
          from: accounts[1],
        },
      )
      assert.equal(accounts[2], await ens.owner(node))
    })

    it('should not allow setting a locked TLD', async () => {
      await root.lock(
        '0x' + sha3('eth'),
        generateSignature(TOPIC_LOCK, 1, '0x' + sha3('eth')),
      )
      await exceptions.expectFailure(
        root.setSubnodeOwner(ens.address, '0x' + sha3('eth'), accounts[1], {
          from: accounts[1],
        }),
      )
    })

    it('should allow to transfer ownership', async () => {
      await root.transferOwnership(
        accounts[2],
        generateSignature(
          TOPIC_TRANSFER_OWNERSHIP,
          1,
          ethers.utils.solidityKeccak256(['address'], [accounts[2]]),
        ),
      )
      assert.equal(accounts[2], await root.owner())
    })
  })
})
