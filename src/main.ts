#!/usr/bin/env node
import 'reflect-metadata';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppModule } from './app.module.js';

/**
 * Custom logger directing all log levels to stderr to keep stdout
 * clean exclusively for MCP Stdio JSON-RPC protocol communication.
 */
class StderrLogger extends ConsoleLogger {
  protected override printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
  ) {
    super.printMessages(messages, context, logLevel, 'stderr');
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new StderrLogger(),
  });

  const server = app.get(McpServer);
  const transport = new StdioServerTransport();

  await server.connect(transport);
  process.stderr.write('Swagger MCP Server connected and listening on stdio\n');
}

bootstrap().catch((err) => {
  process.stderr.write(`Fatal error during startup: ${err?.stack || err}\n`);
  process.exit(1);
});
