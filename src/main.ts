import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AsanaWrapperInterceptor } from './common/interceptors/asana-wrapper.interceptor';
import { AsanaExceptionFilter } from './common/filters/asana-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Strips away fields not in your DTO
    forbidNonWhitelisted: true,    // Throws error if extra fields are sent
    transform: true,               // Automatically transforms payloads to DTO instances
  }));


  app.useGlobalFilters(new AsanaExceptionFilter());
  app.useGlobalInterceptors(new AsanaWrapperInterceptor());
  
  const config = new DocumentBuilder()
    .setTitle('Asana Backend Replica')
    .setDescription('OpenAPI-driven Asana-like backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();