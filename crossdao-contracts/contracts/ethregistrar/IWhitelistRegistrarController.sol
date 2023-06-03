//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IPriceOracle.sol";

interface IWhitelistRegistrarController {
    function available(string memory) external returns (bool);

    function makeCommitment(
        string memory,
        address,
        uint256,
        bytes32,
        address,
        bytes[] calldata,
        bool,
        uint16
    ) external pure returns (bytes32);

    function register(
        string calldata,
        address,
        uint256,
        bytes32,
        address,
        bytes[] calldata,
        bool,
        uint16,
        bytes calldata
    ) external payable;

    function renew(string calldata, uint256, bytes calldata) external;
}
