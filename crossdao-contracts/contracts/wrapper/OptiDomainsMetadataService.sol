//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";

contract OptiDomainsMetadataService {
    string private _uri;

    constructor(string memory _metaDataUri) {
        _uri = _metaDataUri;
    }

    function uri(uint256 tokenId) public view returns (string memory) {
        return string.concat(_uri, Strings.toString(tokenId));
    }
}
