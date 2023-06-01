//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17 <0.9.0;

interface ISupporterPlan {
    function buy(string memory name) external payable;
}
