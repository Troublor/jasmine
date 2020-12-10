import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {Tags} from "./modules/common/tags";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {cors: true});
    const config = app.get<ConfigService>(ConfigService);

    const options = new DocumentBuilder()
        .setTitle("Jasmine Project Ethereum RESTful API")
        .setDescription("The RESTful API specification of Jasmine Project to retrieve data from Ethereum")
        .setVersion("0.1")
        .addTag(Tags.ETHEREUM)
        .addTag(Tags.LEGACY)
        .build();
    const document = SwaggerModule.createDocument(app, options, {});
    SwaggerModule.setup("api", app, document);

    const restfulPort = config.get<string>("services.restful.port", "restful port unprovided");
    await app.listen(restfulPort);
}

(async () => {
    await bootstrap();
})();
