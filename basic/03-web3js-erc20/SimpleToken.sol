// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract SimpleToken is ERC20PresetMinterPauser {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */

    // 代币小数位，如果18，最小可为 10^-18
    uint8 private _decimals;
    uint256 public INITIAL_SUPPLY;

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initial_supply
    ) ERC20PresetMinterPauser(name, symbol) {
        _decimals = decimals_;
        INITIAL_SUPPLY = initial_supply * (10**uint256(decimals_));
        // ——mint 从父合约中继承的内部函数，用于创建代币并分配给指定地址
        // msg.sender 是部署合约的地址，即调用构造函数的账户
        // 这一步将所有的代币分配给部署者
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
