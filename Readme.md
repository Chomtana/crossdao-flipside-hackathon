# CrossDAO

Let DAO from multiple chains jointly vote on proposals and post the proof to any governance forums.

* Live DApp: https://crossdao.opti.domains/
* Video: https://www.youtube.com/watch?v=YIUDelwNifI
* Roadmap: 

## What is CrossDAO?

CrossDAO is an innovative service provider designed to allow Decentralized Autonomous Organizations (DAOs) from different blockchains to jointly vote on proposals and post proof of voting attestations to any DAO forum such as Optimism Governance and ENS DAO forum. This cross-chain collaboration has been a major challenge in the blockchain space, and CrossDAO leverages advanced technology to overcome it.

In a typical scenario, suppose there are three DAOs from different blockchains who want to jointly vote on a proposal proposed by a different DAO, Axelar DAO. The proposal could involve the transfer of tokens from the base chain to the Optimism chain. Traditionally, this would be impossible due to interoperability constraints between different blockchains. CrossDAO solves this problem by enabling DAOs to vote, attest their vote, and bridge the attestation from their source chain to any chain where the proposal is live.

The process involves each DAO registering a domain name with Axelar on their respective main chains. Then, Axelar DAO deploys a proposal executable smart contract, which triggers the proposed action once all conditions have been met. The participating DAOs can attest their votes on their respective chains, and the attestations are then bridged to the chain where the proposal was originally made. Once all the DAOs have attested their votes, the proposal can be executed. The proof of proposal attestation can be posted on any governance forum for transparency and accountability.

CrossDAO's solution has eliminated the need for intermediaries and made the voting process more efficient and corruption-free. It brings a new level of interoperability to the blockchain world, enhancing the functionality and potential of DAOs.

## Deployed Contract Addresses

### CrossDAO Customized Contracts

| Contract                           | Address                                    |
|------------------------------------|--------------------------------------------|
| AxelarWhitelistRegistrarController | [0xa8815cFdf185b57685680a87BF84005C95ea8b5b](https://goerli-optimism.etherscan.io/address/0xa8815cFdf185b57685680a87BF84005C95ea8b5b) |
| AxelarProposalController           | [0xa8816Acfb9248f9afe10132bf89F63504e0a77F9](https://goerli-optimism.etherscan.io/address/0xa8816Acfb9248f9afe10132bf89F63504e0a77F9) |
| AxelarSampleProposalExecutable     | [0xa8816fc72EE7d5e4B9C8ab77860a5071c934940b](https://goerli.basescan.org/address/0xa8816fc72EE7d5e4B9C8ab77860a5071c934940b) |

### Opti.Domains Core Contracts

| Contract         | Address                                    |
|------------------|--------------------------------------------|
| Root             | [0x88881190D24e8ecA11F0262972cff8081b2AFc45](https://goerli-optimism.etherscan.io/address/0x88881190D24e8ecA11F0262972cff8081b2AFc45) |
| ENSRegistry      | [0x888811b3DFC94566Fc8F6aC5e86069981a50B490](https://goerli-optimism.etherscan.io/address/0x888811b3DFC94566Fc8F6aC5e86069981a50B490) |
| ReverseRegistrar | [0x888811225d6751A0cf8a9F7fa6a77f4F1EF69DC9](https://goerli-optimism.etherscan.io/address/0x888811225d6751A0cf8a9F7fa6a77f4F1EF69DC9) |

### Diamond Resolver

| Contract                   | Address                                                                                                                          |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| NameWrapperRegistry        | [0x888811E08f362edB8B1BF4A52c08fED2A58a427E](https://goerli-optimism.etherscan.io/address/0x888811E08f362edB8B1BF4A52c08fED2A58a427E) |
| OptiDomainsAttestation     | [0x888811653D30Ed5bd74f5afd4B2bffe2dE3192B3](https://goerli-optimism.etherscan.io/address/0x888811653D30Ed5bd74f5afd4B2bffe2dE3192B3) |
| DiamondResolver            | [0x888811Da0c852089cc8DFE6f3bAd190a46acaAE6](https://goerli-optimism.etherscan.io/address/0x888811Da0c852089cc8DFE6f3bAd190a46acaAE6) |
| RegistryWhitelistAuthFacet | [0x888811761f31b8242fAe670C3f0a054e226D10e8](https://goerli-optimism.etherscan.io/address/0x888811761f31b8242fAe670C3f0a054e226D10e8) |
| PublicResolverFacet        | [0x888811B3c11F37a978eED349b174F7e9cCec14D7](https://goerli-optimism.etherscan.io/address/0x888811B3c11F37a978eED349b174F7e9cCec14D7) |

### .op Domains

| Contract                    | Address                                                                                                                          |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| BaseRegistrarImplementation | [0x8888111BAd1a449a6a0618C0fE7DC1727e3aaf99](https://goerli-optimism.etherscan.io/address/0x8888111BAd1a449a6a0618C0fE7DC1727e3aaf99) |
| MetadataService             | [0x88881191aba4DEFD926dE9708C457d092120beaa](https://goerli-optimism.etherscan.io/address/0x88881191aba4DEFD926dE9708C457d092120beaa) |
| NameWrapper                 | [0x888811F1B21176E15FB60DF500eA85B490Dd2836](https://goerli-optimism.etherscan.io/address/0x888811F1B21176E15FB60DF500eA85B490Dd2836) |
| RegistrarController         | [0x8888117A2d8cC4e02A9A9691Ba0e166b2842360D](https://goerli-optimism.etherscan.io/address/0x8888117A2d8cC4e02A9A9691Ba0e166b2842360D) |
