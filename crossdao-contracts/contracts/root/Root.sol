pragma solidity ^0.8.4;

import "../registry/ENS.sol";
import "./Controllable.sol";

bytes32 constant TOPIC_LOCK = keccak256("lock");
bytes32 constant TOPIC_EXECUTE = keccak256("execute");

contract Root is Controllable {
    bytes32 private constant ROOT_NODE = bytes32(0);

    bytes4 private constant INTERFACE_META_ID =
        bytes4(keccak256("supportsInterface(bytes4)"));

    event TLDLocked(bytes32 indexed label);

    mapping(bytes32 => bool) public locked;

    constructor(address _owner) Ownable(_owner) {
        // Reduce gas
        controllers[address(this)] = true;
        controllers[_owner] = true;
    }

    function setSubnodeOwner(
        ENS ens,
        bytes32 label,
        address owner
    ) external onlyController {
        require(!locked[label]);
        ens.setSubnodeOwner(ROOT_NODE, label, owner);
    }

    event RootExecution(address indexed target, bytes data, bytes result);

    function execute(
        address target,
        bytes memory data,
        bytes memory signature
    ) external returns (bytes memory) {
        if (
            !verifyOwnerSignature(
                TOPIC_EXECUTE,
                keccak256(abi.encodePacked(target, data)),
                signature
            )
        ) {
            revert InvalidOperatorSignature();
        }

        (bool success, bytes memory result) = target.call(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }

        emit RootExecution(target, data, result);

        return result;
    }

    function lock(bytes32 label, bytes memory signature) external {
        if (!verifyOwnerSignature(TOPIC_LOCK, label, signature)) {
            revert InvalidOperatorSignature();
        }

        emit TLDLocked(label);
        locked[label] = true;
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return interfaceID == INTERFACE_META_ID;
    }
}
