/**
 * Performance Analyzer Agent
 * 
 * A specialized agent for analyzing and optimizing code performance.
 * Performs:
 * - Time complexity analysis
 * - Space complexity analysis
 * - Algorithm optimization
 * - Database query optimization
 * - Memory usage analysis
 * - Caching opportunities
 * - Concurrency analysis
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const PerformanceReportSchema = z.object({
  summary: z.object({
    target: z.string(),
    total_files_analyzed: z.number(),
    issues_found: z.number(),
    critical_performance_issues: z.number(),
    optimization_opportunities: z.number(),
    estimated_speedup_potential: z.string(),
    overall_performance_rating: z.enum(['excellent', 'good', 'moderate', 'poor']),
  }),
  complexity_analysis: z.array(z.object({
    file: z.string(),
    function: z.string().optional(),
    line: z.number().optional(),
    time_complexity: z.enum(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)']),
    space_complexity: z.enum(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)']),
    assessment: z.string(),
    risk_level: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  findings: z.array(z.object({
    category: z.enum([
      'algorithm', 'database', 'memory', 'network',
      'caching', 'concurrency', 'io', 'data_structure'
    ]),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    title: z.string(),
    description: z.string(),
    file: z.string(),
    line: z.number().optional(),
    current_impact: z.string(),
    estimated_impact: z.string(),
    optimization_suggestion: z.object({
      approach: z.string(),
      code_example: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      estimated_time_saved: z.string(),
    }),
  })),
  recommendations: z.array(z.object({
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    category: z.string(),
    action: z.string(),
    reason: z.string(),
    expected_improvement: z.string(),
  })),
  quick_wins: z.array(z.object({
    file: z.string(),
    line: z.number(),
    description: z.string(),
    effort: z.enum(['minutes', 'hours', 'days']),
    impact: z.enum(['high', 'medium', 'low']),
    code_change_preview: z.string(),
  })),
});

/**
 * Performance Analyzer Agent
 */
