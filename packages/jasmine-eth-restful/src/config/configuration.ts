import {readFileSync} from "fs";
import * as yaml from "js-yaml";
import {join} from "path";
import Joi from "@hapi/joi";
import SDK from "jasmine-eth-ts";

const YAML_CONFIG_FILENAME = join(__dirname, "..", "..", "..", "..", "restful.config.yml");

export default async () => {
    let config = yaml.load(
        readFileSync(YAML_CONFIG_FILENAME, "utf8"),
    );
    const ethereumNetworkSchema = Joi.object({
        endpoint: Joi.object({
            internal: Joi.string().pattern(/^(http|ws)s?:\/\/(.*)$/).required(),
            http: Joi.string().pattern(/^(http)s?:\/\/(.*)$/).required(),
            ws: Joi.string().pattern(/^(ws)s?:\/\/(.*)$/).required(),
        }),
        contracts: Joi.object().keys({
            "erc20": Joi.string().required(),
            "manager": Joi.string().required(),
        }).required(),
    });
    const schema = Joi.object({
        services: Joi.object().keys({
            ethereum: Joi.object({
                defaultNetworkId: Joi.number().required(),
                1: ethereumNetworkSchema,   // mainnet
                4: ethereumNetworkSchema,   // rinkeby
                2020: ethereumNetworkSchema,// private chain
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

    // check contract deployment
    const contractDeployed = async (sdk: SDK, contracts: { erc20: string, manager: string }): Promise<boolean> => {
        const managerAddress = contracts.manager;
        const tfcAddress = contracts.erc20;
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
    };

    // connect to existing blockchain, check deployment
    const networks = config.services.ethereum;
    for (const networkId in networks) {
        if (networkId === "defaultNetworkId") {
            continue;
        }
        if (!networks.hasOwnProperty(networkId)) {
            continue;
        }
        const endpoint = networks[networkId].endpoint.internal;
        const sdk = new SDK(endpoint);
        if (!await contractDeployed(sdk, networks[networkId].contracts)) {
            throw new Error("Contract not deployed on blockchain");
        }
    }

    return config;
};
