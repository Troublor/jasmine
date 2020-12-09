import {readFileSync} from 'fs';
import * as yaml from 'js-yaml';
import {join} from 'path';
import Joi from "@hapi/joi";
import SDK, {MockEthereum} from "jasmine-eth-ts";

const YAML_CONFIG_FILENAME = join(__dirname, "..", "..", "..", "..", "config.yml");

export default async () => {
    let config = yaml.load(
        readFileSync(YAML_CONFIG_FILENAME, 'utf8'),
    );
    const schema = Joi.object({
        services: Joi.object().keys({
            ethereum: Joi.object().keys({
                existing: Joi.bool()
                    .required(),
                endpoint: Joi.string()
                    .pattern(/^(http|ws)s?:\/\/(.*)$/)
                    .when("existing", {
                        is: true,
                        then: Joi.required(),
                        otherwise: null,
                    }),
                contracts: Joi.object().keys({
                    "tfc-erc20": Joi.string()
                        .default("0xE48d3271a3DE7E51eaA2f70Dd50B2Aa20D4C638E"), // default contract if deploy on MockEthereum
                    "tfc-manager": Joi.string()
                        .default("0x07a457d878BF363E0Bb5aa0B096092f941e19962"), // default contract if deploy on MockEthereum
                }),
                host: Joi.string()
                    .hostname()
                    .when("existing", {
                        is: false,
                        then: Joi.required(),
                        otherwise: null,
                    }),
                port: Joi.number()
                    .port()
                    .when("existing", {
                        is: false,
                        then: Joi.required(),
                        otherwise: null,
                    }),
                dbPath: Joi.string()
            }).required(),
            restful: Joi.object().keys({
                port: Joi.number()
                    .port()
                    .default(8989),
                filter: Joi.object().keys({
                    fromBlock: Joi.number()
                        .integer()
                        .min(0)
                        .default(0),
                }),
            }),
        }).required(),
    });
    const result = schema.validate(config, {
        allowUnknown: false,
    });
    if (result.error) {
        throw new Error("Config validation failed: " + result.error.message);
    }
    if (result.warning) {
        throw new Error("Config validation failed: " + result.warning.message);
    }

    config = result.value;

    const contractDeployed = async (sdk: SDK): Promise<boolean> => {
        let managerAddress = config.services.ethereum.contracts ? config.services.ethereum.contracts["tfc-manager"] : undefined;
        let tfcAddress = config.services.ethereum.contracts ? config.services.ethereum.contracts["tfc-erc20"] : undefined;
        if (managerAddress && tfcAddress) {
            const manager = sdk.getManager(managerAddress);
            const tfc = sdk.getTFC(tfcAddress);
            if (await manager.deployed() &&
                await manager.tfcAddress() === tfcAddress &&
                await tfc.deployed()
            ) {
                return true;
            }
            console.warn("Provided contract not exist on chain");
        }
        return false;
    }

    // start test private chain if needed
    const existing = config.services.ethereum.existing;
    let mockEth: MockEthereum | undefined;
    if (!existing) {
        // start private chain
        const dbPath = config.services.ethereum.dbPath;
        mockEth = new MockEthereum({
            networkId: 2020,
            network_id: 2020,
            ws: true,
            db_path: dbPath,
        });
        const host = config.services.ethereum.host;
        const port = config.services.ethereum.port;
        await mockEth.listenOn(host, port);
        const sdk = new SDK(mockEth.endpoint);

        config.services.ethereum.endpoint = mockEth.endpoint;

        // check whether the contract has been deployed
        if (!await contractDeployed(sdk)) {
            // deploy TFC Manager contract
            const admin = sdk.retrieveAccount(mockEth.predefinedPrivateKeys[9]);
            const managerAddress = await sdk.deployManager(admin);
            const manager = sdk.getManager(managerAddress);
            const tfcAddress = await manager.tfcAddress();
            console.log("Manager address:", managerAddress);
            console.log("TFC address:", tfcAddress);
            console.log("Admin address:", admin.address);
            console.log("Admin private key:", admin.privateKey);
            config.services.ethereum.contracts = {
                "tfc-manager": managerAddress,
                "tfc-erc20": tfcAddress,
            }
        }

    } else {
        // connect to existing blockchain, check deployment
        const endpoint = config.services.ethereum.endpoint;
        const sdk = new SDK(endpoint);
        if (!await contractDeployed(sdk)) {
            throw new Error("Contract not deployed on blockchain");
        }
    }

    return config;
};
