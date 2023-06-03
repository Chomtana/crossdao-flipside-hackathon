//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {BaseRegistrarImplementation} from "./BaseRegistrarImplementation.sol";
import {StringUtils} from "./StringUtils.sol";
import {Resolver} from "../resolvers/Resolver.sol";
import {ENS} from "../registry/ENS.sol";
import {ReverseRegistrar} from "../reverseRegistrar/ReverseRegistrar.sol";
import {IWhitelistRegistrarController, IPriceOracle} from "./IWhitelistRegistrarController.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {INameWrapper} from "../wrapper/INameWrapper.sol";
import {ERC20Recoverable} from "../utils/ERC20Recoverable.sol";
import {ISupporterPlan} from "./ISupporterPlan.sol";

import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import "hardhat/console.sol";

error NameNotAvailable(string name);
error DurationTooShort(uint256 duration);
error NegativeDuration();
error ResolverRequiredWhenDataSupplied();
error UnexpiredCommitmentExists(bytes32 commitment);
error InsufficientValue();
error Unauthorised(bytes32 node);
error InvalidOperatorSignature();

/**
 * @dev A registrar controller for registering domain name from whitelist signature provided by a operator.
 */
contract WhitelistRegistrarController is
    Ownable,
    IWhitelistRegistrarController,
    IERC165,
    ERC20Recoverable
{
    using StringUtils for *;
    using Address for address;

    uint256 public constant MIN_REGISTRATION_DURATION = 28 days;
    bytes32 public immutable ETH_NODE;
    uint64 private constant MAX_EXPIRY = type(uint64).max;
    BaseRegistrarImplementation immutable base;
    ReverseRegistrar public immutable reverseRegistrar;
    INameWrapper public immutable nameWrapper;
    string private ethNode;
    address public operator;
    uint16 public baseFuses;

    ISupporterPlan public supporterPlan;

    mapping(bytes32 => uint256) public commitments;

    bool public costActivated = false;

    event NameRegistered(
        string name,
        bytes32 indexed label,
        address indexed owner,
        uint256 baseCost,
        uint256 premium,
        uint256 expires
    );
    event NameRenewed(
        string name,
        bytes32 indexed label,
        uint256 cost,
        uint256 expires
    );

    constructor(
        BaseRegistrarImplementation _base,
        ReverseRegistrar _reverseRegistrar,
        INameWrapper _nameWrapper,
        address _operator,
        uint16 _baseFuses,
        string memory _ethNode
    ) {
        base = _base;
        reverseRegistrar = _reverseRegistrar;
        nameWrapper = _nameWrapper;
        ethNode = _ethNode;
        baseFuses = _baseFuses;
        operator = _operator;
        ETH_NODE = keccak256(
            abi.encodePacked(bytes32(0), keccak256(bytes(_ethNode)))
        );
        _transferOwnership(_base.ens().owner(bytes32(0)));
    }

    function valid(string memory name) public pure returns (bool) {
        return name.strlen() >= 3;
    }

    function available(string memory name) public view override returns (bool) {
        bytes32 label = keccak256(bytes(name));
        return valid(name) && base.available(uint256(label));
    }

    function makeCommitment(
        string memory name,
        address owner,
        uint256 expiration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord,
        uint16 ownerControlledFuses
    ) public pure override returns (bytes32) {
        bytes32 label = keccak256(bytes(name));
        if (data.length > 0 && resolver == address(0)) {
            revert ResolverRequiredWhenDataSupplied();
        }
        return
            keccak256(
                abi.encode(
                    label,
                    owner,
                    expiration,
                    secret,
                    resolver,
                    data,
                    reverseRecord,
                    ownerControlledFuses
                )
            );
    }

    function register(
        string calldata name,
        address owner,
        uint256 expiration,
        bytes32 secret,
        address resolver,
        bytes[] calldata data,
        bool reverseRecord,
        uint16 ownerControlledFuses,
        bytes calldata operatorSignature
    ) public payable override {
        {
            if (costActivated) {
                if (msg.value < 0.0004 ether + data.length * 0.0001 ether) {
                    revert InsufficientValue();
                }
            }
        }

        {
            bytes32 commitment = makeCommitment(
                name,
                owner,
                expiration,
                secret,
                resolver,
                data,
                reverseRecord,
                ownerControlledFuses
            );

            if (
                !SignatureChecker.isValidSignatureNow(
                    operator,
                    keccak256(
                        abi.encodePacked(
                            bytes1(0x19),
                            bytes1(0),
                            address(this),
                            uint256(block.chainid),
                            bytes32(
                                0xdd007bd789f73e08c2714644c55b11c7d202931d717def434e3c9caa12a9f583
                            ), // keccak256("register")
                            commitment
                        )
                    ),
                    operatorSignature
                )
            ) {
                if (
                    !SignatureChecker.isValidSignatureNow(
                        operator,
                        keccak256(
                            abi.encodePacked(
                                bytes1(0x19),
                                bytes1(0),
                                address(this),
                                uint256(block.chainid),
                                bytes32(
                                    0x0548274c4be004976424de9f6f485fbe40a8f13e41524cd574fead54e448415c
                                ), // keccak256("takeover")
                                commitment
                            )
                        ),
                        operatorSignature
                    )
                ) {
                    revert InvalidOperatorSignature();
                } else {
                    base.setExpiry(uint256(keccak256(bytes(name))), 1);
                }
            }
        }

        if (!available(name)) {
            revert NameNotAvailable(name);
        }

        {
            uint256 expires = nameWrapper.registerAndWrapETH2LD(
                name,
                owner,
                expiration - block.timestamp,
                resolver,
                ownerControlledFuses | baseFuses
            );

            if (data.length > 0) {
                _setRecords(resolver, keccak256(bytes(name)), data);
            }

            if (reverseRecord) {
                _setReverseRecord(name, resolver, msg.sender);
            }

            emit NameRegistered(
                name,
                keccak256(bytes(name)),
                owner,
                0,
                msg.value,
                expires
            );
        }

        // Register supporter plan or donate ETH
        if (msg.value > 0 && address(supporterPlan) != address(0)) {
            supporterPlan.buy{value: msg.value}(name);
        }
    }

    function renew(
        string calldata name,
        uint256 expiration,
        bytes calldata operatorSignature
    ) external override {
        bytes32 labelhash = keccak256(bytes(name));
        uint256 tokenId = uint256(labelhash);
        uint256 oldExpires = base.nameExpires(tokenId);

        if (expiration <= oldExpires) {
            revert NegativeDuration();
        }

        {
            bool signatureValid = SignatureChecker.isValidSignatureNow(
                operator,
                keccak256(
                    abi.encodePacked(
                        bytes1(0x19),
                        bytes1(0),
                        address(this),
                        uint256(block.chainid),
                        bytes32(
                            0xde0eadb8cc1e667dab2d95e011b2f2ae72a64de91e0b652eecb07930f6b2ffaa
                        ), // keccak256("renew")
                        labelhash,
                        expiration
                    )
                ),
                operatorSignature
            );
            if (!signatureValid) {
                revert InvalidOperatorSignature();
            }
        }

        uint256 expires = nameWrapper.renew(tokenId, expiration - oldExpires);

        emit NameRenewed(name, labelhash, 0, expires);
    }

    function withdraw() public {
        bool success;
        address to = operator;

        /// @solidity memory-safe-assembly
        assembly {
            // Transfer the ETH and store if it succeeded or not.
            success := call(gas(), to, balance(address()), 0, 0, 0, 0)
        }

        require(success, "ETH_TRANSFER_FAILED");
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return
            interfaceID == type(IERC165).interfaceId ||
            interfaceID == type(IWhitelistRegistrarController).interfaceId;
    }

    /* Owner control functions */

    function setBaseFuses(uint16 _baseFuses) public onlyOwner {
        baseFuses = _baseFuses;
    }

    function setSupporterPlan(ISupporterPlan _supporterPlan) public onlyOwner {
        supporterPlan = _supporterPlan;
    }

    /* Internal functions */

    function _setRecords(
        address resolverAddress,
        bytes32 label,
        bytes[] calldata data
    ) internal {
        // use hardcoded .eth namehash
        bytes32 nodehash = keccak256(abi.encodePacked(ETH_NODE, label));
        Resolver resolver = Resolver(resolverAddress);
        resolver.multicallWithNodeCheck(nodehash, data);
    }

    function _setReverseRecord(
        string memory name,
        address resolver,
        address owner
    ) internal {
        reverseRegistrar.setNameForAddr(
            msg.sender,
            owner,
            resolver,
            string.concat(name, ".", ethNode)
        );
    }

    function activateCost(bool activated) public {
        if (msg.sender != operator && msg.sender != owner()) {
            revert InvalidOperatorSignature();
        }

        costActivated = activated;
    }
}
