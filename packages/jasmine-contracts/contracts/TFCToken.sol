// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.0;

import "./ERC20MinterPauserBurner.sol";

contract TFCToken is ERC20MinterPauserBurner {
    /**
     * @param adminAddress: the default admin address of ERC20 contracts.
     * @param managerAddress: the address of TFCManager address,
     *                        which makes it possible for users of TFC to claim TFC tokens by themselves
     *                        with the signature signed by the creator address of TFCManager contract.
     */
    constructor (address adminAddress, address managerAddress) public ERC20MinterPauserBurner("TFCToken", "TFC", adminAddress){
        // grant managerAddress MINTER_ROLE
        _setupRole(MINTER_ROLE, managerAddress);
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
