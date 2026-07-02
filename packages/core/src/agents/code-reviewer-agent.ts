/**
 * Code Reviewer Agent
 * 
 * A comprehensive code review agent that analyzes code quality, best practices,
 * potential bugs, security issues, and provides actionable feedback.
 * 
 * Features:
 * - Multi-language support (TypeScript, Python, JavaScript, Go, Rust, etc.)
 * - Security vulnerability detection
 * - Performance anti-patterns
 * - Code style and maintainability
 * - Test coverage analysis
 * - Documentation review
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

// Output schema for structured feedback
const CodeReviewReportSchema = z.object({
  summary: z.object({
    total_files_reviewed: z.number(),
    total_lines_analyzed: z.number(),
    issues_found: z.number(),
    critical_issues: z.number(),
    warnings: z.number(),
    suggestions: z.number(),
    overall_rating: z.enum(['excellent', 'good', 'needs_work', 'poor']),
  }),
  findings: z.array(z.object({
    file: z.string(),
    line: z.number().optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    category: z.enum(['security', 'bug', 'performance', 'style', 'maintainability', 'documentation', 'best_practice']),
    title: z.string(),
    description: z.string(),
    suggestion: z.string().optional(),
    code_snippet: z.string().optional(),
  })),
  recommendations: z.array(z.object({
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    action: z.string(),
    reason: z.string(),
  })),
  strengths: z.array(z.object({
    file: z.string(),
    description: z.string(),
  })),
});

/**
 * Code Reviewer Agent
 * 
 * Performs comprehensive code review including:
 * - Security vulnerability scanning
 * - Bug detection
 * - Performance analysis
 * - Code style consistency
 * - Best practices compliance
 * - Documentation quality
 */
