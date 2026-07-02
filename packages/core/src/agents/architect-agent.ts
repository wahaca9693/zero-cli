/**
 * Architect Agent
 * 
 * Advanced system architecture design agent that:
 * - Designs scalable system architectures
 * - Creates architecture diagrams
 * - Evaluates design patterns
 * - Plans microservices
 * - Designs data models
 * - Evaluates trade-offs
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const ArchitectureDesignSchema = z.object({
  summary: z.object({
    architecture_type: z.string(),
    scalability_score: z.number(),
    maintainability_score: z.number(),
    estimated_complexity: z.enum(['low', 'medium', 'high', 'very_high']),
    estimated_cost: z.enum(['low', 'medium', 'high']),
  }),
  system_design: z.object({
    overview: z.string(),
    components: z.array(z.object({
      name: z.string(),
      type: z.enum(['service', 'database', 'cache', 'queue', 'gateway', 'worker', 'ui', 'storage']),
      description: z.string(),
      responsibilities: z.array(z.string()),
      dependencies: z.array(z.string()),
      technology_stack: z.object({
        language: z.string().optional(),
        framework: z.string().optional(),
        database: z.string().optional(),
        infrastructure: z.string().optional(),
      }).optional(),
    })),
    data_flow: z.array(z.object({
      from: z.string(),
      to: z.string(),
      protocol: z.string(),
      data_format: z.string().optional(),
    })),
    api_design: z.object({
      internal_apis: z.array(z.object({
        service: z.string(),
        endpoints: z.array(z.string()),
      })),
      external_apis: z.array(z.string()),
    }),
  }),
  patterns: z.array(z.object({
    name: z.string(),
    category: z.enum(['architectural', 'design', 'integration', 'messaging']),
    usage: z.string(),
    benefits: z.array(z.string()),
    trade_offs: z.array(z.string()),
    implementation_hints: z.string().optional(),
  })),
  scalability: z.object({
    horizontal_scaling: z.array(z.string()),
    vertical_scaling: z.array(z.string()),
    caching_strategy: z.string().optional(),
    load_balancing: z.array(z.string()),
    auto_scaling: z.array(z.string()),
  }),
  security: z.object({
    authentication: z.array(z.string()),
    authorization: z.array(z.string()),
    encryption: z.array(z.string()),
    network_security: z.array(z.string()),
  }),
  cost_estimation: z.object({
    infrastructure: z.array(z.object({
      component: z.string(),
      estimated_monthly_cost: z.string(),
      scaling_factor: z.string(),
    })),
    total_estimated_monthly: z.string(),
  }),
  risks: z.array(z.object({
    risk: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    mitigation: z.string(),
  })),
  implementation_phases: z.array(z.object({
    phase: z.number(),
    name: z.string(),
    duration_weeks: z.number(),
    deliverables: z.array(z.string()),
    dependencies: z.array(z.string()).optional(),
  })),
});

/**
 * Architect Agent
 */
