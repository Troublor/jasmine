import {readFileSync} from 'fs';
import * as yaml from 'js-yaml';
import {join} from 'path';
import Joi from "@hapi/joi";

const YAML_CONFIG_FILENAME = join(__dirname, "..", "..", "..", "..", "config.yml");

export default () => {
    const config = yaml.load(
        readFileSync(YAML_CONFIG_FILENAME, 'utf8'),
    );
    const schema = Joi.object({
        services: Joi.object().keys({
            ethereum: Joi.object().keys({
                endpoint: Joi.string()
                    .pattern(/^(http|ws)s?:\/\/(.*)$/),
                host: Joi.string()
                    .hostname(),
                port: Joi.number()
                    .port(),
                contracts: Joi.object().keys({
                    "tfc-erc20": Joi.string()
                        .required(),
                    "tfc-manager": Joi.string()
                        .required(),
                }).required(),
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

    return result.value;
};
