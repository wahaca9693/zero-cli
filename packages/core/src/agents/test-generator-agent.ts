/**
 * Test Generator Agent
 * 
 * Intelligent test generation agent that:
 * - Generates Unit tests
 * - Creates Integration tests
 * - Generates E2E tests
 * - Creates Mock data
 * - Covers edge cases
 * - Ensures high code coverage
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const TestGenerationSchema = z.object({
  summary: z.object({
    files_analyzed: z.number(),
    functions_tested: z.number(),
    test_files_created: z.number(),
    estimated_coverage_increase: z.number(),
    edge_cases_identified: z.number(),
  }),
  test_files: z.array(z.object({
    filename: z.string(),
    test_framework: z.string(),
    language: z.string(),
    test_count: z.number(),
    lines_of_code: z.number(),
    content: z.string(),
    coverage: z.object({
      lines_covered: z.number(),
      branches_covered: z.number(),
      functions_covered: z.number(),
    }),
  })),
  test_cases: z.array(z.object({
    name: z.string(),
    type: z.enum(['unit', 'integration', 'e2e', 'performance', 'security']),
    category: z.enum(['happy_path', 'edge_case', 'error_case', 'boundary', 'security']),
    description: z.string(),
    assertions: z.array(z.string()),
    mock_dependencies: z.array(z.string()).optional(),
  })),
  edge_cases: z.array(z.object({
    scenario: z.string(),
    input: z.string(),
    expected_output: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  coverage_report: z.object({
    before: z.number(),
    after: z.number(),
    improvement: z.number(),
    uncovered_areas: z.array(z.object({
      file: z.string(),
      lines: z.array(z.number()),
      reason: z.string(),
    })),
  }),
  recommendations: z.array(z.object({
    suggestion: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    effort: z.enum(['minutes', 'hours', 'days']),
  })),
});

/**
 * Test Generator Agent
 */
