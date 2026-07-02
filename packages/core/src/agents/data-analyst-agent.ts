/**
 * Data Analyst Agent
 * 
 * Advanced data analysis agent that:
 * - Analyzes datasets (CSV, JSON, databases)
 * - Generates visualizations and charts
 * - Performs statistical analysis
 * - Creates data pipelines
 * - Generates insights and recommendations
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const DataAnalysisSchema = z.object({
  summary: z.object({
    datasets_analyzed: z.number(),
    total_rows: z.number(),
    total_columns: z.number(),
    file_types: z.array(z.string()),
    analysis_duration_ms: z.number(),
  }),
  data_profile: z.object({
    column_schemas: z.array(z.object({
      name: z.string(),
      data_type: z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'null', 'mixed']),
      null_count: z.number(),
      null_percentage: z.number(),
      unique_count: z.number(),
      sample_values: z.array(z.union([z.string(), z.number(), z.boolean()])),
      statistics: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        mean: z.number().optional(),
        median: z.number().optional(),
        std_dev: z.number().optional(),
        distribution: z.record(z.number()).optional(),
      }).optional(),
    })),
    data_quality: z.object({
      overall_score: z.number().min(0).max(100),
      issues: z.array(z.object({
        type: z.enum(['missing', 'duplicates', 'outliers', 'inconsistent', 'invalid']),
        column: z.string(),
        count: z.number(),
        severity: z.enum(['critical', 'high', 'medium', 'low']),
        suggestion: z.string(),
      })),
    }),
  }),
  statistical_analysis: z.object({
    correlations: z.array(z.object({
      variable1: z.string(),
      variable2: z.string(),
      correlation: z.number(),
      strength: z.enum(['strong_positive', 'moderate_positive', 'weak', 'moderate_negative', 'strong_negative']),
      p_value: z.number().optional(),
    })).optional(),
    trends: z.array(z.object({
      variable: z.string(),
      direction: z.enum(['increasing', 'decreasing', 'stable', 'fluctuating']),
      rate_of_change: z.string(),
      seasonal_pattern: z.boolean(),
    })).optional(),
    outliers: z.array(z.object({
      row_index: z.number(),
      column: z.string(),
      value: z.union([z.string(), z.number()]),
      z_score: z.number(),
      severity: z.enum(['critical', 'high', 'medium', 'low']),
    })),
  }),
  insights: z.array(z.object({
    insight: z.string(),
    type: z.enum(['correlation', 'trend', 'anomaly', 'pattern', 'comparison', 'prediction']),
    confidence: z.number(),
    supporting_evidence: z.array(z.string()),
    business_impact: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  })),
  visualizations: z.array(z.object({
    type: z.enum(['bar', 'line', 'pie', 'scatter', 'histogram', 'box', 'heatmap', 'time_series']),
    title: z.string(),
    description: z.string(),
    code: z.string(),
    insights: z.array(z.string()),
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    reason: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    effort: z.enum(['hours', 'days', 'weeks']),
    expected_impact: z.string(),
  })),
  data_transformations: z.array(z.object({
    operation: z.enum(['clean', 'filter', 'aggregate', 'join', 'pivot', 'transform']),
    description: z.string(),
    code: z.string(),
    parameters: z.record(z.unknown()),
  })),
  ml_predictions: z.object({
    models_tried: z.array(z.string()),
    best_model: z.string(),
    accuracy: z.number().optional(),
    features_important: z.array(z.object({
      feature: z.string(),
      importance: z.number(),
    })),
    predictions: z.array(z.record(z.unknown())).optional(),
  }).optional(),
});

/**
 * Data Analyst Agent
 */
