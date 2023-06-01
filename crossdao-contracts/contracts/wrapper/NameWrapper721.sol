//SPDX-License-Identifier: MIT
pragma solidity ~0.8.17;

import "./NameWrapper.sol";

abstract contract NameWrapper721 is NameWrapper {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    constructor(
        ENS _ens,
        IBaseRegistrar _registrar,
        IMetadataService _metadataService,
        string memory _ethNode
    ) NameWrapper(_ens, _registrar, _metadataService, _ethNode) {}

    function balanceOf(address owner) external view returns (uint256) {}

    function _mint(
        bytes32 node,
        address owner,
        uint32 fuses,
        uint64 expiry
    ) internal virtual override {
        super._mint(node, owner, fuses, expiry);
        emit Transfer(address(0), owner, uint256(node));
    }

    function _burn(uint256 tokenId) internal virtual override {
        (address oldOwner, , ) = ERC1155Fuse.getData(tokenId);
        super._burn(tokenId);
        emit Transfer(oldOwner, address(0), tokenId);
    }

    function _transfer(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual override {
        super._transfer(from, to, id, amount, data);
        emit Transfer(from, to, id);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override(ERC1155Fuse, IERC1155) {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);

        unchecked {
            uint256 idsLength = ids.length;
            for (uint256 i; i < idsLength; ++i) {
                emit Transfer(from, to, ids[i]);
            }
        }
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, 1, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        safeTransferFrom(from, to, tokenId, 1, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public {
        safeTransferFrom(from, to, tokenId, 1, data);
    }

    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        return uri(_tokenId);
    }
}
