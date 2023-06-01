const {
  evm,
  reverse: { getReverseNode },
  contracts: { deploy },
  ens: { FUSES },
} = require('../test-utils')

const { CANNOT_UNWRAP, PARENT_CANNOT_CONTROL, IS_DOT_ETH, CANNOT_TRANSFER } =
  FUSES

const { expect } = require('chai')

const { ethers, network } = require('hardhat')
const provider = ethers.provider
const { namehash, labelhash } = require('../test-utils/ens')
const sha3 = require('web3-utils').sha3
const {
  EMPTY_BYTES32: EMPTY_BYTES,
  EMPTY_ADDRESS: ZERO_ADDRESS,
} = require('../test-utils/constants')
const { BigNumber } = require('ethers')

const DAY = 24 * 60 * 60
const REGISTRATION_TIME = 28 * DAY
// const BUFFERED_REGISTRATION_COST = REGISTRATION_EXPIRATION + 3 * DAY
const BUFFERED_REGISTRATION_COST = 0
const GRACE_PERIOD = 90 * DAY
const NULL_ADDRESS = ZERO_ADDRESS

const OPERATOR_PRIVATE_KEY =
  '0x350eb01e05065a387df6c36c2fc290cf74cc5fbe2079f3a82c41e5dc7ffbae00'
const OPERATOR_ADDRESS = '0x18d469c50C2481eCbC7F35e39E8AbA8f5862eEC3'

