//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./ISupporterPlan.sol";

contract SupporterPlan is Ownable, ISupporterPlan {
    bytes32 public immutable ethNode;
    uint256 public immutable basePrice;
    uint256 public totalSupporter = 0;

    mapping(string => bool) public supporter;
    mapping(bytes32 => bool) public supporterNamehash;
    mapping(bytes32 => bool) public supporterLabelhash;

    bool public enabled = true;

    constructor(uint256 _basePrice, bytes32 _ethNode) {
        basePrice = _basePrice;
        ethNode = _ethNode;
    }

    event NewSupporter(bytes32 indexed namehash, string name, uint256 price);

    function buy(string memory name) external payable {
        require(enabled, "New supporters closed");

        uint256 price = basePrice + (totalSupporter * 1 ether) / 1000000;

        require(msg.value >= price, "Not enough ETH");

        bytes32 namehash = keccak256(
            abi.encodePacked(ethNode, keccak256(bytes(name)))
        );

        supporter[name] = true;
        supporterNamehash[namehash] = true;
        supporterLabelhash[keccak256(bytes(name))] = true;
        totalSupporter++;

        emit NewSupporter(namehash, name, price);
    }

    function withdraw() public {
        bool success;
        address to = owner();

        /// @solidity memory-safe-assembly
        assembly {
            // Transfer the ETH and store if it succeeded or not.
            success := call(gas(), to, balance(address()), 0, 0, 0, 0)
        }

        require(success, "ETH_TRANSFER_FAILED");
    }

    event ToggleEnabled(address indexed toggler, bool enabled);

    function toggleEnabled(bool _enabled) public onlyOwner {
        enabled = _enabled;
        emit ToggleEnabled(msg.sender, _enabled);
    }
}
