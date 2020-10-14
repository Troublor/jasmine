import {Module} from "@nestjs/common";
import InfoQueryController from "./info-query.controller";
import InfoQueryService from "./info-query.service";

@Module({
    controllers: [InfoQueryController],
    providers: [InfoQueryService],
})
export default class InfoQueryModule {
}
