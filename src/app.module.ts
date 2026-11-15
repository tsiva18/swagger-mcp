import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { swaggerConfig } from './config/swagger.config.js';
import { SwaggerService } from './services/swagger.service.js';
import { SwaggerTools } from './tools/swagger.tools.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [swaggerConfig],
      envFilePath: ['.env'],
    }),
  ],
  providers: [
    {
      provide: McpServer,
      useFactory: () => {
        return new McpServer({
          name: 'swagger-api-reference',
          version: '1.0.0',
        });
      },
    },
    SwaggerService,
    SwaggerTools,
  ],
  exports: [McpServer, SwaggerService, SwaggerTools],
})
export class AppModule {}
