import Response from "../../common/models/response.model";
import {ApiProperty} from "@nestjs/swagger";

export class AddressResponse extends Response {
    @ApiProperty({
        type: "object",
        properties: {
            address: {
                type: "string",
            },
        },
    })
    data!: {
        address: string
    } | null;
}
