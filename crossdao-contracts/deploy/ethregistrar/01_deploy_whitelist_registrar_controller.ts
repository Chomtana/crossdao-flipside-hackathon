import { Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { TOPIC_EXECUTE, rootGenerateSignature } from '../root/00_deploy_root'

const { makeInterfaceId } = require('@openzeppelin/test-helpers')

function computeInterfaceId(iface: Interface) {
  return makeInterfaceId.ERC165(
    Object.values(iface.functions).map((frag) => frag.format('sighash')),
  )
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')
  const root = await ethers.getContract('Root')
  const registrar = await ethers.getContract(
    'BaseRegistrarImplementation',
    owner,
  )
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)
  const nameWrapper = await ethers.getContract('OptiDomains', owner)

  const deployArgs = {
    from: deployer,
    args: [
      registrar.address,
      reverseRegistrar.address,
      nameWrapper.address,
      owner,
      0,
      process.env.TLD,
    ],
    log: true,
  }
  const controller = await deploy('WhitelistRegistrarController', deployArgs)
  if (!controller.newlyDeployed) return

  const iface = new ethers.utils.Interface([
    'function setController(address,bool)',
  ])
  const calldata = iface.encodeFunctionData('setController', [
    controller.address,
    true,
  ])

  let nonce = 4

  // console.log(
  //   'WRAPPER OWNER',
  //   await nameWrapper.owner(),
  //   await nameWrapper.signer.getAddress(),
  // )
  // const tx1 = await nameWrapper.setController(controller.address, true)
  const tx1 = await root.execute(
    nameWrapper.address,
    calldata,
    rootGenerateSignature(
      root.address,
      TOPIC_EXECUTE,
      nonce,
      ethers.utils.solidityKeccak256(
        ['address', 'bytes'],
        [nameWrapper.address, calldata],
      ),
    ),
  )
  console.log(
    `Adding WhitelistRegistrarController as a controller of NameWrapper (tx: ${tx1.hash})...`,
  )
  await tx1.wait()

  nonce++

  // const tx2 = await reverseRegistrar.setController(controller.address, true)
  const tx2 = await root.execute(
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
    `Adding WhitelistRegistrarController as a controller of ReverseRegistrar (tx: ${tx2.hash})...`,
  )
  await tx2.wait()

  // const artifact = await deployments.getArtifact('IETHRegistrarController')
  // const interfaceId = computeInterfaceId(new Interface(artifact.abi))
  // const provider = new ethers.providers.StaticJsonRpcProvider(
  //   ethers.provider.connection.url,
  //   {
  //     ...ethers.provider.network,
  //     ensAddress: (await ethers.getContract('ENSRegistry')).address,
  //   },
  // )
  // const resolver = await provider.getResolver(process.env.TLD!)
  // if (resolver === null) {
  //   console.log(
  //     `No resolver set for .${process.env.TLD!}; not setting interface ${interfaceId} for ETH Registrar Controller`,
  //   )
  //   return
  // }
  // const resolverContract = await ethers.getContractAt(
  //   'PublicResolver',
  //   resolver.address,
  // )
  // const tx3 = await resolverContract.setInterface(
  //   ethers.utils.namehash(process.env.TLD!),
  //   interfaceId,
  //   controller.address,
  // )
  // console.log(
  //   `Setting ETHRegistrarController interface ID ${interfaceId} on .${process.env.TLD!} resolver (tx: ${tx3.hash})...`,
  // )
  // await tx3.wait()
}

func.tags = ['ethregistrar', 'ETHRegistrarController']
func.dependencies = [
  'ENSRegistry',
  'Root',
  'BaseRegistrarImplementation',
  'ReverseRegistrar',
  'NameWrapper',
]

export default func
