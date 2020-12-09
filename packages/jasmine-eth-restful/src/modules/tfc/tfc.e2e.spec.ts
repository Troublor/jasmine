import {INestApplication} from "@nestjs/common";
import request from 'supertest';
import {Test} from "@nestjs/testing";
import TfcModule from "./tfc.module";
import {Account, MockEthereum, SDK} from "jasmine-eth-ts";
import {ConfigModule} from "@nestjs/config";
import BN from "bn.js";

describe("TFC", () => {
    let app: INestApplication;
    let accounts: Account[];

    beforeAll(async () => {
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
        })
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [configuration]
                }),
                TfcModule,
            ]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    it('GET /tfc-erc20/tokenInfo', function () {
        return request(app.getHttpServer())
            .get("/tfc-erc20/tokenInfo")
            .expect(200)
            .expect({
                name: "TFCToken",
                symbol: "TFC",
                totalSupply: new BN("2000000000").mul(new BN("1000000000000000000")).toString('hex'),
                decimals: 18,
            });
    });

    it('GET /tfc-erc20/accounts/{address} 200', function () {
        let testCases = [
            {
                address: accounts[0].address,
                balance: new BN("100000000").mul(new BN("1000000000000000000")).toString('hex'),
            },
            {
                address: "0x1111111111111111111111111111111111111111",
                balance: new BN(0).toString('hex'),
            },
        ];
        for (let testCase of testCases) {
            request(app.getHttpServer())
                .get(`/tfc-erc20/${testCase.address}/balance`)
                .expect(200)
                .expect({
                    address: testCase.address,
                    balance: testCase.balance,
                });
        }
    });

    it('GET /tfc-erc20/accounts/{address} 400', function () {
        let invalidAddresses = [
            "0x111111111111111111111111111111111111111",
            "0xdfkajfdsalkfjsdlf",
            "dfakldjfaslkfjsadlkfjs",
            "0x#*$(&#(*QJKFHDKJFLSJFSDKLJFLKSDJFEIU$DFF",
            "0xDFKLDJSKTEUNCHEE111111111111111111111113"
        ]
        for (let addr of invalidAddresses) {
            request(app.getHttpServer())
                .get(`/tfc-erc20/${addr}/balance`)
                .expect(400);
        }

    });

    afterAll(async () => {
        await app.close();
    })
})
