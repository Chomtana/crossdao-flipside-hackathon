pragma solidity ^0.8.4;

import "./Ownable.sol";

bytes32 constant TOPIC_SET_CONTROLLER = keccak256("setController");

abstract contract Controllable is Ownable {
    mapping(address => bool) public controllers;

    event ControllerChanged(address indexed controller, bool enabled);

    modifier onlyController() {
        require(
            controllers[msg.sender],
            "Controllable: Caller is not a controller"
        );
        _;
    }

    function setController(
        address controller,
        bool enabled,
        bytes memory signature
    ) public {
        if (
            !verifyOwnerSignature(
                TOPIC_SET_CONTROLLER,
                keccak256(abi.encodePacked(controller, enabled)),
                signature
            )
        ) {
            revert InvalidOperatorSignature();
        }

        controllers[controller] = enabled;
        emit ControllerChanged(controller, enabled);
    }
}