export const PerformanceAnalyzerAgent = (
  config: Config,
): LocalAgentDefinition<typeof PerformanceReportSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'performance_analyzer',
    kind: 'local',
    displayName: 'Performance Analyzer Agent',
    description: `A comprehensive performance analysis agent for identifying bottlenecks and optimization opportunities.

    Use this agent when you need:
    - Time complexity analysis
    - Space complexity analysis
    - Database query optimization
    - Memory leak detection
    - Network latency issues
    - Caching recommendations
    - Algorithm improvements
    - Concurrency analysis
    
    Supports: TypeScript, JavaScript, Python, Go, Java, C#, and more.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          target: z.object({
            type: 'string',
            description: 'File path, directory, or code snippet to analyze',
          }),
          analysis_type: z.enum([
            'quick', 'standard', 'deep', 'database_focused'
          ]).default('standard'),
          language: z.string().optional(),
        },
        required: ['target'],
      },
    },
    
    outputConfig: {
      outputName: 'performance_report',
      description: 'Comprehensive performance analysis report',
      schema: PerformanceReportSchema,
    },

    processOutput: (output) => {
      let report = `# ⚡ Performance Analysis Report\n\n`;
      report += `**Target:** ${output.summary.target}\n`;
      report += `**Files Analyzed:** ${output.summary.total_files_analyzed}\n`;
      report += `**Performance Rating:** `;
      
      const ratingEmoji = {
        excellent: '🟢 Excellent',
        good: '🟡 Good',
        moderate: '🟠 Moderate',
        poor: '🔴 Poor',
      };
      report += `${ratingEmoji[output.summary.overall_performance_rating]}\n\n`;
      
      report += `---\n\n## 📊 Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Total Issues | ${output.summary.issues_found} |\n`;
      report += `| Critical Issues | ${output.summary.critical_performance_issues} |\n`;
      report += `| Optimization Opportunities | ${output.summary.optimization_opportunities} |\n`;
      report += `| Estimated Speedup | ${output.summary.estimated_speedup_potential} |\n\n`;
      
      if (output.complexity_analysis.length > 0) {
        report += `---\n\n## 🔢 Complexity Analysis\n\n`;
        report += `| File | Time | Space | Assessment |\n`;
        report += `|------|------|-------|------------|\n`;
        for (const c of output.complexity_analysis) {
          const riskEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
          report += `| ${c.file}${c.line ? ':' + c.line : ''} | ${c.time_complexity} | ${c.space_complexity} | ${riskEmoji[c.risk_level]} ${c.assessment} |\n`;
        }
        report += `\n`;
      }
      
      if (output.quick_wins.length > 0) {
        report += `---\n\n## 🚀 Quick Wins\n\n`;
        for (const qw of output.quick_wins) {
          report += `### ${qw.file}:${qw.line}\n`;
          report += `**${qw.description}**\n`;
          report += `Effort: ${qw.effort} | Impact: ${qw.impact}\n\n`;
          report += `\`\`\`\n${qw.code_change_preview}\n\`\`\`\n\n`;
        }
      }
      
      if (output.findings.length > 0) {
        report += `---\n\n## 🔍 Detailed Findings\n\n`;
        for (const f of output.findings) {
          const sevEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', info: 'ℹ️' };
          report += `### ${sevEmoji[f.severity]} ${f.title}\n`;
          report += `**Category:** ${f.category} | **File:** ${f.file}${f.line ? ':' + f.line : ''}\n\n`;
          report += `**Description:** ${f.description}\n\n`;
          report += `**Current Impact:** ${f.current_impact}\n`;
          report += `**Estimated Impact:** ${f.estimated_impact}\n\n`;
          report += `**Optimization:** ${f.optimization_suggestion.approach}\n`;
          report += `Difficulty: ${f.optimization_suggestion.difficulty} | Time Saved: ${f.optimization_suggestion.estimated_time_saved}\n\n`;
        }
      }
      
      if (output.recommendations.length > 0) {
        report += `---\n\n## 💡 Recommendations\n\n`;
        for (const r of output.recommendations) {
          const prioEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
          report += `${prioEmoji[r.priority]} **[${r.category}]** ${r.action}\n`;
          report += `> ${r.reason}\n`;
          report += `> Expected: ${r.expected_improvement}\n\n`;
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
      maxTimeMinutes: 15,
      maxTurns: 30,
    },

    promptConfig: {
      query: `Analyze performance of: ${'$'}{target}\n\nAnalysis Type: ${'$'}{analysis_type || 'standard'}`,
      systemPrompt: `You are the **Performance Analyzer Agent**, an expert in code performance optimization.

## Your Expertise:

### Algorithm Analysis
- Time complexity (Big O notation)
- Space complexity
- Data structure selection
- Algorithm choice optimization

### Database Optimization
- N+1 query problems
- Missing indexes
- Query optimization
- Connection pooling
- Batch operations

### Memory Analysis
- Memory leaks
- Unnecessary allocations
- Large object handling
- Buffer optimization

### Network Optimization
- Request batching
- Compression
- Connection reuse
- Caching strategies

### Caching Strategies
- Application-level caching
- Database query caching
- CDN usage
- Memoization

### Concurrency
- Thread safety
- Lock contention
- Async/await optimization
- Parallel processing

## Analysis Process:

### 1. Code Profiling
- Identify hot paths
- Find repeated operations
- Detect unnecessary work
- Map data flow

### 2. Complexity Analysis
For each function:
- Calculate time complexity
- Calculate space complexity
- Identify algorithmic bottlenecks

### 3. Database Analysis
- Find N+1 queries
- Identify missing indexes
- Check query efficiency
- Look for batch opportunities

### 4. Memory Analysis
- Detect allocations in loops
- Find memory leaks
- Identify large data structures
- Check for proper cleanup

### 5. Network Analysis
- Count API calls
- Look for batching
- Check caching headers
- Identify redundant requests

### 6. Generate Report

\`\`\`json
{
  "summary": {
    "target": "...",
    "total_files_analyzed": 0,
    "issues_found": 0,
    "critical_performance_issues": 0,
    "optimization_opportunities": 0,
    "estimated_speedup_potential": "...",
    "overall_performance_rating": "excellent|good|moderate|poor"
  },
  "complexity_analysis": [
    {
      "file": "path/to/file.ts",
      "function": "processData",
      "line": 42,
      "time_complexity": "O(n²)",
      "space_complexity": "O(n)",
      "assessment": "Nested loop causing quadratic behavior",
      "risk_level": "high"
    }
  ],
  "findings": [
    {
      "category": "database",
      "severity": "critical",
      "title": "N+1 Query Problem",
      "description": "...",
      "file": "...",
      "line": 42,
      "current_impact": "1000 queries for 1000 users",
      "estimated_impact": "1 query after fix",
      "optimization_suggestion": {
        "approach": "Use JOIN or batch query",
        "code_example": "const users = await db.query('SELECT * FROM users WHERE id IN (?)', [userIds]);",
        "difficulty": "easy",
        "estimated_time_saved": "90% reduction in query time"
      }
    }
  ],
  "recommendations": [
    {
      "priority": "critical",
      "category": "database",
      "action": "Add database index on user_id column",
      "reason": "Foreign key lookups are causing sequential scans",
      "expected_improvement": "10x faster queries"
    }
  ],
  "quick_wins": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "description": "Add memoization to expensive computation",
      "effort": "minutes",
      "impact": "high",
      "code_change_preview": "const cache = new Map();\\nconst cached = cache.get(key) || computeExpensive(key);"
    }
  ]
}
\`\`\`

## Complexity Reference:

| Complexity | Rating | Description |
|------------|--------|-------------|
| O(1) | 🟢 Excellent | Constant time |
| O(log n) | 🟢 Good | Logarithmic |
| O(n) | 🟡 Acceptable | Linear |
| O(n log n) | 🟡 Moderate | Linearithmic |
| O(n²) | 🟠 Warning | Quadratic |
| O(n³) | 🔴 Bad | Cubic |
| O(2^n) | 🔴 Bad | Exponential |
| O(n!) | 🔴 Bad | Factorial |

## Quality Standards:

- Provide specific code locations
- Include before/after examples
- Estimate improvement percentages
- Prioritize by impact/effort ratio
- Include difficulty ratings`,
    },
  };
};

export default PerformanceAnalyzerAgent;