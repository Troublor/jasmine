import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common";
import {Address, validateAndConvertAddress} from "jasmine-eth-ts";

@Injectable()
export default class AddressPipe implements PipeTransform<string, Address> {
    transform(value: string, metadata: ArgumentMetadata): Address {
        const addr = validateAndConvertAddress(value);
        if (!addr) {
            throw new BadRequestException("Bad Request", "Invalid Ethereum Address");
        }
        return addr;
    }
};
