import ResponseModel from "./response.model";
import {BlockBasicInfo} from "./blocks-query.response";
import {ApiProperty} from "@nestjs/swagger";

export class BlockInfo extends BlockBasicInfo {
    @ApiProperty({
        type: String,
        description: "block nonce",
    })
    nonce: string;

    @ApiProperty({
        type: String,
        description: "sha3 of uncles",
    })
    sha3Uncles: string;

    @ApiProperty({
        type: String,
        description: "logs bloom",
    })
    logsBloom: string;

    @ApiProperty({
        type: String,
        description: "transactions root",
    })
    transactionsRoot: string;

    @ApiProperty({
        type: String,
        description: "state root",
    })
    stateRoot: string;

    @ApiProperty({
        type: String,
        description: "miner address",
    })
    miner: string;

    @ApiProperty({
        type: String,
        description: "difficulty of the block",
    })
    difficulty: number;

    @ApiProperty({
        type: String,
        description: "total difficulty of current blockchain",
    })
    totalDifficulty: number;

    @ApiProperty({
        type: Number,
        description: "the size of this block in bytes"
    })
    size: number;

    @ApiProperty({
        type: String,
        description: "extra data of the block",
    })
    extraData: string;

    @ApiProperty({
        type: Number,
        description: "gas limit of this block",
    })
    gasLimit: number;

    @ApiProperty({
        type: Number,
        description: "total gas used by transactions in this block"
    })
    gasUsed: number;

    @ApiProperty({
        type: [String],
        description: "a list of hash of uncles"
    })
    uncles: string[];
}

export class BlockInfoData {
    @ApiProperty()
    block: BlockInfo;
}

export default class BlockInfoResponse extends ResponseModel {
    @ApiProperty({
        type: BlockInfoData
    })
    data: BlockInfoData;
};
