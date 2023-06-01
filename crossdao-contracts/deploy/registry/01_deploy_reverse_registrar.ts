import { namehash } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { keccak256 } from 'js-sha3'
import { rootGenerateSignature, TOPIC_EXECUTE } from '../root/00_deploy_root'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  const deployArgs = {
    from: deployer,
    args: [registry.address],
    log: true,
  }
  const reverseRegistrar = await deploy('ReverseRegistrar', deployArgs)
  if (!reverseRegistrar.newlyDeployed) return

  if (owner !== deployer) {
    const r = await ethers.getContract('ReverseRegistrar', deployer)
    const tx = await r.transferOwnership(owner)
    console.log(
      `Transferring ownership of ReverseRegistrar to ${owner} (tx: ${tx.hash})...`,
    )
    await tx.wait()
  }

  // Only attempt to make controller etc changes directly on testnets
  if (network.name === 'mainnet') return

  const root = await ethers.getContract('Root')

  const iface = new ethers.utils.Interface([
    'function setSubnodeOwner(bytes32,bytes32,address) returns (bytes32)',
  ])
  const calldata = iface.encodeFunctionData('setSubnodeOwner', [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x' + keccak256('reverse'),
    root.address,
  ])

  let nonce = 1

  const tx1 = await root
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
  console.log(`Setting owner of .reverse to owner on root (tx: ${tx1.hash})...`)
  await tx1.wait()

  nonce++

  const calldata2 = iface.encodeFunctionData('setSubnodeOwner', [
    namehash('reverse'),
    '0x' + keccak256('addr'),
    reverseRegistrar.address,
  ])

  const tx2 = await root
    .connect(await ethers.getSigner(owner))
    .execute(
      registry.address,
      calldata2,
      rootGenerateSignature(
        root.address,
        TOPIC_EXECUTE,
        nonce,
        ethers.utils.solidityKeccak256(
          ['address', 'bytes'],
          [registry.address, calldata2],
        ),
      ),
    )
  console.log(
    `Setting owner of .addr.reverse to ReverseRegistrar on registry (tx: ${tx2.hash})...`,
  )
  await tx2.wait()
}

func.id = 'reverse-registrar'
func.tags = ['ReverseRegistrar']
func.dependencies = ['root']

export default func
