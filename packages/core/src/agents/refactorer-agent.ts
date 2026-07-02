/**
 * Refactorer Agent
 * 
 * Advanced code refactoring agent that:
 * - Refactors complex code
 * - Improves code quality
 * - Reduces technical debt
 * - Applies design patterns
 * - Modernizes legacy code
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const RefactoringSchema = z.object({
  summary: z.object({
    files_refactored: z.number(),
    code_smells_fixed: z.number(),
    technical_debt_reduced: z.number(),
    estimated_improvement: z.string(),
  }),
  refactoring_plan: z.array(z.object({
    file: z.string(),
    current_issues: z.array(z.string()),
    refactoring_type: z.enum(['extract_method', 'rename', 'move', 'inline', 'extract_class', 'introduce_pattern', 'simplify_conditional', 'cleanup']),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    description: z.string(),
    before_code: z.string().optional(),
    after_code: z.string().optional(),
  })),
  patterns_applied: z.array(z.object({
    pattern: z.string(),
    locations: z.array(z.string()),
    benefits: z.array(z.string()),
  })),
  warnings: z.array(z.object({
    file: z.string(),
    message: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
  })),
});

/**
 * Refactorer Agent
 */
export const RefactorerAgent = (
  config: Config,
): LocalAgentDefinition<typeof RefactoringSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'refactorer',
    kind: 'local',
    displayName: 'Refactorer Agent',
    description: `An advanced code refactoring agent.

    Use this agent when you need to:
    - Refactor complex code
    - Reduce technical debt
    - Apply design patterns
    - Improve code quality
    - Modernize legacy code
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          target_paths: z.array(z.string()),
          refactoring_type: z.enum(['full', 'targeted', 'incremental']),
          focus_areas: z.array(z.string()).optional(),
        },
        required: ['target_paths'],
      },
    },
    
    outputConfig: {
      outputName: 'refactoring_plan',
      description: 'Comprehensive refactoring plan',
      schema: RefactoringSchema,
    },

    processOutput: (output) => {
      let report = `# 🔄 Refactoring Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Files | ${output.summary.files_refactored} |\n`;
      report += `| Code Smells | ${output.summary.code_smells_fixed} |\n`;
      report += `| Tech Debt | -${output.summary.technical_debt_reduced}% |\n`;
      report += `| Improvement | ${output.summary.estimated_improvement} |\n\n`;
      
      if (output.refactoring_plan.length > 0) {
        report += `---\n\n## Refactoring Plan\n\n`;
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const plan of output.refactoring_plan) {
          report += `### ${priorityIcon[plan.priority]} ${plan.file}\n`;
          report += `**Type:** ${plan.refactoring_type}\n\n`;
          report += `**Issues:**\n`;
          for (const issue of plan.current_issues) {
            report += `- ${issue}\n`;
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
      tools: ['read_file', 'read_many_files', 'glob', 'grep', 'bash'],
    },

    runConfig: {
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `Refactor code in: ${'$'}{JSON.stringify(target_paths)}\nType: ${'$'}{refactoring_type}`,
      systemPrompt: `You are the **Refactorer Agent**, an expert in code refactoring.

## Your Capabilities:

### Refactoring Types
- Extract Method
- Rename Variables/Classes
- Move Code
- Inline Code
- Extract Class
- Introduce Pattern
- Simplify Conditionals
- Remove Dead Code
- Cleanup Comments

### Patterns
- Factory Method
- Strategy Pattern
- Observer Pattern
- Repository Pattern
- Dependency Injection

Be thorough and provide before/after code.`,
    },
  };
};

export default RefactorerAgent;