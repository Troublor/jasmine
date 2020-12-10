import Response from "./../../common/models/response.model";
import {TransactionBasicInfo} from "./transactions-query.response";
import {ApiProperty} from "@nestjs/swagger";

export class ContractEventRaw {
    @ApiProperty()
    data!: string;

    @ApiProperty({
        type: [String],
    })
    topics!: string[];
}

export abstract class ContractEvent {
    @ApiProperty({
        description: "parameters of the event",
    })
    abstract params: object;

    @ApiProperty({
        type: ContractEventRaw,
        description: "raw data of the event",
    })
    raw!: ContractEventRaw;

    @ApiProperty({
        type: String,
        description: "event name",
    })
    name!: string;

    @ApiProperty({
        type: String,
        description: "signature of the event",
    })
    signature!: string;

    @ApiProperty({
        type: String,
        description: "the address the event originated from",
    })
    address!: string;
}

export class TransferEventParams {
    @ApiProperty()
    from!: string;

    @ApiProperty()
    to!: string;

    @ApiProperty()
    value!: string;
}

export class TransferEvent extends ContractEvent {
    @ApiProperty({
        type: TransferEventParams,
        description: "ERC20 Transfer event",
    })
    params!: TransferEventParams;

    @ApiProperty()
    name!: "Transfer";
}

export class ApprovalEventParams {
    @ApiProperty()
    owner!: string;

    @ApiProperty()
    spender!: string;

    @ApiProperty()
    value!: string;
}

export class ApprovalEvent extends ContractEvent {
    @ApiProperty({
        type: ApprovalEventParams,
        description: "ERC20 Approval event",
    })
    params!: ApprovalEventParams;

    @ApiProperty()
    name!: "Approval";
}

export class TransactionInfo extends TransactionBasicInfo {
    @ApiProperty({
        type: Number,
        description: "nonce of the transaction",
    })
    nonce!: number;

    @ApiProperty({
        type: Number,
        description: "index of this transaction in the block",
    })
    transactionIndex!: number;

    @ApiProperty({
        type: String,
        description: "sender address",
    })
    from!: string;

    @ApiProperty({
        type: String,
        description: "destination address",
    })
    to!: string;

    @ApiProperty({
        type: String,
        description: "value of the transaction",
    })
    value!: string;

    @ApiProperty({
        type: Number,
        description: "gas used in this transaction",
    })
    gasUsed!: number;

    @ApiProperty({
        type: String,
        description: "gas price",
    })
    gasPrice!: string;

    @ApiProperty({
        type: String,
        description: "input of the transaction",
    })
    input!: string;

    @ApiProperty({
        type: Boolean,
        description: "execution status of the transaction, true means the transaction is successful",
    })
    status!: boolean;

    @ApiProperty({
        type: [ContractEvent],
        description: "a list of events emitted in this transaction",
    })
    events!: ContractEvent[];
}

export class TransactionInfoData {
    @ApiProperty()
    tx!: TransactionInfo;
}

export default class TransactionInfoResponse extends Response {
    @ApiProperty({
        type: TransactionInfoData,
        description: "transaction information",
    })
    data!: TransactionInfoData | null;
};
