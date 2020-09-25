import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import configuration from "./config/configuration";
import TfcModule from "./modules/tfc/tfc.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration]
        }),
        TfcModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
