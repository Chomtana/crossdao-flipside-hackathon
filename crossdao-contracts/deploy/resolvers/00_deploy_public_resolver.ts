import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { rootGenerateSignature, TOPIC_EXECUTE } from '../root/00_deploy_root'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const root = await ethers.getContract('Root', owner)
  const registry = await ethers.getContract('ENSRegistry', owner)
  const nameWrapper = await ethers.getContract('OptiDomains', owner)
  const controller = await ethers.getContract(
    'WhitelistRegistrarController',
    owner,
  )
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)

  const deployArgs = {
    from: deployer,
    args: [
      registry.address,
      nameWrapper.address,
      controller.address,
      reverseRegistrar.address,
    ],
    log: true,
  }
  const publicResolver = await deploy('PublicResolver', deployArgs)
  if (!publicResolver.newlyDeployed) return

  const iface = new ethers.utils.Interface([
    'function setDefaultResolver(address)',
  ])
  const calldata = iface.encodeFunctionData('setDefaultResolver', [
    publicResolver.address,
  ])

  const nonce = 6

  // const tx = await reverseRegistrar.setDefaultResolver(publicResolver.address)
  const tx = await root
    .connect(await ethers.getSigner(owner))
    .execute(
      reverseRegistrar.address,
      calldata,
      rootGenerateSignature(
        root.address,
        TOPIC_EXECUTE,
        nonce,
        ethers.utils.solidityKeccak256(
          ['address', 'bytes'],
          [reverseRegistrar.address, calldata],
        ),
      ),
    )
  console.log(
    `Setting default resolver on ReverseRegistrar to PublicResolver (tx: ${tx.hash})...`,
  )
  await tx.wait()
}

func.id = 'resolver'
func.tags = ['resolvers', 'PublicResolver']
func.dependencies = [
  'registry',
  'ETHRegistrarController',
  'NameWrapper',
  'ReverseRegistrar',
  'Root',
]

export default func
