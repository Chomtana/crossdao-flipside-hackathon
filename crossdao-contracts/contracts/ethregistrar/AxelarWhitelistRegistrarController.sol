//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./WhitelistRegistrarController.sol";
import {INameWrapper} from "../wrapper/INameWrapper.sol";
import {ENS} from "../registry/ENS.sol";
import {Multicallable} from "../resolvers/Multicallable.sol";
import {StringToAddress, AddressToString} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/utils/AddressString.sol";

import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

import {IAddrResolver} from "../resolvers/profiles/IAddrResolver.sol";
import {ITextResolver} from "../resolvers/profiles/ITextResolver.sol";

import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

error NotApprovedByGateway();
error NotMainChain();

uint64 constant EXPIRE_2025 = 1735689600;

bytes32 constant KECCAK256_REGISTER = keccak256("register");
bytes32 constant KECCAK256_TEXT = keccak256("text");

bytes32 constant GATEWAY_AXELAR_OP = 0xfa09792c7e511e28c04759f07bfa13349dfe86b3521af57d4d0779bc50f94b2f;
bytes32 constant GASSERVICE_AXELAR_OP = 0xb0a0bca92b007f6cb95f1e2d3a7998525aab6b250892d4b46aada869eb80a321;
bytes32 constant RESOLVER_AXELAR_OP = 0xb0c33aaf22bba888eba653ddb29ef152a115d46cc338e4a2e54db6fcc0ee6562;

interface ITextResolverSetter {
    function setText(
        bytes32 node,
        string calldata key,
        string calldata value
    ) external;
}