export const DataAnalystAgent = (
  config: Config,
): LocalAgentDefinition<typeof DataAnalysisSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'data_analyst',
    kind: 'local',
    displayName: 'Data Analyst Agent',
    description: `An advanced data analysis agent that processes datasets and generates insights.

    Use this agent when you need to:
    - Analyze CSV, JSON, or database data
    - Generate statistical insights
    - Create data visualizations
    - Identify patterns and trends
    - Detect outliers and anomalies
    - Build data pipelines
    - Generate machine learning predictions
    - Create data quality reports
    
    This agent can work with structured data, generate charts,
    and provide actionable business insights.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          data_paths: z.array(z.object({
            path: z.string(),
            type: z.enum(['csv', 'json', 'xlsx', 'database', 'api', 'auto']).default('auto'),
          })),
          analysis_type: z.enum(['exploratory', 'statistical', 'predictive', 'full']).default('full'),
          generate_visualizations: z.boolean().default(true),
          build_models: z.boolean().default(false),
          target_variable: z.string().optional(),
          group_by: z.array(z.string()).optional(),
        },
        required: ['data_paths'],
      },
    },
    
    outputConfig: {
      outputName: 'data_analysis',
      description: 'Comprehensive data analysis report',
      schema: DataAnalysisSchema,
    },

    processOutput: (output) => {
      let report = `# 📊 Data Analysis Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Datasets | ${output.summary.datasets_analyzed} |\n`;
      report += `| Total Rows | ${output.summary.total_rows.toLocaleString()} |\n`;
      report += `| Total Columns | ${output.summary.total_columns} |\n`;
      report += `| Analysis Time | ${output.summary.analysis_duration_ms}ms |\n\n`;
      
      if (output.data_profile) {
        report += `---\n\n## Data Profile\n\n`;
        report += `### Column Schema\n\n`;
        report += `| Column | Type | Null % | Unique |\n|--------|------|--------|--------|\n`;
        for (const col of output.data_profile.column_schemas.slice(0, 15)) {
          report += `| ${col.name} | ${col.data_type} | ${col.null_percentage.toFixed(1)}% | ${col.unique_count} |\n`;
        }
        report += `\n`;
        
        if (output.data_profile.data_quality.issues.length > 0) {
          report += `### Data Quality Issues\n\n`;
          const severityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
          for (const issue of output.data_profile.data_quality.issues.slice(0, 10)) {
            report += `${severityIcon[issue.severity]} **${issue.type.toUpperCase()}** in ${issue.column}\n`;
            report += `> ${issue.suggestion}\n\n`;
          }
        }
      }
      
      if (output.statistical_analysis) {
        report += `---\n\n## Statistical Analysis\n\n`;
        
        if (output.statistical_analysis.correlations && output.statistical_analysis.correlations.length > 0) {
          report += `### Correlations\n\n`;
          report += `| Variables | Correlation | Strength |\n|----------|-------------|----------|\n`;
          for (const corr of output.statistical_analysis.correlations.slice(0, 10)) {
            const strengthIcon = {
              strong_positive: '🟢 +',
              moderate_positive: '🟡 +',
              weak: '⚪ ~',
              moderate_negative: '🟡 -',
              strong_negative: '🔴 -',
            };
            report += `| ${corr.variable1} ↔ ${corr.variable2} | ${corr.correlation.toFixed(3)} | ${strengthIcon[corr.strength]} |\n`;
          }
          report += `\n`;
        }
        
        if (output.statistical_analysis.outliers.length > 0) {
          report += `### Outliers Detected\n\n`;
          for (const outlier of output.statistical_analysis.outliers.slice(0, 5)) {
            report += `- **${outlier.column}**: ${outlier.value} (Z-score: ${outlier.z_score.toFixed(2)})\n`;
          }
          report += `\n`;
        }
      }
      
      if (output.insights.length > 0) {
        report += `---\n\n## 💡 Key Insights\n\n`;
        for (const insight of output.insights) {
          report += `- **[${insight.type.toUpperCase()}]** ${insight.insight}\n`;
          report += `  Confidence: ${(insight.confidence * 100).toFixed(0)}%\n`;
          if (insight.business_impact) {
            const impactIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
            report += `  Business Impact: ${impactIcon[insight.business_impact]} ${insight.business_impact}\n`;
          }
          report += `\n`;
        }
      }
      
      if (output.visualizations.length > 0) {
        report += `---\n\n## 📈 Visualizations\n\n`;
        for (const viz of output.visualizations) {
          report += `### ${viz.type.toUpperCase()}: ${viz.title}\n\n`;
          report += `${viz.description}\n\n`;
          report += `\`\`\`python\n${viz.code}\n\`\`\`\n\n`;
          if (viz.insights.length > 0) {
            report += `**Key Insights:**\n`;
            for (const insight of viz.insights) {
              report += `- ${insight}\n`;
            }
            report += `\n`;
          }
        }
      }
      
      if (output.recommendations.length > 0) {
        report += `---\n\n## 💡 Recommendations\n\n`;
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const rec of output.recommendations) {
          report += `${priorityIcon[rec.priority]} **[${rec.priority.toUpperCase()}]** ${rec.action}\n`;
          report += `> ${rec.reason}\n`;
          report += `Effort: ${rec.effort} | Impact: ${rec.expected_impact}\n\n`;
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
      maxTimeMinutes: 25,
      maxTurns: 50,
    },

    promptConfig: {
      query: `Analyze data: ${'$'}{JSON.stringify(data_paths)}\nType: ${'$'}{analysis_type}\nVisualizations: ${'${generate_visualizations}'}\nML Models: ${'${build_models}'}`,
      systemPrompt: `You are the **Data Analyst Agent**, an expert in data analysis and visualization.

## Your Capabilities:

### Data Processing
- Load CSV, JSON, Excel files
- Connect to databases and APIs
- Handle missing values
- Clean and transform data
- Merge and join datasets

### Statistical Analysis
- Descriptive statistics (mean, median, mode, std dev)
- Correlation analysis
- Hypothesis testing
- Trend analysis
- Outlier detection

### Data Quality
- Missing value analysis
- Duplicate detection
- Data type validation
- Consistency checks
- Outlier identification

### Visualizations
- Bar charts
- Line charts
- Scatter plots
- Histograms
- Pie charts
- Heatmaps
- Time series plots
- Box plots

### Machine Learning (optional)
- Regression models
- Classification models
- Feature importance
- Predictions
- Model evaluation

### Insights Generation
- Pattern recognition
- Trend identification
- Anomaly detection
- Comparative analysis
- Business insights

## Analysis Process:

### 1. Data Loading
- Identify data sources
- Load and parse files
- Handle encoding issues
- Validate data structure

### 2. Data Profiling
- Column types and counts
- Null value analysis
- Unique value counts
- Sample data inspection

### 3. Data Quality Assessment
- Check for issues
- Score data quality
- List problems found
- Suggest fixes

### 4. Statistical Analysis
- Calculate statistics
- Find correlations
- Detect trends
- Identify outliers

### 5. Visualization
- Choose appropriate charts
- Generate code
- Extract chart insights

### 6. Insights
- Identify patterns
- Generate insights
- Assess confidence
- Estimate business impact

### 7. Recommendations
- Suggest actions
- Prioritize recommendations
- Estimate effort
- Predict impact

## Output Format:

\`\`\`json
{
  "summary": {
    "datasets_analyzed": 2,
    "total_rows": 10000,
    "total_columns": 15,
    "file_types": ["csv", "json"],
    "analysis_duration_ms": 2500
  },
  "data_profile": {
    "column_schemas": [...],
    "data_quality": {...}
  },
  "statistical_analysis": {
    "correlations": [...],
    "outliers": [...]
  },
  "insights": [...],
  "visualizations": [...],
  "recommendations": [...]
}
\`\`\`

## Quality Standards:

- Provide accurate statistics
- Use appropriate visualizations
- Be clear about confidence levels
- Suggest actionable recommendations
- Handle edge cases`,
    },
  };
};

export default DataAnalystAgent;