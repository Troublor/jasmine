import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {cors: true});
    const config = app.get<ConfigService>(ConfigService);
    const options = new DocumentBuilder()
        .setTitle('Jasmine Project Ethereum RESTful API')
        .setDescription('The RESTful API specification of Jasmine Project to retrieve data from Ethereum')
        .setVersion('0.1')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    await app.listen(config.get<string>('port'));
}

bootstrap();
