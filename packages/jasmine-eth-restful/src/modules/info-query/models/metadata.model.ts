import {ApiProperty} from "@nestjs/swagger";
import {Address} from "jasmine-eth-ts";
import Response from "./../../common/models/response.model";

export default class MetadataModel {
    @ApiProperty({
        type: Number,
        description: "latest block height",
    })
    totalCount!: number;

    @ApiProperty({
        type: Number,
        description: "current page",
    })
    page!: number;

    @ApiProperty({
        type: Number,
        description: "total page count",
    })
    count!: number;
};