contract('WhitelistRegistrarController', function () {
  let ens
  let resolver
  let resolver2 // resolver signed by accounts[1]
  let baseRegistrar
  let controller
  let controller2 // controller signed by accounts[1]
  let priceOracle
  let reverseRegistrar
  let nameWrapper
  let callData

  const secret =
    '0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
  let ownerSigner
  let ownerAccount // Account that owns the registrar
  let registrantSigner
  let registrantAccount // Account that owns test names
  let accounts = []

  let REGISTRATION_EXPIRATION

  function registerSignature(commitment, isTakeover = false) {
    // Define the input types and values of the transaction data
    const inputTypes = [
      'bytes1',
      'bytes1',
      'address',
      'uint256',
      'bytes32',
      'bytes32',
    ]
    const inputValues = [
      '0x19',
      '0x00',
      controller.address,
      network.config.chainId,
      isTakeover
        ? '0x0548274c4be004976424de9f6f485fbe40a8f13e41524cd574fead54e448415c'
        : '0xdd007bd789f73e08c2714644c55b11c7d202931d717def434e3c9caa12a9f583',
      commitment,
    ]

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

  function renewSignature(name, expiration) {
    const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name))

    // Define the input types and values of the transaction data
    const inputTypes = [
      'bytes1',
      'bytes1',
      'address',
      'uint256',
      'bytes32',
      'bytes32',
      'uint256',
    ]
    const inputValues = [
      '0x19',
      '0x00',
      controller.address,
      network.config.chainId,
      '0xde0eadb8cc1e667dab2d95e011b2f2ae72a64de91e0b652eecb07930f6b2ffaa',
      labelHash,
      expiration,
    ]

    // ABI-encode the transaction data
    const digest = ethers.utils.solidityKeccak256(inputTypes, inputValues)

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

  async function registerName(
    name,
    txOptions = { value: BUFFERED_REGISTRATION_COST },
  ) {
    var commitment = await controller.makeCommitment(
      name,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      NULL_ADDRESS,
      [],
      false,
      0,
    )
    var tx = await controller.commit(commitment)
    // expect(await controller.commitments(commitment)).to.equal(
    //   (await provider.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())

    var tx = await controller.register(
      name,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      NULL_ADDRESS,
      [],
      false,
      0,
      registerSignature(commitment),
      txOptions,
    )

    return tx
  }

  before(async () => {
    const blockTimestamp = (
      await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
    ).timestamp
    REGISTRATION_EXPIRATION = blockTimestamp + REGISTRATION_TIME

    // console.log(blockTimestamp, REGISTRATION_EXPIRATION)

    signers = await ethers.getSigners()
    ownerSigner = signers[0]
    registrantSigner = signers[1]
    ownerAccount = await signers[0].getAddress()
    registrantAccount = await signers[1].getAddress()
    accounts = [ownerAccount, registrantAccount, signers[2].getAddress()]

    ens = await deploy('ENSRegistry', ownerAccount)

    baseRegistrar = await deploy(
      'BaseRegistrarImplementation',
      ens.address,
      namehash('eth'),
    )

    reverseRegistrar = await deploy('ReverseRegistrar', ens.address)

    await ens.setSubnodeOwner(EMPTY_BYTES, sha3('reverse'), accounts[0])
    await ens.setSubnodeOwner(
      namehash('reverse'),
      sha3('addr'),
      reverseRegistrar.address,
    )

    nameWrapper = await deploy(
      'OptiDomains',
      ens.address,
      baseRegistrar.address,
      ownerAccount,
      'eth',
    )

    await ens.setSubnodeOwner(EMPTY_BYTES, sha3('eth'), baseRegistrar.address)

    // const dummyOracle = await deploy('DummyOracle', '100000000')
    // priceOracle = await deploy(
    //   'StablePriceOracle',
    //   dummyOracle.address,
    //   [0, 0, 4, 2, 1],
    // )
    controller = await deploy(
      'WhitelistRegistrarController',
      baseRegistrar.address,
      reverseRegistrar.address,
      nameWrapper.address,
      OPERATOR_ADDRESS,
      0,
      'eth',
    )
    controller2 = controller.connect(signers[1])
    await nameWrapper.setController(controller.address, true)
    await baseRegistrar.addController(nameWrapper.address)
    await baseRegistrar.addController(controller.address) // Takeover implementation required whitelist registrar to be added as a controller
    await reverseRegistrar.setController(controller.address, true)

    resolver = await deploy(
      'PublicResolver',
      ens.address,
      nameWrapper.address,
      controller.address,
      reverseRegistrar.address,
    )

    callData = [
      resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
        namehash('newconfigname.eth'),
        registrantAccount,
      ]),
      resolver.interface.encodeFunctionData('setText', [
        namehash('newconfigname.eth'),
        'url',
        'ethereum.com',
      ]),
    ]

    resolver2 = await resolver.connect(signers[1])

    // Patch commit
    controller.commit = async () => {}
    controller2.commit = async () => {}
  })

  beforeEach(async () => {
    result = await ethers.provider.send('evm_snapshot')
  })
  afterEach(async () => {
    await ethers.provider.send('evm_revert', [result])
  })

  const checkLabels = {
    testing: true,
    longname12345678: true,
    sixsix: true,
    five5: true,
    four: true,
    iii: true,
    ii: false,
    i: false,
    '': false,

    // { ni } { hao } { ma } (chinese; simplified)
    你好吗: true,

    // { ta } { ko } (japanese; hiragana)
    たこ: false,

    // { poop } { poop } { poop } (emoji)
    '\ud83d\udca9\ud83d\udca9\ud83d\udca9': true,

    // { poop } { poop } (emoji)
    '\ud83d\udca9\ud83d\udca9': false,
  }

  it('should report label validity', async () => {
    for (const label in checkLabels) {
      expect(await controller.valid(label)).to.equal(checkLabels[label], label)
    }
  })

  it('should report unused names as available', async () => {
    expect(await controller.available(sha3('available'))).to.equal(true)
  })

  it('should permit new registrations', async () => {
    const name = 'newname'
    const balanceBefore = await web3.eth.getBalance(controller.address)
    const tx = await registerName(name)
    const block = await provider.getBlock(tx.blockNumber)
    await expect(tx)
      .to.emit(controller, 'NameRegistered')
      .withArgs(
        name,
        sha3(name),
        registrantAccount,
        0,
        0,
        REGISTRATION_EXPIRATION,
      )

    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)
  })

  // it('should revert when not enough ether is transferred', async () => {
  //   await expect(registerName('newname', { value: 0 })).to.be.revertedWith(
  //     'InsufficientValue()',
  //   )
  // })

  it('should report registered names as unavailable', async () => {
    const name = 'newname'
    await registerName(name)
    expect(await controller.available(name)).to.equal(false)
  })

  it('should permit new registrations with resolver and records', async () => {
    var commitment = await controller2.makeCommitment(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
    )
    var tx = await controller2.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())
    var balanceBefore = await web3.eth.getBalance(controller.address)
    var tx = await controller2.register(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    const block = await provider.getBlock(tx.blockNumber)

    await expect(tx)
      .to.emit(controller, 'NameRegistered')
      .withArgs(
        'newconfigname',
        sha3('newconfigname'),
        registrantAccount,
        0,
        0,
        REGISTRATION_EXPIRATION,
      )

    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)

    var nodehash = namehash('newconfigname.eth')
    expect(await ens.resolver(nodehash)).to.equal(resolver.address)
    expect(await ens.owner(nodehash)).to.equal(nameWrapper.address)
    expect(await baseRegistrar.ownerOf(sha3('newconfigname'))).to.equal(
      nameWrapper.address,
    )
    expect(await resolver['addr(bytes32)'](nodehash)).to.equal(
      registrantAccount,
    )
    expect(await resolver['text'](nodehash, 'url')).to.equal('ethereum.com')
    expect(await nameWrapper.ownerOf(nodehash)).to.equal(registrantAccount)
  })

  it('should not permit new registrations with 0 resolver', async () => {
    await expect(
      controller.makeCommitment(
        'newconfigname',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        NULL_ADDRESS,
        callData,
        false,
        0,
      ),
    ).to.be.revertedWith('ResolverRequiredWhenDataSupplied()')
  })

  it('should not permit new registrations with EoA resolver', async () => {
    const commitment = await controller.makeCommitment(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      registrantAccount,
      callData,
      false,
      0,
    )

    const tx = await controller.commit(commitment)
    // expect(await controller.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await expect(
      controller.register(
        'newconfigname',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        registrantAccount,
        callData,
        false,
        0,
        registerSignature(commitment),
        { value: BUFFERED_REGISTRATION_COST },
      ),
    ).to.be.reverted
  })

  it('should not permit new registrations with an incompatible contract', async () => {
    const commitment = await controller.makeCommitment(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      controller.address,
      callData,
      false,
      0,
    )

    const tx = await controller.commit(commitment)
    // expect(await controller.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await expect(
      controller.register(
        'newconfigname',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        controller.address,
        callData,
        false,
        0,
        registerSignature(commitment),
        { value: BUFFERED_REGISTRATION_COST },
      ),
    ).to.be.revertedWith(
      "Transaction reverted: function selector was not recognized and there's no fallback function",
    )
  })

  it('should not permit new registrations with records updating a different name', async () => {
    const commitment = await controller2.makeCommitment(
      'awesome',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          namehash('othername.eth'),
          registrantAccount,
        ]),
      ],
      false,
      0,
    )
    const tx = await controller2.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())

    await expect(
      controller2.register(
        'awesome',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        resolver.address,
        [
          resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
            namehash('othername.eth'),
            registrantAccount,
          ]),
        ],
        false,
        0,
        registerSignature(commitment),
        { value: BUFFERED_REGISTRATION_COST },
      ),
    ).to.be.revertedWith('multicall: All records must have a matching namehash')
  })

  it('should not permit new registrations with any record updating a different name', async () => {
    const commitment = await controller2.makeCommitment(
      'awesome',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          namehash('awesome.eth'),
          registrantAccount,
        ]),
        resolver.interface.encodeFunctionData(
          'setText(bytes32,string,string)',
          [namehash('other.eth'), 'url', 'ethereum.com'],
        ),
      ],
      false,
      0,
    )
    const tx = await controller2.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())

    await expect(
      controller2.register(
        'awesome',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        resolver.address,
        [
          resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
            namehash('awesome.eth'),
            registrantAccount,
          ]),
          resolver.interface.encodeFunctionData(
            'setText(bytes32,string,string)',
            [namehash('other.eth'), 'url', 'ethereum.com'],
          ),
        ],
        false,
        0,
        registerSignature(commitment),
        { value: BUFFERED_REGISTRATION_COST },
      ),
    ).to.be.revertedWith('multicall: All records must have a matching namehash')
  })

  it('should permit a registration with resolver but no records', async () => {
    const commitment = await controller.makeCommitment(
      'newconfigname2',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      false,
      0,
    )
    let tx = await controller.commit(commitment)
    // expect(await controller.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    const balanceBefore = await web3.eth.getBalance(controller.address)
    let tx2 = await controller.register(
      'newconfigname2',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      false,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    const block = await provider.getBlock(tx2.blockNumber)

    await expect(tx2)
      .to.emit(controller, 'NameRegistered')
      .withArgs(
        'newconfigname2',
        sha3('newconfigname2'),
        registrantAccount,
        0,
        0,
        REGISTRATION_EXPIRATION,
      )

    const nodehash = namehash('newconfigname2.eth')
    expect(await ens.resolver(nodehash)).to.equal(resolver.address)
    expect(await resolver['addr(bytes32)'](nodehash)).to.equal(NULL_ADDRESS)
    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)
  })

  it('should include the owner in the commitment', async () => {
    const commitment = await controller.makeCommitment(
      'newname2',
      accounts[2],
      REGISTRATION_EXPIRATION,
      secret,
      NULL_ADDRESS,
      [],
      false,
      0,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await expect(
      controller.register(
        'newname2',
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        NULL_ADDRESS,
        [],
        false,
        0,
        registerSignature(commitment),
        {
          value: BUFFERED_REGISTRATION_COST,
        },
      ),
    ).to.be.reverted
  })

  it('should reject duplicate registrations', async () => {
    const label = 'newname'
    await registerName(label)
    const commitment = await controller.makeCommitment(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      NULL_ADDRESS,
      [],
      false,
      0,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await expect(
      controller.register(
        label,
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        NULL_ADDRESS,
        [],
        false,
        0,
        registerSignature(commitment),
        {
          value: BUFFERED_REGISTRATION_COST,
        },
      ),
    ).to.be.revertedWith(`NameNotAvailable("${label}")`)
  })

  // it('should reject for expired commitments', async () => {
  //   const commitment = await controller.makeCommitment(
  //     'newname2',
  //     registrantAccount,
  //     REGISTRATION_EXPIRATION,
  //     secret,
  //     NULL_ADDRESS,
  //     [],
  //     false,
  //     0,
  //   )
  //   await controller.commit(commitment)

  //   await evm.advanceTime((await controller.maxCommitmentAge()).toNumber() + 1)
  //   await expect(
  //     controller.register(
  //       'newname2',
  //       registrantAccount,
  //       REGISTRATION_EXPIRATION,
  //       secret,
  //       NULL_ADDRESS,
  //       [],
  //       false,
  //       0,
  //       {
  //         value: BUFFERED_REGISTRATION_COST,
  //       },
  //     ),
  //   ).to.be.revertedWith(`CommitmentTooOld("${commitment}")`)
  // })

  it('should allow anyone to renew a name without changing fuse expiry', async () => {
    await registerName('newname')
    var nodehash = namehash('newname.eth')
    var fuseExpiry = (await nameWrapper.getData(nodehash))[2]
    var expires = await baseRegistrar.nameExpires(sha3('newname'))
    var balanceBefore = await web3.eth.getBalance(controller.address)
    const duration = 86400
    const expiration = REGISTRATION_EXPIRATION + duration
    // const [price] = await controller.rentPrice(sha3('newname'), duration)
    await controller.renew(
      'newname',
      expiration,
      renewSignature('newname', expiration),
      { value: 0 },
    )
    var newExpires = await baseRegistrar.nameExpires(sha3('newname'))
    var newFuseExpiry = (await nameWrapper.getData(nodehash))[2]
    expect(newExpires.toNumber() - expires.toNumber()).to.equal(duration)
    expect(newFuseExpiry.toNumber() - fuseExpiry.toNumber()).to.equal(86400)

    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)
  })

  it('should allow token owners to renew a name', async () => {
    const CANNOT_UNWRAP = 1
    const PARENT_CANNOT_CONTROL = 64

    await registerName('newname')
    var nodehash = namehash('newname.eth')
    const [, fuses, fuseExpiry] = await nameWrapper.getData(nodehash)

    var expires = await baseRegistrar.nameExpires(sha3('newname'))
    var balanceBefore = await web3.eth.getBalance(controller.address)
    const duration = 86400
    const expiration = REGISTRATION_EXPIRATION + duration
    // const [price] = await controller.rentPrice(sha3('newname'), duration)
    await controller2.renew(
      'newname',
      expiration,
      renewSignature('newname', expiration),
      { value: 0 },
    )
    var newExpires = await baseRegistrar.nameExpires(sha3('newname'))
    const [, newFuses, newFuseExpiry] = await nameWrapper.getData(nodehash)
    expect(newExpires.toNumber() - expires.toNumber()).to.equal(duration)
    expect(newFuseExpiry.toNumber() - fuseExpiry.toNumber()).to.equal(duration)
    expect(newFuses).to.equal(fuses)
    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)
  })

  it('non wrapped names can renew', async () => {
    const blockTimestamp = (
      await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
    ).timestamp

    const label = 'newname'
    const tokenId = sha3(label)
    const nodehash = namehash(`${label}.eth`)
    // this is to allow user to register without namewrapped
    await baseRegistrar.addController(ownerAccount)
    await baseRegistrar.register(
      tokenId,
      ownerAccount,
      REGISTRATION_EXPIRATION - blockTimestamp,
    )

    expect(await nameWrapper.ownerOf(nodehash)).to.equal(ZERO_ADDRESS)
    expect(await baseRegistrar.ownerOf(tokenId)).to.equal(ownerAccount)

    var expires = await baseRegistrar.nameExpires(tokenId)
    const duration = 86400
    const expiration = REGISTRATION_EXPIRATION + duration
    // const [price] = await controller.rentPrice(tokenId, duration)
    await controller.renew(
      label,
      expiration,
      renewSignature(label, expiration),
      { value: 0 },
    )

    expect(await baseRegistrar.ownerOf(tokenId)).to.equal(ownerAccount)
    expect(await nameWrapper.ownerOf(nodehash)).to.equal(ZERO_ADDRESS)
    var newExpires = await baseRegistrar.nameExpires(tokenId)
    expect(
      Math.abs(newExpires.toNumber() - expires.toNumber() - duration),
    ).to.lessThanOrEqual(20)
  })

  // it('should require sufficient value for a renewal', async () => {
  //   await expect(controller.renew('name', 86400)).to.be.revertedWith(
  //     'InsufficientValue()',
  //   )
  // })

  it('should allow anyone to withdraw funds and transfer to the registrar owner', async () => {
    await controller.withdraw({ from: ownerAccount })
    expect(parseInt(await web3.eth.getBalance(controller.address))).to.equal(0)
  })

  it('should set the reverse record of the account', async () => {
    const commitment = await controller.makeCommitment(
      'reverse',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      0,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await controller.register(
      'reverse',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    expect(await resolver.name(getReverseNode(ownerAccount))).to.equal(
      'reverse.eth',
    )
  })

  it('should not set the reverse record of the account when set to false', async () => {
    const commitment = await controller.makeCommitment(
      'noreverse',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      false,
      0,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await controller.register(
      'noreverse',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      false,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    expect(await resolver.name(getReverseNode(ownerAccount))).to.equal('')
  })

  it('should auto wrap the name and set the ERC721 owner to the wrapper', async () => {
    const label = 'wrapper'
    const name = label + '.eth'
    const commitment = await controller.makeCommitment(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      0,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await controller.register(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    expect(await nameWrapper.ownerOf(namehash(name))).to.equal(
      registrantAccount,
    )

    expect(await ens.owner(namehash(name))).to.equal(nameWrapper.address)
    expect(await baseRegistrar.ownerOf(sha3(label))).to.equal(
      nameWrapper.address,
    )
  })

  it('should auto wrap the name and allow fuses and expiry to be set', async () => {
    const MAX_INT_64 = 2n ** 64n - 1n
    const label = 'fuses'
    const name = label + '.eth'
    const commitment = await controller.makeCommitment(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      1,
    )
    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    const tx = await controller.register(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [],
      true,
      1,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    const block = await provider.getBlock(tx.block)

    const [, fuses, expiry] = await nameWrapper.getData(namehash(name))
    expect(fuses).to.equal(PARENT_CANNOT_CONTROL | CANNOT_UNWRAP | IS_DOT_ETH)
    expect(expiry).to.equal(REGISTRATION_EXPIRATION + GRACE_PERIOD)
  })

  it('approval should reduce gas for registration', async () => {
    const label = 'other'
    const name = label + '.eth'
    const node = namehash(name)
    const commitment = await controller.makeCommitment(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          node,
          registrantAccount,
        ]),
      ],
      true,
      1,
    )

    await controller.commit(commitment)

    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())

    const gasA = await controller2.estimateGas.register(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          node,
          registrantAccount,
        ]),
      ],
      true,
      1,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    await resolver2.setApprovalForAll(controller.address, true)

    const gasB = await controller2.estimateGas.register(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver2.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          node,
          registrantAccount,
        ]),
      ],
      true,
      1,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    const tx = await controller2.register(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver2.address,
      [
        resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
          node,
          registrantAccount,
        ]),
      ],
      true,
      1,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    console.log((await tx.wait()).gasUsed.toString())

    console.log(gasA.toString(), gasB.toString())

    expect(await nameWrapper.ownerOf(node)).to.equal(registrantAccount)
    expect(await ens.owner(namehash(name))).to.equal(nameWrapper.address)
    expect(await baseRegistrar.ownerOf(sha3(label))).to.equal(
      nameWrapper.address,
    )
    expect(await resolver2['addr(bytes32)'](node)).to.equal(registrantAccount)
  })

  it('should not permit new registrations with non resolver function calls', async () => {
    const label = 'newconfigname'
    const name = `${label}.eth`
    const node = namehash(name)
    const secondTokenDuration = 788400000 // keep bogus NFT for 25 years;
    const callData = [
      baseRegistrar.interface.encodeFunctionData(
        'register(uint256,address,uint)',
        [node, registrantAccount, secondTokenDuration],
      ),
    ]
    var commitment = await controller.makeCommitment(
      label,
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      baseRegistrar.address,
      callData,
      false,
      0,
    )
    var tx = await controller.commit(commitment)
    // expect(await controller.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )
    // await evm.advanceTime((await controller.minCommitmentAge()).toNumber())
    await expect(
      controller.register(
        label,
        registrantAccount,
        REGISTRATION_EXPIRATION,
        secret,
        baseRegistrar.address,
        callData,
        false,
        0,
        registerSignature(commitment),
        { value: BUFFERED_REGISTRATION_COST },
      ),
    ).to.be.revertedWith(
      "Transaction reverted: function selector was not recognized and there's no fallback function",
    )
  })

  it("should allow take over of domain name even through it hasn't expired yet", async () => {
    // Do basic registration test first
    const calldataBefore = [
      resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
        namehash('takeovername.eth'),
        ownerAccount,
      ]),
      resolver.interface.encodeFunctionData('setText', [
        namehash('takeovername.eth'),
        'url',
        'opti.domains',
      ]),
    ]

    var commitment = await controller2.makeCommitment(
      'takeovername',
      ownerAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      calldataBefore,
      false,
      0,
    )
    var tx = await controller2.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())
    var balanceBefore = await web3.eth.getBalance(controller.address)
    var tx = await controller2.register(
      'takeovername',
      ownerAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      calldataBefore,
      false,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    await expect(tx)
      .to.emit(controller, 'NameRegistered')
      .withArgs(
        'takeovername',
        sha3('takeovername'),
        ownerAccount,
        0,
        0,
        REGISTRATION_EXPIRATION,
      )

    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)

    var nodehash = namehash('takeovername.eth')
    expect(await ens.resolver(nodehash)).to.equal(resolver.address)
    expect(await ens.owner(nodehash)).to.equal(nameWrapper.address)
    expect(await baseRegistrar.ownerOf(sha3('takeovername'))).to.equal(
      nameWrapper.address,
    )
    expect(await resolver['addr(bytes32)'](nodehash)).to.equal(ownerAccount)
    expect(await resolver['text'](nodehash, 'url')).to.equal('opti.domains')
    expect(await nameWrapper.ownerOf(nodehash)).to.equal(ownerAccount)

    const oldExpires = await baseRegistrar.nameExpires(sha3('takeovername'))

    // Registrant takeover domain
    const calldataTakeover = [
      resolver.interface.encodeFunctionData('setAddr(bytes32,address)', [
        namehash('takeovername.eth'),
        registrantAccount,
      ]),
    ]

    var commitmentTakeover = await controller2.makeCommitment(
      'takeovername',
      registrantAccount,
      REGISTRATION_EXPIRATION + 100,
      secret,
      resolver.address,
      calldataTakeover,
      false,
      0,
    )

    // Must revert if not takeover
    expect(
      controller2.register(
        'takeovername',
        registrantAccount,
        REGISTRATION_EXPIRATION + 100,
        secret,
        resolver.address,
        calldataTakeover,
        false,
        0,
        registerSignature(commitmentTakeover),
      ),
    ).to.be.revertedWith('NameNotAvailable("takeovername")')

    // Must be able to takeover
    const takeoverTx = await controller2.register(
      'takeovername',
      registrantAccount,
      REGISTRATION_EXPIRATION + 100,
      secret,
      resolver.address,
      calldataTakeover,
      false,
      0,
      registerSignature(commitmentTakeover, true),
    )

    await expect(takeoverTx)
      .to.emit(controller, 'NameRegistered')
      .withArgs(
        'takeovername',
        sha3('takeovername'),
        registrantAccount,
        0,
        0,
        REGISTRATION_EXPIRATION + 100,
      )

    expect(
      (await web3.eth.getBalance(controller.address)) - balanceBefore,
    ).to.equal(0)

    var nodehash = namehash('takeovername.eth')
    expect(await ens.resolver(nodehash)).to.equal(resolver.address)
    expect(await ens.owner(nodehash)).to.equal(nameWrapper.address)
    expect(await baseRegistrar.ownerOf(sha3('takeovername'))).to.equal(
      nameWrapper.address,
    )
    expect(await resolver['addr(bytes32)'](nodehash)).to.equal(
      registrantAccount,
    )
    expect(await resolver['text'](nodehash, 'url')).to.equal('opti.domains')
    expect(await nameWrapper.ownerOf(nodehash)).to.equal(registrantAccount)

    const newExpires = await baseRegistrar.nameExpires(sha3('takeovername'))
    expect(newExpires.toNumber() - oldExpires.toNumber()).to.equal(100)
  })

  // Test base fuses
  it('Should become soulbound if baseFuses is set to CANNOT_TRANSFER | CANNOT_UNWRAP', async () => {
    await (
      await controller.setBaseFuses(CANNOT_TRANSFER | CANNOT_UNWRAP)
    ).wait()

    var commitment = await controller2.makeCommitment(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
    )
    var tx = await controller2.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())
    var tx = await controller2.register(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
      registerSignature(commitment),
      { value: BUFFERED_REGISTRATION_COST },
    )

    await tx.wait()

    const newconfig_namehash = namehash('newconfigname.eth')

    // Should revert if try to transfer
    expect(
      nameWrapper
        .connect(registrantSigner)
        ['safeTransferFrom(address,address,uint256,uint256,bytes)'](
          registrantAccount,
          ownerAccount,
          newconfig_namehash,
          1,
          '0x',
        ),
    ).to.be.revertedWith(`OperationProhibited("${newconfig_namehash}")`)

    // Should revert if approve to another entity and transfer
    await (
      await nameWrapper
        .connect(registrantSigner)
        .setApprovalForAll(ownerAccount, true)
    ).wait()

    expect(
      nameWrapper
        .connect(ownerSigner)
        ['safeTransferFrom(address,address,uint256,uint256,bytes)'](
          registrantAccount,
          ownerAccount,
          newconfig_namehash,
          1,
          '0x',
        ),
    ).to.be.revertedWith(`OperationProhibited("${newconfig_namehash}")`)

    // Should revert if try to unwrap
    expect(
      nameWrapper
        .connect(registrantSigner)
        .unwrapETH2LD(
          labelhash('newconfigname'),
          registrantAccount,
          registrantAccount,
        ),
    ).to.be.revertedWith(`OperationProhibited("${newconfig_namehash}")`)
  })

  // Test supporter plan
  it('Should accept supporter fund if it is set', async () => {
    // Deploy supporter
    const supporterPlan = await deploy(
      'SupporterPlan',
      ethers.utils.parseEther('0.002'),
      namehash('eth'),
    )

    // If no supporter -> donate ETH to the registrar
    await (
      await registerName('nosupporter', {
        value: ethers.utils.parseEther('0.002'),
      })
    ).wait()
    expect(await web3.eth.getBalance(controller.address)).to.equal(
      ethers.utils.parseEther('0.002'),
    )

    // Register supporter
    await (await controller.setSupporterPlan(supporterPlan.address)).wait()
    expect(await controller.supporterPlan()).to.equal(supporterPlan.address)

    const assertSupporter = async (name, supporterBalance, isSupporter) => {
      expect(await web3.eth.getBalance(controller.address)).to.equal(
        ethers.utils.parseEther('0.002'),
      )
      expect(await web3.eth.getBalance(supporterPlan.address)).to.equal(
        ethers.utils.parseEther(supporterBalance),
      )
      expect(await supporterPlan.supporter(name)).to.equal(isSupporter)
      expect(
        await supporterPlan.supporterNamehash(namehash(name + '.eth')),
      ).to.equal(isSupporter)
      expect(await supporterPlan.supporterLabelhash(labelhash(name))).to.equal(
        isSupporter,
      )
    }

    // If supporter but don't buy -> not a supporter
    await (await registerName('notsupport')).wait()
    await assertSupporter('notsupport', '0', false)

    // If supporter and buy -> become a supporter
    await (
      await registerName('supporter1', {
        value: ethers.utils.parseEther('0.002'),
      })
    ).wait()
    await assertSupporter('supporter1', '0.002', true)

    expect(
      registerName('supporter2', { value: ethers.utils.parseEther('0.002') }),
    ).to.be.revertedWith('Not enough ETH')
    await assertSupporter('supporter2', '0.002', false)

    await (
      await registerName('supporter2', {
        value: ethers.utils.parseEther('0.002001'),
      })
    ).wait()
    await assertSupporter('supporter2', '0.004001', true)

    await (
      await registerName('supporter3', {
        value: ethers.utils.parseEther('0.0025'),
      })
    ).wait()
    await assertSupporter('supporter3', '0.006501', true)

    // Disable it
    await (await supporterPlan.toggleEnabled(false)).wait()

    // Nobody can support anymore
    expect(
      registerName('supporter4', { value: ethers.utils.parseEther('0.0025') }),
    ).to.be.revertedWith('New supporters closed')

    await (await registerName('notsupport2')).wait()
    await assertSupporter('notsupport2', '0.006501', false)

    // Enable it
    await (await supporterPlan.toggleEnabled(true)).wait()

    // Supporter comes in again
    await (
      await registerName('supporter4', {
        value: ethers.utils.parseEther('0.0025'),
      })
    ).wait()
    await assertSupporter('supporter4', '0.009001', true)

    // Transfer ownership (Use registrantAccount because ownerAccount paid gas fee)
    await (await supporterPlan.transferOwnership(registrantAccount)).wait()

    // Supporter owner can withdraw fund
    const ownerBalanceBefore = await web3.eth.getBalance(registrantAccount)
    await (await supporterPlan.withdraw()).wait()
    const ownerBalanceAfter = await web3.eth.getBalance(registrantAccount)
    expect(
      BigNumber.from(ownerBalanceAfter)
        .sub(BigNumber.from(ownerBalanceBefore))
        .toString(),
    ).to.equal(ethers.utils.parseEther('0.009001'))
  })

  it('Should has small cost on domain registration', async () => {
    await (await controller.activateCost(true)).wait()

    var commitment = await controller.makeCommitment(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
    )
    var tx = await controller.commit(commitment)
    // expect(await controller2.commitments(commitment)).to.equal(
    //   (await web3.eth.getBlock(tx.blockNumber)).timestamp,
    // )

    // await evm.advanceTime((await controller2.minCommitmentAge()).toNumber())
    var tx = await controller.register(
      'newconfigname',
      registrantAccount,
      REGISTRATION_EXPIRATION,
      secret,
      resolver.address,
      callData,
      false,
      0,
      registerSignature(commitment),
      { value: ethers.utils.parseEther('0.0006') },
    )

    await tx.wait()

    expect(registerName('nofee')).to.be.reverted

    await (
      await registerName('smallfee1', {
        value: ethers.utils.parseEther('0.0004'),
      })
    ).wait()
  })
})
