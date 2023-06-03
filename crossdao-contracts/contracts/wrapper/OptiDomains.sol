//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./NameWrapper721.sol";

contract OptiDomains is NameWrapper721 {
    string public constant name = "Opti.domains";
    string public constant symbol = ".op";
    string public constant contractURI =
        "https://metadata.opti.domains/collection/domains/op";

    constructor(
        ENS _ens,
        IBaseRegistrar _registrar,
        IMetadataService _metadataService,
        string memory _ethNode
    ) NameWrapper721(_ens, _registrar, _metadataService, _ethNode) {}
}