contract AxelarWhitelistRegistrarController is ERC721Holder, ERC1155Holder {
    using StringToAddress for string;
    using AddressToString for address;

    ENS public immutable ens;
    INameWrapper public immutable nameWrapper;
    bytes32 public immutable rootNode; // axl.axelar.op
    address public operator;
    address public defaultResolver;

    string private addressThis;

    IAxelarGateway public gateway;
    IAxelarGasService public gasService;

    mapping(bytes32 => uint256) public mainChainMapping;

    constructor(
        INameWrapper _nameWrapper,
        // bytes32 _rootNode,
        address _operator
    ) {
        addressThis = address(this).toString();

        ens = _nameWrapper.ens();
        nameWrapper = _nameWrapper;
        // rootNode = _rootNode;
        rootNode = 0x060f8fe03b5af1f50ede263fae5ba358bb2a34fcf734f4443444878e23386f7e;
        operator = _operator;

        updateAxelarContract();
    }

    function updateAxelarContract() public {
        gateway = IAxelarGateway(
            IAddrResolver(ens.resolver(GATEWAY_AXELAR_OP)).addr(
                GATEWAY_AXELAR_OP
            )
        );
        gasService = IAxelarGasService(
            IAddrResolver(ens.resolver(GASSERVICE_AXELAR_OP)).addr(
                GASSERVICE_AXELAR_OP
            )
        );
        defaultResolver = IAddrResolver(ens.resolver(RESOLVER_AXELAR_OP)).addr(
            RESOLVER_AXELAR_OP
        );
    }

    event Register(
        bytes32 indexed node,
        address indexed owner,
        uint256 indexed mainChain,
        string name
    );

    function _register(
        string memory name,
        address owner,
        uint256 mainChainId,
        bytes[] memory data
    ) internal {
        bytes32 node = keccak256(
            abi.encodePacked(rootNode, keccak256(bytes(name)))
        );

        nameWrapper.setSubnodeOwner(
            rootNode,
            name,
            address(this),
            0,
            EXPIRE_2025
        );
        nameWrapper.setResolver(node, defaultResolver);
        Multicallable(defaultResolver).multicallWithNodeCheck(node, data);
        nameWrapper.setSubnodeOwner(rootNode, name, owner, 0, EXPIRE_2025);

        mainChainMapping[node] = mainChainId;

        emit Register(node, owner, mainChainId, name);
    }

    function register(
        string calldata name,
        address owner,
        bytes[] calldata data,
        bytes calldata operatorSignature
    ) public {
        bytes32 commitment = keccak256(abi.encode(name, owner, data));

        if (
            !SignatureChecker.isValidSignatureNow(
                operator,
                keccak256(
                    abi.encodePacked(
                        bytes1(0x19),
                        bytes1(0),
                        address(this),
                        uint256(block.chainid),
                        KECCAK256_REGISTER,
                        commitment
                    )
                ),
                operatorSignature
            )
        ) {
            revert InvalidOperatorSignature();
        }

        _register(name, owner, block.chainid, data);
    }

    event BridgeSetText(
        bytes32 indexed node,
        string name,
        string key,
        string value
    );

    function _bridgeSetText(
        string memory name,
        string memory key,
        string memory value
    ) internal {
        bytes32 node = keccak256(
            abi.encodePacked(rootNode, keccak256(bytes(name)))
        );
        address oldOwner = nameWrapper.ownerOf(uint256(node));

        nameWrapper.setSubnodeOwner(
            rootNode,
            name,
            address(this),
            0,
            EXPIRE_2025
        );
        ITextResolverSetter resolver = ITextResolverSetter(ens.resolver(node));
        resolver.setText(node, key, value);
        nameWrapper.setSubnodeOwner(rootNode, name, oldOwner, 0, EXPIRE_2025);

        emit BridgeSetText(node, name, key, value);
    }

    function bridge(
        string calldata name,
        string calldata destinationChain
    ) public payable {
        bytes32 node = keccak256(
            abi.encodePacked(rootNode, keccak256(bytes(name)))
        );

        // Force owner to address(this) for the hackathon
        bytes memory payload = abi.encode(
            KECCAK256_REGISTER,
            name,
            address(this),
            mainChainMapping[node]
        );

        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                addressThis,
                payload,
                msg.sender
            );
        }
        gateway.callContract(destinationChain, addressThis, payload);
    }

    function bridgeText(
        string memory name,
        string calldata key,
        string calldata destinationChain
    ) public payable {
        bytes32 node = keccak256(
            abi.encodePacked(rootNode, keccak256(bytes(name)))
        );

        if (block.chainid != mainChainMapping[node]) {
            revert NotMainChain();
        }

        ITextResolver resolver = ITextResolver(ens.resolver(node));
        bytes memory payload = abi.encode(
            KECCAK256_TEXT,
            mainChainMapping[node],
            name,
            key,
            resolver.text(node, key)
        );
        if (msg.value > 0) {
            gasService.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                addressThis,
                payload,
                msg.sender
            );
        }
        gateway.callContract(destinationChain, addressThis, payload);
    }

    function _execute(
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal {
        if (sourceAddress.toAddress() != address(this)) {
            revert NotApprovedByGateway();
        }

        bytes32 selector = abi.decode(payload, (bytes32));

        bytes[] memory emptyData = new bytes[](0);

        if (selector == KECCAK256_REGISTER) {
            (, string memory name, address owner, uint256 mainChainId) = abi
                .decode(payload, (bytes32, string, address, uint256));
            _register(name, owner, mainChainId, emptyData);
        } else if (selector == KECCAK256_TEXT) {
            (
                ,
                uint256 mainChainId,
                string memory name,
                string memory key,
                string memory value
            ) = abi.decode(payload, (bytes32, uint256, string, string, string));
            _register(name, address(this), mainChainId, emptyData);
            _bridgeSetText(name, key, value);
        }
    }

    function execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) external {
        bytes32 payloadHash = keccak256(payload);

        if (
            !gateway.validateContractCall(
                commandId,
                sourceChain,
                sourceAddress,
                payloadHash
            )
        ) revert NotApprovedByGateway();

        _execute(sourceChain, sourceAddress, payload);
    }
}