export const CodeReviewerAgent = (
  config: Config,
): LocalAgentDefinition<typeof CodeReviewReportSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'code_reviewer',
    kind: 'local',
    displayName: 'Code Reviewer Agent',
    description: `A comprehensive code review agent that analyzes code quality across multiple dimensions.
    
    Use this agent when you need:
    - Deep code quality analysis
    - Security vulnerability detection
    - Performance bottleneck identification
    - Bug pattern recognition
    - Code style consistency checking
    - Best practices validation
    - Test coverage assessment
    - Documentation review
    
    This agent supports: TypeScript, JavaScript, Python, Go, Rust, Java, C#, and more.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          target: z.object({
            type: 'string',
            description: 'File path, directory path, or code snippet to review',
          }),
          focus_areas: z.array(z.enum([
            'security', 'bug', 'performance', 'style', 
            'maintainability', 'documentation', 'testing', 'all'
          ])).optional(),
          language: z.string().optional(),
          review_type: z.enum(['quick', 'standard', 'deep']).default('standard'),
        },
        required: ['target'],
      },
    },
    
    outputConfig: {
      outputName: 'review_report',
      description: 'Comprehensive code review report',
      schema: CodeReviewReportSchema,
    },

    processOutput: (output) => {
      const formatted = {
        '# 📊 Code Review Report': '',
        '---': '',
        '## Summary': '',
        ...output.summary,
        '---': '',
        '## Findings': '',
      };
      
      if (output.findings.length > 0) {
        for (const finding of output.findings) {
          formatted[`### ${finding.severity.toUpperCase()} - ${finding.file}${finding.line ? `:${finding.line}` : ''}`] = '';
          formatted['**Title:**'] = finding.title;
          formatted['**Category:**'] = finding.category;
          formatted['**Description:**'] = finding.description;
          if (finding.suggestion) {
            formatted['**Suggestion:**'] = finding.suggestion;
          }
          if (finding.code_snippet) {
            formatted['```'] = finding.code_snippet;
            formatted['```'] = '';
          }
          formatted[''] = '';
        }
      }
      
      if (output.strengths.length > 0) {
        formatted['## Strengths'] = '';
        for (const strength of output.strengths) {
          formatted[`- **${strength.file}**: ${strength.description}`] = '';
        }
      }
      
      if (output.recommendations.length > 0) {
        formatted['## Recommendations'] = '';
        for (const rec of output.recommendations) {
          formatted[`[${rec.priority.toUpperCase()}] ${rec.action}`] = '';
          formatted[`> ${rec.reason}`] = '';
        }
      }
      
      return Object.entries(formatted).map(([k, v]) => v ? `${k}\n${v}` : k).join('\n');
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
      maxTimeMinutes: 15,
      maxTurns: 30,
    },

    promptConfig: {
      query: `Review the following code:\n${'$'}{target}\n\nReview Type: ${'$'}{review_type || 'standard'}\nFocus Areas: ${'${focus_areas || ["all"]}'}`,
      systemPrompt: `You are the **Code Reviewer Agent**, an expert in comprehensive code analysis.

## Your Expertise:
- **Security**: SQL injection, XSS, authentication flaws, secrets exposure, input validation
- **Bugs**: Null pointers, race conditions, error handling, edge cases
- **Performance**: Memory leaks, N+1 queries, unnecessary computations, inefficient algorithms
- **Style**: Naming conventions, code formatting, comment quality
- **Maintainability**: Code duplication, coupling, complexity, technical debt
- **Documentation**: README quality, JSDoc/docstrings, inline comments
- **Testing**: Coverage, edge case testing, mock usage

## Review Process:

### 1. Initial Scan
- Read all target files
- Count total lines of code
- Identify programming language(s)
- Note file structure and organization

### 2. Deep Analysis
For each file, analyze:

**Security Checkpoints:**
- Hardcoded credentials or secrets
- Unvalidated user input
- Insecure dependencies
- Authentication/authorization issues
- Injection vulnerabilities
- Insecure crypto usage

**Bug Detection:**
- Unhandled errors/exceptions
- Null/undefined access risks
- Async/await issues
- Resource leaks
- Logic errors
- Off-by-one errors

**Performance:**
- Inefficient loops/data structures
- Unnecessary API calls
- Missing caching opportunities
- Memory-intensive operations
- Database query optimization

**Code Quality:**
- Naming conventions
- Code duplication
- Function complexity
- Comment quality
- Import organization

### 3. Generate Report

For each issue found, provide:
- **File** and **Line** number
- **Severity**: critical, high, medium, low, info
- **Category**: security, bug, performance, style, etc.
- **Title**: Short summary
- **Description**: Detailed explanation
- **Suggestion**: How to fix it
- **Code Snippet**: Show the problematic code (if applicable)

### 4. Provide Recommendations

Prioritized list of actions:
1. Critical issues (must fix)
2. High priority (should fix)
3. Medium priority (consider fixing)
4. Low priority (nice to have)

### 5. Highlight Strengths

Don't just criticize - note what's done well:
- Clean architecture
- Good error handling
- Clear naming
- Comprehensive tests
- Good documentation

## Output Format:

Return a structured JSON report:

\`\`\`json
{
  "summary": {
    "total_files_reviewed": number,
    "total_lines_analyzed": number,
    "issues_found": number,
    "critical_issues": number,
    "warnings": number,
    "suggestions": number,
    "overall_rating": "excellent" | "good" | "needs_work" | "poor"
  },
  "findings": [
    {
      "file": "path/to/file",
      "line": 42,
      "severity": "critical",
      "category": "security",
      "title": "Hardcoded API Key",
      "description": "...",
      "suggestion": "...",
      "code_snippet": "..."
    }
  ],
  "recommendations": [
    {
      "priority": "critical",
      "action": "Remove hardcoded secrets",
      "reason": "..."
    }
  ],
  "strengths": [
    {
      "file": "path/to/file",
      "description": "Good error handling pattern"
    }
  ]
}
\`\`\`

## Severity Guidelines:

- **Critical**: Security vulnerability, data loss risk, crash potential
- **High**: Major bug, significant performance issue, maintainability problem
- **Medium**: Minor issue, code smell, style inconsistency
- **Low**: Nicety improvements, minor optimizations
- **Info**: Notes, observations, positive findings

## Quality Standards:

Be thorough but fair. Consider:
- Context of the code
- Intent of the original author
- Production readiness requirements
- Team's coding standards (if known)

Provide actionable, specific feedback that helps developers improve.`,
    },
  };
};

export default CodeReviewerAgent;