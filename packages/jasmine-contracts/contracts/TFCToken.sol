// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract TFCToken is ERC20PresetMinterPauser {
    constructor (uint256 initialSupply) public ERC20PresetMinterPauser("TurboField", "TFC"){
        _mint(_msgSender(), initialSupply);
    }

    modifier onlyAdmin(string memory errMsg){
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "sendMinerReward: must have Rewarder role to send reward");
        _;
    }
}
