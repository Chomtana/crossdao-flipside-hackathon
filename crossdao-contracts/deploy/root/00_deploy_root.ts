import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export const TOPIC_LOCK = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('lock'),
)
export const TOPIC_EXECUTE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('execute'),
)
export const TOPIC_TRANSFER_OWNERSHIP = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('transferOwnership'),
)
export const TOPIC_SET_CONTROLLER = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('setController'),
)

export function rootGenerateSignature(
  rootAddress: string,
  topic: string,
  nonce: number,
  digestIn: string,
) {
  // Define the input types and values of the transaction data
  const inputTypes = [
    'bytes1',
    'bytes1',
    'address',
    'bytes32',
    'uint256',
    'bytes32',
  ]
  const inputValues = ['0x19', '0x00', rootAddress, topic, nonce, digestIn]

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

  const signingKey = new ethers.utils.SigningKey(
    process.env.SIGNER_PRIVATE_KEY as string,
  )
  const signature = signingKey.signDigest(digest)

  return ethers.utils.hexlify(
    ethers.utils.concat([
      signature.r,
      signature.s,
      ethers.utils.hexlify(signature.v),
    ]),
  )
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  if (!network.tags.use_root) {
    return true
  }

  await deploy('Root', {
    from: deployer,
    args: [process.env.SIGNER_ACCOUNT],
    log: true,
  })

  const root = await ethers.getContract('Root')

  return true
}

func.id = 'root'
func.tags = ['root', 'Root']
func.dependencies = []

export default func