export const ArchitectAgent = (
  config: Config,
): LocalAgentDefinition<typeof ArchitectureDesignSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'architect',
    kind: 'local',
    displayName: 'Architect Agent',
    description: `An advanced system architecture design agent.

    Use this agent when you need to:
    - Design scalable system architectures
    - Plan microservices decomposition
    - Create architecture diagrams
    - Evaluate design patterns
    - Design data models
    - Plan cloud infrastructure
    - Analyze trade-offs
    - Estimate costs
    
    This agent provides comprehensive architecture designs with
    implementation phases and risk assessments.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          project_type: z.enum(['web_app', 'mobile_app', 'api', 'microservices', 'ml_system', 'iot', 'data_pipeline', 'general']),
          requirements: z.string(),
          scale: z.enum(['startup', 'medium', 'enterprise', 'global']),
          constraints: z.array(z.string()).optional(),
          existing_architecture: z.string().optional(),
        },
        required: ['project_type', 'requirements'],
      },
    },
    
    outputConfig: {
      outputName: 'architecture_design',
      description: 'Comprehensive system architecture design',
      schema: ArchitectureDesignSchema,
    },

    processOutput: (output) => {
      let report = `# 🏗️ System Architecture Design Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Architecture Type | ${output.summary.architecture_type} |\n`;
      report += `| Scalability Score | ${output.summary.scalability_score}/10 |\n`;
      report += `| Maintainability | ${output.summary.maintainability_score}/10 |\n`;
      report += `| Complexity | ${output.summary.estimated_complexity} |\n`;
      report += `| Estimated Cost | ${output.summary.estimated_cost} |\n\n`;
      
      if (output.system_design) {
        report += `---\n\n## 🏛️ System Design\n\n`;
        report += `**Overview:** ${output.system_design.overview}\n\n`;
        
        if (output.system_design.components.length > 0) {
          report += `### Components\n\n`;
          report += `| Component | Type | Description |\n|----------|------|-------------|\n`;
          for (const comp of output.system_design.components) {
            report += `| ${comp.name} | ${comp.type} | ${comp.description.substring(0, 50)}... |\n`;
          }
        }
        
        if (output.system_design.data_flow.length > 0) {
          report += `\n### Data Flow\n\n`;
          for (const flow of output.system_design.data_flow) {
            report += `${flow.from} → ${flow.to} (${flow.protocol})\n`;
          }
        }
      }
      
      if (output.patterns.length > 0) {
        report += `---\n\n## 🎨 Design Patterns\n\n`;
        for (const pattern of output.patterns) {
          report += `### ${pattern.name}\n`;
          report += `**Category:** ${pattern.category}\n`;
          report += `**Usage:** ${pattern.usage}\n`;
          report += `**Benefits:** ${pattern.benefits.join(', ')}\n\n`;
        }
      }
      
      if (output.implementation_phases.length > 0) {
        report += `---\n\n## 📅 Implementation Phases\n\n`;
        for (const phase of output.implementation_phases) {
          report += `### Phase ${phase.phase}: ${phase.name}\n`;
          report += `**Duration:** ${phase.duration_weeks} weeks\n\n`;
          report += `**Deliverables:**\n`;
          for (const d of phase.deliverables) {
            report += `- ${d}\n`;
          }
          report += `\n`;
        }
      }
      
      return report;
    },

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.3,
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
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `Design architecture for: ${'$'}{project_type}\nRequirements: ${'$'}{requirements}\nScale: ${'$'}{scale}`,
      systemPrompt: `You are the **Architect Agent**, an expert in system design and architecture.

## Your Capabilities:

### Architecture Types
- Monolithic applications
- Microservices architecture
- Event-driven architecture
- Serverless architecture
- Hybrid approaches

### Design Patterns
- **Architectural**: Layered, MVC, Clean Architecture, Hexagonal
- **Design**: Factory, Repository, Observer, Strategy
- **Integration**: API Gateway, Message Queue, Event Bus
- **Messaging**: Pub/Sub, CQRS, Event Sourcing

### Scalability Considerations
- Horizontal vs Vertical scaling
- Database sharding
- Caching strategies
- Load balancing
- Auto-scaling

### Technology Selection
- Languages and frameworks
- Databases (SQL/NoSQL)
- Message queues
- Caching layers
- Cloud services

## Output Format:

\`\`\`json
{
  "summary": {
    "architecture_type": "Microservices",
    "scalability_score": 9,
    "maintainability_score": 8,
    "estimated_complexity": "high",
    "estimated_cost": "medium"
  },
  "system_design": {
    "components": [...],
    "data_flow": [...],
    "api_design": {...}
  },
  "patterns": [...],
  "scalability": {...},
  "security": {...},
  "cost_estimation": {...},
  "risks": [...],
  "implementation_phases": [...]
}
\`\`\`

Be comprehensive and consider all aspects of system design.`,
    },
  };
};

export default ArchitectAgent;