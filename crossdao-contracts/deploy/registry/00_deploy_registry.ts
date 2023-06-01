import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log('starting')
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, run } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const root = await ethers.getContract('Root')

  await deploy('ENSRegistry', {
    from: deployer,
    args: [root.address],
    log: true,
  })

  return true
}

func.id = 'ens'
func.tags = ['registry', 'ENSRegistry']
func.dependencies = ['Root']

export default func
