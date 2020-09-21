import {accounts, contract} from '@openzeppelin/test-environment';
import {TfcTokenContract, TfcTokenInstance} from "../contracts/types";
import {expectRevert} from "@openzeppelin/test-helpers";
import {expect} from "chai";
import * as BN from "bn.js";

describe('TFCToken', () => {
    const [admin, user, minter] = accounts;
    const TFCTokenContract: TfcTokenContract = contract.fromArtifact("TFCToken");
    let TFC: TfcTokenInstance;

    beforeEach(async () => {
        TFC = await TFCTokenContract.new(1000, {from: admin});
    });

    it('should have correct total supply', async function () {
        let total: BN = await TFC.totalSupply();
        expect(total.toNumber()).to.be.equal(1000);
    });

    it('should have correct name and symbol', async function () {
        expect(await TFC.name()).to.be.equal("TFCToken");
        expect(await TFC.symbol()).to.be.equal("TFC");
    });


    it('should prevent admin from mint', function () {
        expectRevert(TFC.mint(user, 1000), "ERC20PresetMinterPauser: must have minter role to mint");
    });

    it('should allow minter to mint', async function () {
        await TFC.grantRole(await TFC.MINTER_ROLE(), minter, {from: admin});
        await TFC.mint(user, 1000, {from: minter});
        let total = await TFC.totalSupply();
        expect(total.toNumber()).to.be.equal(2000);
    });
})
