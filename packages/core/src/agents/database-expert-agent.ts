/**
 * Database Expert Agent
 * 
 * Advanced database design and optimization agent that:
 * - Designs database schemas
 * - Optimizes queries
 * - Creates indexes
 * - Manages migrations
 * - Designs for scalability
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const DatabaseDesignSchema = z.object({
  summary: z.object({
    database_type: z.enum(['SQL', 'NoSQL', 'Graph', 'TimeSeries', 'Mixed']),
    complexity: z.enum(['simple', 'moderate', 'complex', 'very_complex']),
    tables_collections: z.number(),
    estimated_data_volume: z.string(),
  }),
  schema_design: z.object({
    entities: z.array(z.object({
      name: z.string(),
      type: z.enum(['table', 'collection', 'document']),
      fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        constraints: z.array(z.string()),
        indexed: z.boolean(),
        required: z.boolean(),
        description: z.string().optional(),
      })),
      primary_key: z.string(),
      foreign_keys: z.array(z.object({
        column: z.string(),
        references: z.string(),
        on_delete: z.enum(['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION']),
      })).optional(),
      indexes: z.array(z.object({
        columns: z.array(z.string()),
        type: z.enum(['BTREE', 'HASH', 'GIN', 'GIN', 'FULLTEXT']),
        unique: z.boolean(),
      })),
      description: z.string().optional(),
    })),
    relationships: z.array(z.object({
      type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
      from_entity: z.string(),
      to_entity: z.string(),
      description: z.string(),
    })),
    normalization: z.object({
      level: z.enum(['1NF', '2NF', '3NF', 'BCNF']),
      issues: z.array(z.string()).optional(),
    }),
  }),
  queries: z.array(z.object({
    name: z.string(),
    type: z.enum(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'AGGREGATE']),
    description: z.string(),
    sql: z.string(),
    performance_considerations: z.array(z.string()),
    estimated_complexity: z.enum(['simple', 'moderate', 'complex', 'very_complex']),
  })),
  migrations: z.array(z.object({
    version: z.string(),
    description: z.string(),
    up: z.string(),
    down: z.string(),
  })),
  optimizations: z.array(z.object({
    type: z.enum(['index', 'query', 'schema', 'partition', 'cache']),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high', 'critical']),
    implementation: z.string(),
  })),
  backup_strategy: z.object({
    method: z.string(),
    frequency: z.string(),
    retention: z.string(),
    recovery_point_objective: z.string(),
    recovery_time_objective: z.string(),
  }),
});

/**
 * Database Expert Agent
 */
export const DatabaseExpertAgent = (
  config: Config,
): LocalAgentDefinition<typeof DatabaseDesignSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'database_expert',
    kind: 'local',
    displayName: 'Database Expert Agent',
    description: `An advanced database design and optimization agent.

    Use this agent when you need to:
    - Design database schemas
    - Optimize queries
    - Create indexes
    - Manage migrations
    - Design for scalability
    - Choose database types
    - Normalize/denormalize data
    
    Supports: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, and more.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          task: z.enum(['design', 'optimize', 'migrate', 'review', 'debug']),
          database_type: z.enum(['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'auto']).default('auto'),
          requirements: z.string(),
          existing_schema: z.string().optional(),
          expected_volume: z.string().optional(),
        },
        required: ['task', 'requirements'],
      },
    },
    
    outputConfig: {
      outputName: 'database_design',
      description: 'Comprehensive database design and optimization',
      schema: DatabaseDesignSchema,
    },

    processOutput: (output) => {
      let report = `# 🗄️ Database Design Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Database Type | ${output.summary.database_type} |\n`;
      report += `| Complexity | ${output.summary.complexity} |\n`;
      report += `| Tables/Collections | ${output.summary.tables_collections} |\n`;
      report += `| Data Volume | ${output.summary.estimated_data_volume} |\n\n`;
      
      if (output.schema_design) {
        report += `---\n\n## Schema Design\n\n`;
        
        for (const entity of output.schema_design.entities) {
          report += `### ${entity.name}\n`;
          report += `**Type:** ${entity.type} | **PK:** ${entity.primary_key}\n\n`;
          report += `| Field | Type | Indexed | Required |\n|--------|------|---------|----------|\n`;
          for (const field of entity.fields) {
            report += `| ${field.name} | ${field.type} | ${field.indexed ? '✅' : '❌'} | ${field.required ? '✅' : '❌'} |\n`;
          }
          
          if (entity.indexes.length > 0) {
            report += `\n**Indexes:**\n`;
            for (const idx of entity.indexes) {
              report += `- ${idx.type}: ${idx.columns.join(', ')} ${idx.unique ? '(UNIQUE)' : ''}\n`;
            }
          }
          report += `\n`;
        }
      }
      
      return report;
    },

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.1,
        topP: 0.95,
        thinkingConfig: supportsModernFeatures(model)
          ? { includeThoughts: true, thinkingBudget: -1 }
          : DEFAULT_THINKING_MODE,
      },
    },

    toolConfig: {
      tools: ['read_file', 'glob', 'grep', 'bash'],
    },

    runConfig: {
      maxTimeMinutes: 15,
      maxTurns: 30,
    },

    promptConfig: {
      query: `Database task: ${'$'}{task}\nType: ${'$'}{database_type}\nRequirements: ${'$'}{requirements}`,
      systemPrompt: `You are the **Database Expert Agent**, an expert in database design and optimization.

## Your Capabilities:

### Database Types
- SQL: PostgreSQL, MySQL, SQLite, SQL Server
- NoSQL: MongoDB, Cassandra, DynamoDB
- Graph: Neo4j, Amazon Neptune
- TimeSeries: InfluxDB, TimescaleDB
- Cache: Redis, Memcached
- Search: Elasticsearch, Solr

### Design Services
- Schema design
- Index creation
- Query optimization
- Data modeling
- Normalization/Denormalization
- Migration planning

Be comprehensive in your database designs.`,
    },
  };
};

export default DatabaseExpertAgent;