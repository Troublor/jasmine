import ResponseModel from "./response.model";
import {ApiProperty} from "@nestjs/swagger";
import MetadataModel from "./metadata.model";

export class BlockBasicInfo {
    @ApiProperty({
        type: String,
        description: "block hash",
    })
    hash: string;

    @ApiProperty({
        type: Number,
        description: "block height",
    })
    height: number;

    @ApiProperty({
        type: String,
        description: "parent block hash",
    })
    parentHash: string;

    @ApiProperty({
        type: Number,
        description: "block time stamp"
    })
    timestamp: number;

    @ApiProperty({
        type: [String],
        description: "list of transaction hashes in the block"
    })
    transactions: string[];
}

export class BlocksQueryData {
    @ApiProperty()
    metadata: MetadataModel;

    @ApiProperty({
        type: [BlockBasicInfo]
    })
    blocks: BlockBasicInfo[];
}

export default class BlocksQueryResponse extends ResponseModel {
    @ApiProperty({
        type: BlocksQueryData,
        description: "blocks basic information"
    })
    data: BlocksQueryData;
}
