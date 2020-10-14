import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import configuration from "./config/configuration";
import TfcModule from "./modules/tfc/tfc.module";
import InfoQueryModule from "./modules/info-query/info-query.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration]
        }),
        // TfcModule,
        InfoQueryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
