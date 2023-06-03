//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IProposalExecutable} from "./AxelarProposalController.sol";

error ConditionsNotFulfilled();

contract AxelarSampleProposalExecutable is IProposalExecutable {
    function transfer1MAXL() internal {
        // Do something here
    }

    function execute(
        bytes32 proposalId,
        bytes32 conditionHash,
        bytes calldata data
    ) external payable {
        // Check if called from proposal controller
        // And chomtana.axl, optidomains.axl, flipside.axl are all attested using conditionHash
        if (
            msg.sender != 0xa8816Acfb9248f9afe10132bf89F63504e0a77F9 ||
            conditionHash !=
            0x730b6865379ae0ed5f9667f5255c42811c117016b53cf2f31210ac108c8e38bc
        ) {
            revert ConditionsNotFulfilled();
        }

        transfer1MAXL();
    }
}
