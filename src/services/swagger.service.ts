import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerConfig } from '../config/swagger.config.js';

export interface ApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: Record<string, unknown>;
  deprecated?: boolean;
  security?: unknown[];
  [key: string]: unknown;
}

export interface ApiOperationWithRoute extends ApiOperation {
  path: string;
  method: string;
}

export interface OpenApiDocument {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  tags?: Array<{ name: string; description?: string }>;
  paths?: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, unknown>;
  };
  definitions?: Record<string, unknown>;
}

@Injectable()
export class SwaggerService {
  private readonly logger = new Logger(SwaggerService.name);
  private cachedDoc: OpenApiDocument | null = null;
  private readonly methods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Fetches and parses the OpenAPI/Swagger JSON document.
   * Supports Bearer token and Basic Auth.
   */
  async loadSwagger(forceRefresh = false): Promise<OpenApiDocument> {
    if (this.cachedDoc && !forceRefresh) {
      return this.cachedDoc;
    }

    const config = this.configService.get<SwaggerConfig>('swagger');
    const url = config?.url;

    if (!url) {
      throw new Error('SWAGGER_URL is not configured in environment variables');
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (config?.token) {
      headers.Authorization = `Bearer ${config.token}`;
    } else if (config?.username && config?.password) {
      const credentials = Buffer.from(
        `${config.username}:${config.password}`,
      ).toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    this.logger.log(`Fetching Swagger schema from: ${url}`);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Swagger documentation: ${response.status} ${response.statusText}`,
      );
    }

    const doc = (await response.json()) as OpenApiDocument;
    this.cachedDoc = doc;
    return doc;
  }

  /**
   * Extracts all operations with their HTTP methods and paths from the document.
   */
  getOperations(doc: OpenApiDocument): ApiOperationWithRoute[] {
    return Object.entries(doc.paths ?? {}).flatMap(([path, pathItem]) =>
      this.methods.flatMap((method) => {
        const operation = pathItem[method] as ApiOperation | undefined;
        return operation
          ? [{ path, method: method.toUpperCase(), ...operation }]
          : [];
      }),
    );
  }

  /**
   * List all unique API tags/modules.
   */
  async listApiModules() {
    const doc = await this.loadSwagger();
    const operations = this.getOperations(doc);
    const tags = new Set(operations.flatMap((api) => api.tags ?? []));

    return {
      title: doc.info?.title,
      version: doc.info?.version,
      description: doc.info?.description,
      modules: [...tags],
    };
  }

  /**
   * Search API endpoints by keyword across path, summary, description, operationId, and tags.
   */
  async searchApi(query: string): Promise<ApiOperationWithRoute[]> {
    const doc = await this.loadSwagger();
    const keyword = query.toLowerCase();

    return this.getOperations(doc).filter((api) =>
      [
        api.path,
        api.summary,
        api.description,
        api.operationId,
        ...(api.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }

  /**
   * Get full details for an endpoint by path and method.
   */
  async getApiDetails(path: string, method: string) {
    const doc = await this.loadSwagger();
    const pathItem = doc.paths?.[path];
    const operation = pathItem?.[method.toLowerCase()] as ApiOperation | undefined;

    if (!operation) {
      return {
        error: 'API endpoint not found',
        path,
        method,
      };
    }

    return {
      path,
      method: method.toUpperCase(),
      commonParameters: pathItem?.parameters ?? [],
      operation,
    };
  }

  /**
   * Retrieve request or response DTO schema definition by schema name.
   */
  async getApiSchema(schemaName: string) {
    const doc = await this.loadSwagger();
    const schemas: Record<string, unknown> = {
      ...(doc.definitions ?? {}),
      ...(doc.components?.schemas ?? {}),
    };

    const schema = schemas[schemaName];

    if (!schema) {
      return {
        error: 'Schema not found',
        availableSchemas: Object.keys(schemas),
      };
    }

    return {
      schemaName,
      schema,
    };
  }

  /**
   * Formats tool response content into standard MCP text result.
   */
  formatResult(data: unknown) {
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
}
