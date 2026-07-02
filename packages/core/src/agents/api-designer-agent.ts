/**
 * API Designer Agent
 * 
 * Advanced API design agent that:
 * - Designs REST APIs
 * - Creates GraphQL schemas
 * - Defines OpenAPI specifications
 * - Generates API documentation
 * - Creates mock servers
 * - Validates API designs
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const APIDesignSchema = z.object({
  summary: z.object({
    endpoints_designed: z.number(),
    schemas_defined: z.number(),
    api_style: z.enum(['REST', 'GraphQL', 'gRPC', 'Mixed']),
    estimated_completion_hours: z.number(),
  }),
  api_specification: z.object({
    openapi_version: z.string(),
    title: z.string(),
    version: z.string(),
    description: z.string().optional(),
    base_url: z.string(),
    endpoints: z.array(z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']),
      summary: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()),
      request: z.object({
        headers: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean(),
          description: z.string(),
        })).optional(),
        path_params: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean(),
          description: z.string(),
        })).optional(),
        query_params: z.array(z.object({
          name: z.string(),
          type: z.string(),
          required: z.boolean(),
          description: z.string(),
          default: z.string().optional(),
        })).optional(),
        body: z.object({
          content_type: z.string(),
          schema: z.record(z.unknown()),
          example: z.record(z.unknown()).optional(),
        }).optional(),
      }).optional(),
      responses: z.array(z.object({
        status_code: z.number(),
        description: z.string(),
        content_type: z.string().optional(),
        schema: z.record(z.unknown()).optional(),
        example: z.record(z.unknown()).optional(),
      })),
      authentication: z.enum(['none', 'api_key', 'bearer', 'oauth2', 'basic']).optional(),
      rate_limit: z.object({
        requests: z.number(),
        period: z.string(),
      }).optional(),
    })),
    schemas: z.record(z.object({
      type: z.string(),
      properties: z.record(z.unknown()),
      required: z.array(z.string()).optional(),
      description: z.string().optional(),
      example: z.record(z.unknown()).optional(),
    })),
  }),
  implementation: z.object({
    language: z.string(),
    framework: z.string(),
    code: z.string(),
    tests: z.string().optional(),
  }),
  documentation: z.object({
    markdown: z.string(),
    examples: z.array(z.object({
      language: z.enum(['curl', 'python', 'javascript', 'typescript', 'go', 'java']),
      code: z.string(),
    })),
  }),
  validation: z.array(z.object({
    type: z.enum(['security', 'performance', 'usability', 'consistency']),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    message: z.string(),
    suggestion: z.string(),
  })),
  mock_server: z.object({
    language: z.string(),
    code: z.string(),
    setup_instructions: z.string(),
  }).optional(),
});

/**
 * API Designer Agent
 */
