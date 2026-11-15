import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SwaggerService } from '../services/swagger.service.js';

@Injectable()
export class SwaggerTools implements OnModuleInit {
  private readonly logger = new Logger(SwaggerTools.name);

  constructor(
    private readonly mcpServer: McpServer,
    private readonly swaggerService: SwaggerService,
  ) {}

  onModuleInit() {
    this.registerTools(this.mcpServer);
  }

  /**
   * Registers all Swagger MCP tools with the provided McpServer instance.
   */
  public registerTools(server: McpServer): void {
    this.logger.log('Registering Swagger MCP tools...');

    // 1. List API modules
    server.registerTool(
      'list_api_modules',
      {
        description: 'List all API modules/tags in Swagger.',
        inputSchema: {},
      },
      async () => {
        try {
          const data = await this.swaggerService.listApiModules();
          return this.swaggerService.formatResult(data);
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          return this.swaggerService.formatResult({ error: errMessage });
        }
      },
    );

    // 2. Search APIs
    server.registerTool(
      'search_api',
      {
        description:
          'Search API endpoints by module, path, summary or operation ID.',
        inputSchema: {
          query: z.string().describe('Keyword or search query'),
        },
      },
      async ({ query }) => {
        try {
          const matches = await this.swaggerService.searchApi(query);
          return this.swaggerService.formatResult(matches);
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          return this.swaggerService.formatResult({ error: errMessage });
        }
      },
    );

    // 3. Get API details
    server.registerTool(
      'get_api_details',
      {
        description:
          'Get complete endpoint documentation including parameters, request body and responses.',
        inputSchema: {
          path: z.string().describe('API endpoint path (e.g. /users/{id})'),
          method: z.string().describe('HTTP method (e.g. GET, POST, PUT, DELETE)'),
        },
      },
      async ({ path, method }) => {
        try {
          const details = await this.swaggerService.getApiDetails(path, method);
          return this.swaggerService.formatResult(details);
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          return this.swaggerService.formatResult({ error: errMessage });
        }
      },
    );

    // 4. Get DTO/schema details
    server.registerTool(
      'get_api_schema',
      {
        description:
          'Get request or response DTO schema definitions by schema name.',
        inputSchema: {
          schemaName: z.string().describe('Name of the DTO/schema definition'),
        },
      },
      async ({ schemaName }) => {
        try {
          const schema = await this.swaggerService.getApiSchema(schemaName);
          return this.swaggerService.formatResult(schema);
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : String(error);
          return this.swaggerService.formatResult({ error: errMessage });
        }
      },
    );

    this.logger.log('Swagger MCP tools registered successfully.');
  }
}
