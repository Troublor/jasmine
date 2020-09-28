// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.0;

import "./TFCToken.sol";

contract TFCManager {
    mapping(uint256 => bool) public usedNonces;

    address public signer;

    TFCToken public tfcToken;

    constructor() public {
        signer = msg.sender;
        tfcToken = new TFCToken();
    }

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