export const APIDesignerAgent = (
  config: Config,
): LocalAgentDefinition<typeof APIDesignSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'api_designer',
    kind: 'local',
    displayName: 'API Designer Agent',
    description: `An advanced API design agent that creates comprehensive API specifications.

    Use this agent when you need to:
    - Design REST APIs from scratch
    - Create GraphQL schemas
    - Generate OpenAPI/Swagger specifications
    - Define API documentation
    - Create mock servers
    - Validate existing API designs
    - Generate client SDKs
    - Design API authentication
    
    Supports REST, GraphQL, gRPC, and mixed architectures.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          description: z.string().describe('API description or requirements'),
          api_style: z.enum(['REST', 'GraphQL', 'gRPC', 'Mixed']).default('REST'),
          target_language: z.string().default('typescript'),
          target_framework: z.string().default('express'),
          include_mock_server: z.boolean().default(true),
          include_tests: z.boolean().default(true),
          include_documentation: z.boolean().default(true),
          authentication: z.enum(['none', 'api_key', 'bearer', 'oauth2', 'basic']).default('bearer'),
        },
        required: ['description'],
      },
    },
    
    outputConfig: {
      outputName: 'api_design',
      description: 'Comprehensive API design specification',
      schema: APIDesignSchema,
    },

    processOutput: (output) => {
      let report = `# 🔌 API Design Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| API Style | ${output.summary.api_style} |\n`;
      report += `| Endpoints | ${output.summary.endpoints_designed} |\n`;
      report += `| Schemas | ${output.summary.schemas_defined} |\n`;
      report += `| Est. Completion | ${output.summary.estimated_completion_hours}h |\n\n`;
      
      if (output.api_specification) {
        report += `---\n\n## 📋 API Specification\n\n`;
        report += `**Title:** ${output.api_specification.title}\n`;
        report += `**Version:** ${output.api_specification.version}\n`;
        report += `**Base URL:** ${output.api_specification.base_url}\n`;
        if (output.api_specification.description) {
          report += `**Description:** ${output.api_specification.description}\n`;
        }
        
        if (output.api_specification.endpoints.length > 0) {
          report += `\n### Endpoints\n\n`;
          report += `| Method | Path | Summary |\n|--------|------|--------|\n`;
          for (const ep of output.api_specification.endpoints) {
            const methodColor = {
              GET: '🟢', POST: '🔵', PUT: '🟡', PATCH: '🟠', DELETE: '🔴'
            };
            report += `| ${methodColor[ep.method]} ${ep.method} | ${ep.path} | ${ep.summary} |\n`;
          }
        }
        
        if (output.api_specification.schemas && Object.keys(output.api_specification.schemas).length > 0) {
          report += `\n### Schemas\n\n`;
          for (const [name, schema] of Object.entries(output.api_specification.schemas)) {
            report += `#### ${name}\n\n`;
            report += `\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\`\n\n`;
          }
        }
      }
      
      if (output.implementation) {
        report += `---\n\n## 💻 Implementation\n\n`;
        report += `**Language:** ${output.implementation.language}\n`;
        report += `**Framework:** ${output.implementation.framework}\n\n`;
        report += `### Code\n\n`;
        report += `\`\`\`${output.implementation.language === 'python' ? 'python' : 'typescript'}\n${output.implementation.code.substring(0, 1500)}${output.implementation.code.length > 1500 ? '\n...' : ''}\n\`\`\`\n\n`;
      }
      
      if (output.documentation) {
        report += `---\n\n## 📖 Documentation\n\n`;
        report += `### Code Examples\n\n`;
        for (const ex of output.documentation.examples.slice(0, 5)) {
          report += `#### ${ex.language.toUpperCase()}\n\n`;
          report += `\`\`\`${ex.language === 'python' ? 'python' : 'bash'}\n${ex.code.substring(0, 500)}\n\`\`\`\n\n`;
        }
      }
      
      if (output.validation.length > 0) {
        report += `---\n\n## ⚠️ Validation Issues\n\n`;
        const severityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const v of output.validation) {
          report += `${severityIcon[v.severity]} **[${v.type.toUpperCase()}]** ${v.message}\n`;
          report += `> Suggestion: ${v.suggestion}\n\n`;
        }
      }
      
      return report;
    },

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.2,
        topP: 0.95,
        thinkingConfig: supportsModernFeatures(model)
          ? { includeThoughts: true, thinkingBudget: -1 }
          : DEFAULT_THINKING_MODE,
      },
    },

    toolConfig: {
      tools: [
        'read_file',
        'glob',
        'grep',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 15,
      maxTurns: 30,
    },

    promptConfig: {
      query: `Design API for: ${'$'}{description}\nStyle: ${'$'}{api_style}\nFramework: ${'$'}{target_framework}\nAuth: ${'${authentication}'}`,
      systemPrompt: `You are the **API Designer Agent**, an expert in API design and specification.

## Your Capabilities:

### API Design Styles
- **REST**: Resource-based APIs with HTTP methods
- **GraphQL**: Query-based APIs with schemas
- **gRPC**: High-performance RPC with Protocol Buffers
- **Mixed**: Hybrid approaches combining multiple styles

### Specification Formats
- OpenAPI 3.0/3.1 (Swagger)
- GraphQL Schema Definition Language
- AsyncAPI for event-driven APIs
- JSON Schema for data validation

### Implementation
- Express.js / Fastify (Node.js)
- Flask / FastAPI (Python)
- Gin / Echo (Go)
- Spring Boot (Java)
- ASP.NET Core (C#)

### Authentication
- API Key
- Bearer Token (JWT)
- OAuth 2.0
- Basic Auth

### Features
- CRUD operations
- Pagination
- Filtering & Sorting
- Rate limiting
- Error handling
- HATEOAS support

## Design Process:

### 1. Requirements Analysis
- Understand business requirements
- Identify resources/entities
- Map relationships
- Define use cases

### 2. Resource Modeling
- Identify main resources
- Define resource hierarchies
- Map relationships
- Design URLs/naming

### 3. Endpoint Design
- Define HTTP methods
- Design request/response formats
- Handle errors
- Add pagination

### 4. Schema Design
- Define data models
- Add validation rules
- Document relationships
- Include examples

### 5. Security Design
- Choose authentication method
- Define authorization rules
- Add rate limiting
- Consider CORS

### 6. Documentation
- Write descriptions
- Add examples
- Document error codes
- Include usage scenarios

## Output Format:

\`\`\`json
{
  "summary": {
    "endpoints_designed": 15,
    "schemas_defined": 8,
    "api_style": "REST",
    "estimated_completion_hours": 40
  },
  "api_specification": {
    "openapi_version": "3.0.0",
    "title": "My API",
    "version": "1.0.0",
    "base_url": "/api/v1",
    "endpoints": [...],
    "schemas": {...}
  },
  "implementation": {...},
  "documentation": {...},
  "validation": [...],
  "mock_server": {...}
}
\`\`\`

## Quality Standards:

- Follow REST conventions
- Use consistent naming
- Provide clear documentation
- Include error handling
- Add validation rules
- Test all endpoints`,
    },
  };
};

export default APIDesignerAgent;