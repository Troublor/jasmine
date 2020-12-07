// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.0;

import "./TFCToken.sol";

// TFCManager provides the functionality to let users claim TFC token by themselves. (gas paid by users)
// The deployment of TFCManager will future deploy the corresponding TFC ERC20 contract in the constructor.
// So there is no need to deploy ERC20 contract separately.
contract TFCManager {
    // A map of nonce that has been used
    mapping(uint256 => bool) public usedNonces;

    // the address who has the privilege to sign message of claiming TFC token
    address public signer;

    event ClaimTFC(address indexed recipient, uint256 indexed amount, uint256 indexed nonce, bytes sig);

    // the address of TFC ERC20 smart contract
    TFCToken public tfcToken;

    constructor() public {
        signer = msg.sender;
        tfcToken = new TFCToken(msg.sender, address(this));
    }

    // claim TFC token using the signature signed by authorizer.
    // The amount and nonce must be the same as that used in the signature.
    function claimTFC(uint256 amount, uint256 nonce, bytes memory sig)
    public
    {
        require(!usedNonces[nonce], "nonce has already been used");
        usedNonces[nonce] = true;

        // This recreates the message that was signed on the client.
        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, amount, nonce, this)));

        require(recoverSigner(message, sig) == signer, "unauthorized claim");

        // mint TFC tokens for the msg.sender
        tfcToken.mint(msg.sender, amount);

        emit ClaimTFC(msg.sender, amount, nonce, sig);
    }

    function splitSignature(bytes memory sig)
    internal
    pure
    returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65, "signature length incorrect");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
        // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
        // second 32 bytes
            s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
    internal
    pure
    returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    // Builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash)
    internal
    pure
    returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}
