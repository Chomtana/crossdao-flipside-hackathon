import namehash from 'eth-ens-namehash'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { keccak256 } from 'js-sha3'
import { TOPIC_EXECUTE, rootGenerateSignature } from '../root/00_deploy_root'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, fetchIfDifferent } = deployments
  const { deployer, owner } = await getNamedAccounts()

  if (!network.tags.use_root) {
    return true
  }

  const registry = await ethers.getContract('ENSRegistry')
  const root = await ethers.getContract('Root')

  const deployArgs = {
    from: deployer,
    args: [registry.address, namehash.hash(process.env.TLD!)],
    log: true,
  }

  const bri = await deploy('BaseRegistrarImplementation', deployArgs)
  if (!bri.newlyDeployed) return

  const registrar = await ethers.getContract('BaseRegistrarImplementation')

  const iface = new ethers.utils.Interface([
    'function setSubnodeOwner(bytes32,bytes32,address) returns (bytes32)',
  ])
  const calldata = iface.encodeFunctionData('setSubnodeOwner', [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x' + keccak256(process.env.TLD!),
    registrar.address,
  ])

  const nonce = 0

  const tx2 = await root
    .connect(await ethers.getSigner(owner))
    .execute(
      registry.address,
      calldata,
      rootGenerateSignature(
        root.address,
        TOPIC_EXECUTE,
        nonce,
        ethers.utils.solidityKeccak256(
          ['address', 'bytes'],
          [registry.address, calldata],
        ),
      ),
    )
  console.log(
    `Setting owner of ${process.env.TLD!} node to registrar on root (tx: ${
      tx2.hash
    })...`,
  )
  await tx2.wait()
}

func.id = 'registrar'
func.tags = ['ethregistrar', 'BaseRegistrarImplementation']
func.dependencies = ['registry', 'root']

export default func
