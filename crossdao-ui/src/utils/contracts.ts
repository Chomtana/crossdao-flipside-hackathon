import RootABI from "../abi/Root.json"
import ENSRegistryABI from "../abi/ENSRegistry.json"
import ReverseRegistrarABI from "../abi/ReverseRegistrar.json"
import DiamondResolverABI from "../abi/DiamondResolver.json"
import PublicResolverFacetABI from "../abi/PublicResolverFacet.json"
import OptiDomainsAttestationABI from "../abi/OptiDomainsAttestation.json"
import NameWrapperRegistryABI from "../abi/NameWrapperRegistry.json"

// Domain
import BaseRegistrarImplementationABI from "../abi/BaseRegistrarImplementation.json"
import NameWrapperABI from "../abi/OptiDomains.json"
import WhitelistRegistrarControllerABI from "../abi/WhitelistRegistrarController.json"

// Axelar
import AxelarProposalControllerABI from "../abi/AxelarProposalController.json"
import AxelarWhitelistRegistrarControllerABI from "../abi/AxelarWhitelistRegistrarController.json"

interface ContractDefinition {
  address: `0x${string}`;
  abi: any[];
}

export const CONTRACTS: {[name: string]: ContractDefinition} = {
  // Core
  Root: {
    address: '0x88881190D24e8ecA11F0262972cff8081b2AFc45',
    abi: RootABI,
  },
  ENSRegistry: {
    address: '0x888811b3DFC94566Fc8F6aC5e86069981a50B490',
    abi: ENSRegistryABI,
  },
  ReverseRegistrar: {
    address: '0x888811225d6751A0cf8a9F7fa6a77f4F1EF69DC9',
    abi: ReverseRegistrarABI,
  },
  DiamondResolver: {
    address: '0x888811Da0c852089cc8DFE6f3bAd190a46acaAE6',
    abi: PublicResolverFacetABI,
  },
  OptiDomainsAttestation: {
    address: '0x888811653D30Ed5bd74f5afd4B2bffe2dE3192B3',
    abi: OptiDomainsAttestationABI,
  },
  NameWrapperRegistry: {
    address: '0x888811E08f362edB8B1BF4A52c08fED2A58a427E',
    abi: NameWrapperRegistryABI,
  },

  // .op
  OptiDomains_BaseRegistrarImplementation: {
    address: '0x8888111BAd1a449a6a0618C0fE7DC1727e3aaf99',
    abi: BaseRegistrarImplementationABI,
  },
  OptiDomains_NameWrapper: {
    address: '0x888811F1B21176E15FB60DF500eA85B490Dd2836',
    abi: NameWrapperABI,
  },
  OptiDomains_WhitelistRegistrarController: {
    address: '0x8888117A2d8cC4e02A9A9691Ba0e166b2842360D',
    abi: WhitelistRegistrarControllerABI,
  },

  // .town
  BoredTown_BaseRegistrarImplementation: {
    address: '0xB02ED512702C46dbDB260053C97f79c3F467E39E',
    abi: BaseRegistrarImplementationABI,
  },
  BoredTown_NameWrapper: {
    address: '0xB02ED980693e14E082F0A3A33060046Ae8495EB2',
    abi: NameWrapperABI,
  },
  BoredTown_WhitelistRegistrarController: {
    address: '0xB02EDc247246ACD78294c62F403B3e64D5917031',
    abi: WhitelistRegistrarControllerABI,
  },

  // Axelar
  AxelarProposalController: {
    address: '0xa881f34E2D321a2574d673BcA64391ECe88D86B4',
    abi: AxelarProposalControllerABI,
  },
  AxelarWhitelistRegistrarController: {
    address: '0xa8815cFdf185b57685680a87BF84005C95ea8b5b',
    abi: AxelarWhitelistRegistrarControllerABI,
  },
}