pragma solidity ^0.8.4;

import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

bytes32 constant TOPIC_TRANSFER_OWNERSHIP = keccak256("transferOwnership");

error InvalidOperatorSignature();

contract Ownable {
    address public owner;
    uint256 public currentNonce;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(isOwner(msg.sender));
        _;
    }

    constructor(address _owner) public {
        owner = _owner;
    }

    function verifyOwnerSignature(
        bytes32 topic,
        bytes32 digest,
        bytes memory signature
    ) internal returns (bool) {
        return
            SignatureChecker.isValidSignatureNow(
                owner,
                keccak256(
                    abi.encodePacked(
                        bytes1(0x19),
                        bytes1(0),
                        address(this),
                        topic, // keccak256("...")
                        currentNonce++,
                        digest
                    )
                ),
                signature
            );
    }

    function transferOwnership(
        address newOwner,
        bytes memory signature
    ) public {
        if (
            !verifyOwnerSignature(
                TOPIC_TRANSFER_OWNERSHIP,
                keccak256(abi.encodePacked(newOwner)),
                signature
            )
        ) {
            revert InvalidOperatorSignature();
        }

        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function isOwner(address addr) public view returns (bool) {
        return owner == addr;
    }
}
