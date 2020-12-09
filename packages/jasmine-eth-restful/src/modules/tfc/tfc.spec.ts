import TfcController from "./tfc.controller";
import TfcService from "./tfc.service";
import {Test} from "@nestjs/testing";
import {ConfigModule} from "@nestjs/config";
import SDK, {Account, MockEthereum} from "jasmine-eth-ts";
import BN from "bn.js";


describe("TFC", () => {
    let tfcController: TfcController;
    let tfcService: TfcService;
    let accounts: Account[];

    beforeEach(async () => {
        let mockEth = new MockEthereum();
        let sdk = new SDK(mockEth.endpoint);
        accounts = mockEth.predefinedPrivateKeys.map(key => sdk.retrieveAccount(key));
        let tfcAddress = await sdk.deployTFC(
            accounts[0],
        );
        const configuration = () => ({
            ethereum: {
                endpoint: mockEth.endpoint,
                tfcAddress: tfcAddress,
            }
        });
        const moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({
                load: [configuration]
            })],
            controllers: [TfcController],
            providers: [TfcService],
        }).compile();

        tfcController = moduleRef.get<TfcController>(TfcController);
        tfcService = moduleRef.get<TfcService>(TfcService);
    });

    describe("Service", () => {
        it('should get balance correctly', async function () {
            for (let i = 0; i < 20; i++) {
                let balance = await tfcService.balanceOf(accounts[i].address);
                expect(balance.toString()).toEqual(new BN("100000000").mul(new BN("1000000000000000000")).toString());
            }
        });

        it('should get total supply correctly', async function () {
            let supply = await tfcService.totalSupply();
            expect(supply.toString()).toEqual(new BN("2000000000").mul(new BN("1000000000000000000")).toString());
        });

        it('should get name correctly', async function () {
            expect(
                await tfcService.name()
            ).toEqual("TFCToken");
        });

        it('should get symbol correctly', async function () {
            expect(
                await tfcService.symbol()
            ).toEqual("TFC");
        });
    });

    describe("Controller", () => {
        it('should serve balance query', async function () {
            let result = await tfcController.getAccountInfo(accounts[0].address);
            expect(result.balance).toEqual(new BN("100000000").mul(new BN("1000000000000000000")).toString('hex'));
            expect(result.address).toEqual(accounts[0].address);
        });

        it('should serve get name query', async function () {
            let result = await tfcController.getTokenInfo();
            expect(result.name).toEqual("TFCToken");
            expect(result.symbol).toEqual("TFC");
            expect(result.totalSupply).toEqual(new BN("2000000000").mul(new BN("1000000000000000000")).toString('hex'));
            expect(result.decimals).toEqual(18);
        });
    });
});
