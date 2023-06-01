import { Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { rootGenerateSignature, TOPIC_EXECUTE } from '../root/00_deploy_root'

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

  const root = await ethers.getContract('Root', owner)
  const registry = await ethers.getContract('ENSRegistry', owner)
  const registrar = await ethers.getContract(
    'BaseRegistrarImplementation',
    owner,
  )
  const metadata = await ethers.getContract('OptiDomainsMetadataService', owner)

  const deployArgs = {
    from: deployer,
    args: [
      registry.address,
      registrar.address,
      metadata.address,
      process.env.TLD,
    ],
    log: true,
  }

  const nameWrapper = await deploy('OptiDomains', deployArgs)
  if (!nameWrapper.newlyDeployed) return

  // Only attempt to make controller etc changes directly on testnets
  if (network.name === 'mainnet') return

  const iface = new ethers.utils.Interface(['function addController(address)'])
  const calldata = iface.encodeFunctionData('addController', [
    nameWrapper.address,
  ])

  const nonce = 3

  // const tx2 = await registrar.addController(nameWrapper.address)
  const tx2 = await root
    .connect(await ethers.getSigner(owner))
    .execute(
      registrar.address,
      calldata,
      rootGenerateSignature(
        root.address,
        TOPIC_EXECUTE,
        nonce,
        ethers.utils.solidityKeccak256(
          ['address', 'bytes'],
          [registrar.address, calldata],
        ),
      ),
    )
  console.log(
    `Adding NameWrapper as controller on registrar (tx: ${tx2.hash})...`,
  )
  await tx2.wait()

  // const artifact = await deployments.getArtifact('INameWrapper')
  // const interfaceId = computeInterfaceId(new Interface(artifact.abi))
  // const providerWithEns = new ethers.providers.StaticJsonRpcProvider(
  //   ethers.provider.connection.url,
  //   { ...ethers.provider.network, ensAddress: registry.address },
  // )
  // const resolver = await providerWithEns.getResolver(process.env.TLD!)
  // if (resolver === null) {
  //   console.log(
  //     `No resolver set for .eth; not setting interface ${interfaceId} for NameWrapper`,
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
  //   nameWrapper.address,
  // )
  // console.log(
  //   `Setting NameWrapper interface ID ${interfaceId} on .eth resolver (tx: ${tx3.hash})...`,
  // )
  // await tx3.wait()
}

func.id = 'name-wrapper'
func.tags = ['wrapper', 'NameWrapper']
func.dependencies = [
  'BaseRegistrarImplementation',
  'OptiDomainsMetadataService',
  'Root',
  'registry',
]

export default func
