import {ApiProperty} from "@nestjs/swagger";

export default abstract class ResponseModel {
    @ApiProperty({
        type: Number,
        description: "response status code",
    })
    code!: number;

    @ApiProperty({
        type: String,
        description: "description of response status",
    })
    msg!: string;

    @ApiProperty({
        description: "response data"
    })
    abstract data: any;
};
