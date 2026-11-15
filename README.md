# Swagger MCP Server (NestJS / TypeScript)

A production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server built with NestJS and TypeScript to inspect, search, and navigate Swagger / OpenAPI 2.x and 3.x specifications via stdio.

---

## 📁 Project Structure

```
swagger-mcp/
├── src/
│   ├── config/
│   │   └── swagger.config.ts    # ConfigModule loader for Swagger settings & auth
│   ├── services/
│   │   └── swagger.service.ts   # Fetching, caching, parsing OpenAPI schemas & operations
│   ├── tools/
│   │   └── swagger.tools.ts     # MCP tools registration (list, search, details, schema)
│   ├── app.module.ts            # Root NestJS module wiring DI dependencies
│   └── main.ts                  # Application bootstrap & StdioServerTransport setup
├── .env                         # Local environment variables
├── .env.example                 # Example configuration template
├── package.json                 # Scripts and dependencies
└── tsconfig.json                # TypeScript NodeNext ESM compiler options
```

---

## ⚙️ Configuration (`.env`)

Configure your Swagger/OpenAPI target URL and credentials in [.env](file:///c:/Users/Sivaram/Documents/swagger-mcp/.env):

```env
SWAGGER_URL=https://api.example.com/api-json
SWAGGER_USERNAME=example
SWAGGER_PASSWORD=example

# Optional: Bearer token authentication (takes precedence over basic auth if provided)
# SWAGGER_TOKEN=your-bearer-token-here
```

---

## 🛠️ MCP Tools Provided

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `list_api_modules` | None | Lists all API tags/modules, API title, and version. |
| `search_api` | `query: string` | Searches endpoints by path, summary, description, operationId, or tags. |
| `get_api_details` | `path: string`, `method: string` | Returns full endpoint documentation (parameters, request body, responses). |
| `get_api_schema` | `schemaName: string` | Returns request/response DTO schemas from `definitions` or `components.schemas`. |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build TypeScript
```bash
npm run build
```

### 3. Run the Server
```bash
# Production mode (dist/main.js)
npm start

# Development mode (with live tsx execution)
npm run start:dev
```

---

## 🔌 Connecting to MCP Clients

Add the server to your MCP client configuration (e.g., Claude Desktop, Cursor, Antigravity, or Cline):

### Using NPX (Recommended - No installation required)

```json
{
  "mcpServers": {
    "swagger-api-reference": {
      "command": "npx",
      "args": ["-y", "@tsiva18/swagger-mcp-server"],
      "env": {
        "SWAGGER_URL": "https://api.example.com/api-json",
        "SWAGGER_USERNAME": "example",
        "SWAGGER_PASSWORD": "example"
      }
    }
  }
}
```

### Using Local Source

```json
{
  "mcpServers": {
    "swagger-api-reference": {
      "command": "node",
      "args": ["c:/Users/Sivaram/Documents/swagger-mcp/dist/main.js"],
      "env": {
        "SWAGGER_URL": "https://api.example.com/api-json",
        "SWAGGER_USERNAME": "example",
        "SWAGGER_PASSWORD": "example"
      }
    }
  }
}
```

> **Note on Stdio Isolation**: NestJS logs are directed strictly to `stderr` through a custom `StderrLogger`, guaranteeing that `stdout` remains reserved solely for clean MCP JSON-RPC protocol frames.
