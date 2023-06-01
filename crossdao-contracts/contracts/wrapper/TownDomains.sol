//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "./NameWrapper721.sol";

contract TownDomains is NameWrapper721 {
    string public constant name = "Bored Town Domains";
    string public constant symbol = ".town";
    string public constant contractURI =
        "https://metadata.opti.domains/collection/domains/town";

    constructor(
        ENS _ens,
        IBaseRegistrar _registrar,
        IMetadataService _metadataService,
        string memory _ethNode
    ) NameWrapper721(_ens, _registrar, _metadataService, _ethNode) {}
}
