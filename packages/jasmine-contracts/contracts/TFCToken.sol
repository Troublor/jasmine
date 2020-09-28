// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract TFCToken is ERC20PresetMinterPauser {
    // initialHolders will get the corresponding initialSupply of tokens, the length of two arrays must be equal
    constructor () public ERC20PresetMinterPauser("TFCToken", "TFC"){
    }

    // a wrapper of transfer() to handle one-to-many transfers
    // it has the same requirement as transfer() for each pair of recipient account and the amount
    function one2manyTransfer(address[] memory tos, uint256[] memory amounts) public returns (bool){
        require(tos.length == amounts.length, "array length of recipients and amounts must be equal");
        for (uint256 i = 0; i < tos.length; i++) {
            _transfer(_msgSender(), tos[i], amounts[i]);
        }
        return true;
    }
}
