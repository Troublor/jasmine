import {Module} from "@nestjs/common";
import TfcController from "./tfc.controller";
import TfcService from "./tfc.service";

@Module({
    controllers: [TfcController],
    providers:[TfcService],
})
export default class TfcModule {
};