export const TestGeneratorAgent = (
  config: Config,
): LocalAgentDefinition<typeof TestGenerationSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'test_generator',
    kind: 'local',
    displayName: 'Test Generator Agent',
    description: `An intelligent test generation agent that creates comprehensive test suites.

    Use this agent when you need to:
    - Generate unit tests for functions
    - Create integration tests for APIs
    - Build end-to-end test scenarios
    - Generate mock data and stubs
    - Identify edge cases
    - Increase code coverage
    - Write performance tests
    - Create security tests
    
    Supports: Jest, Mocha, Pytest, JUnit, NUnit, Go testing, and more.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          target_paths: z.array(z.object({
            path: z.string(),
            type: z.enum(['file', 'directory', 'function']),
          })),
          test_framework: z.enum(['jest', 'mocha', 'pytest', 'junit', 'nunit', 'go_test', 'pytest', 'unittest', 'auto']).default('auto'),
          test_type: z.array(z.enum(['unit', 'integration', 'e2e', 'performance', 'security'])).default(['unit']),
          coverage_target: z.number().min(0).max(100).default(80),
          include_mocks: z.boolean().default(true),
          include_edge_cases: z.boolean().default(true),
        },
        required: ['target_paths'],
      },
    },
    
    outputConfig: {
      outputName: 'test_generation',
      description: 'Comprehensive test generation report',
      schema: TestGenerationSchema,
    },

    processOutput: (output) => {
      let report = `# 🧪 Test Generation Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Files Analyzed | ${output.summary.files_analyzed} |\n`;
      report += `| Functions Tested | ${output.summary.functions_tested} |\n`;
      report += `| Test Files Created | ${output.summary.test_files_created} |\n`;
      report += `| Coverage Increase | +${output.summary.estimated_coverage_increase}% |\n`;
      report += `| Edge Cases | ${output.summary.edge_cases_identified} |\n\n`;
      
      for (const testFile of output.test_files) {
        report += `---\n\n## 📄 ${testFile.filename}\n\n`;
        report += `**Framework:** ${testFile.test_framework}\n`;
        report += `**Language:** ${testFile.language}\n`;
        report += `**Tests:** ${testFile.test_count}\n`;
        report += `**Lines:** ${testFile.lines_of_code}\n\n`;
        report += `### Coverage\n\n`;
        report += `| Metric | Value |\n|--------|-------|\n`;
        report += `| Lines | ${testFile.coverage.lines_covered}% |\n`;
        report += `| Branches | ${testFile.coverage.branches_covered}% |\n`;
        report += `| Functions | ${testFile.coverage.functions_covered}% |\n\n`;
        report += `### Code\n\n`;
        report += `\`\`\`${testFile.language === 'python' ? 'python' : 'typescript'}\n${testFile.content.substring(0, 1000)}${testFile.content.length > 1000 ? '\n...' : ''}\n\`\`\`\n\n`;
      }
      
      if (output.test_cases.length > 0) {
        report += `---\n\n## 🎯 Test Cases\n\n`;
        const typeIcon = { unit: '⚡', integration: '🔗', e2e: '🌐', performance: '⚡', security: '🔒' };
        for (const tc of output.test_cases.slice(0, 15)) {
          report += `### ${typeIcon[tc.type]} ${tc.name}\n\n`;
          report += `**Type:** ${tc.type} | **Category:** ${tc.category}\n\n`;
          report += `**Description:** ${tc.description}\n\n`;
          report += `**Assertions:**\n`;
          for (const assertion of tc.assertions.slice(0, 5)) {
            report += `- \`${assertion}\`\n`;
          }
          report += `\n`;
        }
      }
      
      if (output.edge_cases.length > 0) {
        report += `---\n\n## ⚠️ Edge Cases Identified\n\n`;
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const ec of output.edge_cases) {
          report += `${priorityIcon[ec.priority]} **${ec.scenario}**\n`;
          report += `Input: \`${ec.input}\`\n`;
          report += `Expected: \`${ec.expected_output}\`\n\n`;
        }
      }
      
      if (output.coverage_report) {
        report += `---\n\n## 📊 Coverage Report\n\n`;
        report += `| Metric | Before | After | Change |\n|--------|--------|-------|--------|\n`;
        report += `| Coverage | ${output.coverage_report.before}% | ${output.coverage_report.after}% | +${output.coverage_report.improvement}% |\n\n`;
        
        if (output.coverage_report.uncovered_areas.length > 0) {
          report += `### Uncovered Areas\n\n`;
          for (const area of output.coverage_report.uncovered_areas) {
            report += `- **${area.file}**: Lines ${area.lines.join(', ')}\n`;
            report += `  ${area.reason}\n`;
          }
        }
      }
      
      if (output.recommendations.length > 0) {
        report += `---\n\n## 💡 Recommendations\n\n`;
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const rec of output.recommendations) {
          report += `${priorityIcon[rec.priority]} **[${rec.priority.toUpperCase()}]** ${rec.suggestion}\n`;
          report += `Effort: ${rec.effort}\n\n`;
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
      tools: [
        'read_file',
        'read_many_files',
        'glob',
        'grep',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `Generate tests for: ${'$'}{JSON.stringify(target_paths)}\nFramework: ${'$'}{test_framework}\nTypes: ${'${test_type?.join(", ")}'}\nCoverage Target: ${'$'}{coverage_target}%`,
      systemPrompt: `You are the **Test Generator Agent**, an expert in automated test generation.

## Your Capabilities:

### Test Types
- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user flows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability testing

### Test Frameworks
- Jest, Mocha (JavaScript/TypeScript)
- Pytest, unittest (Python)
- JUnit, TestNG (Java)
- NUnit, xUnit (C#)
- Go testing (Go)
- RSpec (Ruby)

### Test Generation
- Analyze source code
- Identify testable functions
- Generate test cases
- Create mock data
- Write assertions
- Handle dependencies

### Coverage Analysis
- Line coverage
- Branch coverage
- Function coverage
- Path coverage

### Edge Case Detection
- Null/undefined inputs
- Empty collections
- Boundary values
- Invalid inputs
- Error conditions
- Concurrency issues

## Analysis Process:

### 1. Code Analysis
- Read source files
- Identify functions/methods
- Map dependencies
- Understand logic flow

### 2. Test Case Generation
For each function:
- Happy path test
- Edge case tests
- Error case tests
- Boundary tests
- Security tests (if applicable)

### 3. Mock Generation
- Identify external dependencies
- Generate mock objects
- Create stub functions
- Set up test fixtures

### 4. Test File Creation
- Choose appropriate framework
- Generate test code
- Add assertions
- Include documentation

### 5. Coverage Analysis
- Run existing tests
- Measure current coverage
- Identify gaps
- Suggest improvements

## Output Format:

\`\`\`json
{
  "summary": {
    "files_analyzed": 10,
    "functions_tested": 25,
    "test_files_created": 5,
    "estimated_coverage_increase": 15,
    "edge_cases_identified": 42
  },
  "test_files": [
    {
      "filename": "user.service.test.ts",
      "test_framework": "jest",
      "language": "typescript",
      "test_count": 15,
      "content": "// Full test file content...",
      "coverage": {...}
    }
  ],
  "test_cases": [...],
  "edge_cases": [...],
  "coverage_report": {...},
  "recommendations": [...]
}
\`\`\`

## Quality Standards:

- Generate meaningful test names
- Use descriptive assertions
- Include setup and teardown
- Mock external dependencies
- Cover edge cases
- Write maintainable tests
- Add helpful comments`,
    },
  };
};

export default TestGeneratorAgent;