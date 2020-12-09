import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import configuration from "./config/configuration";
import InfoQueryModule from "./modules/info-query/info-query.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
        }),
        InfoQueryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
