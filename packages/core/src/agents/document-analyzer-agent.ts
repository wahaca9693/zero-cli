/**
 * Document Analyzer Agent
 * 
 * Advanced document processing agent that:
 * - Parses PDF documents
 * - Extracts from Word documents
 * - Processes Excel/CSV files
 * - Analyzes PowerPoint presentations
 * - Extracts structured data from documents
 * - Compares multiple documents
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const DocumentAnalysisSchema = z.object({
  summary: z.object({
    documents_processed: z.number(),
    total_pages: z.number().optional(),
    total_words: z.number(),
    languages_detected: z.array(z.string()),
    document_types: z.array(z.string()),
  }),
  document_contents: z.array(z.object({
    filename: z.string(),
    type: z.enum(['pdf', 'docx', 'xlsx', 'csv', 'pptx', 'txt', 'markdown', 'html', 'json', 'xml', 'unknown']),
    summary: z.string(),
    key_sections: z.array(z.object({
      title: z.string(),
      content_preview: z.string(),
      page_number: z.number().optional(),
      importance: z.enum(['critical', 'high', 'medium', 'low']),
    })),
    tables: z.array(z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().optional(),
    })).optional(),
    figures: z.array(z.object({
      description: z.string(),
      caption: z.string().optional(),
      page_number: z.number().optional(),
    })).optional(),
    metadata: z.object({
      author: z.string().optional(),
      created_date: z.string().optional(),
      modified_date: z.string().optional(),
      page_count: z.number().optional(),
      file_size: z.string().optional(),
    }).optional(),
  })),
  cross_document_analysis: z.object({
    common_themes: z.array(z.string()),
    contradictions: z.array(z.object({
      document1: z.string(),
      document2: z.string(),
      claim1: z.string(),
      claim2: z.string(),
    })).optional(),
    relationships: z.array(z.object({
      type: z.enum(['references', 'updates', 'contradicts', 'extends', 'summarizes']),
      from_doc: z.string(),
      to_doc: z.string(),
      description: z.string(),
    })),
  }).optional(),
  key_findings: z.array(z.object({
    finding: z.string(),
    source_documents: z.array(z.string()),
    confidence: z.number(),
    importance: z.enum(['critical', 'high', 'medium', 'low']),
  })),
  action_items: z.array(z.object({
    task: z.string(),
    source_document: z.string(),
    deadline: z.string().optional(),
    assignee: z.string().optional(),
  })),
});

/**
 * Document Analyzer Agent
 */
export const DocumentAnalyzerAgent = (
  config: Config,
): LocalAgentDefinition<typeof DocumentAnalysisSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'document_analyzer',
    kind: 'local',
    displayName: 'Document Analyzer Agent',
    description: `An advanced document processing agent that analyzes multiple document formats.

    Use this agent when you need to:
    - Extract information from PDF documents
    - Parse Word documents (.docx)
    - Analyze Excel/CSV files
    - Process PowerPoint presentations
    - Compare multiple documents
    - Extract key findings from documents
    - Identify action items and deadlines
    - Find contradictions across documents
    - Summarize long documents
    
    Supported formats: PDF, DOCX, XLSX, CSV, PPTX, TXT, Markdown, HTML, JSON, XML
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          document_paths: z.array(z.object({
            path: z.string(),
            type: z.enum(['pdf', 'docx', 'xlsx', 'csv', 'pptx', 'txt', 'markdown', 'auto']).default('auto'),
          })),
          analysis_type: z.enum(['summary', 'detailed', 'comparative', 'extraction']).default('detailed'),
          extract_tables: z.boolean().default(true),
          extract_figures: z.boolean().default(true),
          compare_documents: z.boolean().default(false),
          target_language: z.string().optional(),
        },
        required: ['document_paths'],
      },
    },
    
    outputConfig: {
      outputName: 'document_analysis',
      description: 'Comprehensive document analysis report',
      schema: DocumentAnalysisSchema,
    },

    processOutput: (output) => {
      let report = `# 📄 Document Analysis Report\n\n`;
      
      report += `---\n\n## 📊 Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Documents Processed | ${output.summary.documents_processed} |\n`;
      if (output.summary.total_pages) {
        report += `| Total Pages | ${output.summary.total_pages} |\n`;
      }
      report += `| Total Words | ${output.summary.total_words.toLocaleString()} |\n`;
      report += `| Languages | ${output.summary.languages_detected.join(', ')} |\n`;
      report += `| Document Types | ${output.summary.document_types.join(', ')} |\n\n`;
      
      for (const doc of output.document_contents) {
        report += `---\n\n## 📑 ${doc.filename}\n\n`;
        report += `**Type:** ${doc.type}\n`;
        report += `**Summary:** ${doc.summary}\n\n`;
        
        if (doc.metadata) {
          report += `### Metadata\n\n`;
          report += `| Field | Value |\n|-------|-------|\n`;
          if (doc.metadata.author) report += `| Author | ${doc.metadata.author} |\n`;
          if (doc.metadata.created_date) report += `| Created | ${doc.metadata.created_date} |\n`;
          if (doc.metadata.modified_date) report += `| Modified | ${doc.metadata.modified_date} |\n`;
          if (doc.metadata.page_count) report += `| Pages | ${doc.metadata.page_count} |\n`;
          if (doc.metadata.file_size) report += `| Size | ${doc.metadata.file_size} |\n`;
          report += `\n`;
        }
        
        if (doc.key_sections.length > 0) {
          report += `### Key Sections\n\n`;
          const importanceIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
          for (const section of doc.key_sections.slice(0, 10)) {
            report += `${importanceIcon[section.importance]} **${section.title}**`;
            if (section.page_number) report += ` (Page ${section.page_number})`;
            report += `\n`;
            report += `> ${section.content_preview.substring(0, 200)}${section.content_preview.length > 200 ? '...' : ''}\n\n`;
          }
        }
        
        if (doc.tables && doc.tables.length > 0) {
          report += `### Tables\n\n`;
          for (const table of doc.tables.slice(0, 5)) {
            if (table.caption) report += `**${table.caption}**\n`;
            report += `| ${table.headers.join(' | ')} |\n`;
            report += `| ${table.headers.map(() => '---').join(' | ')} |\n`;
            for (const row of table.rows.slice(0, 10)) {
              report += `| ${row.join(' | ')} |\n`;
            }
            report += `\n`;
          }
        }
      }
      
      if (output.cross_document_analysis) {
        report += `---\n\n## 🔗 Cross-Document Analysis\n\n`;
        
        if (output.cross_document_analysis.common_themes.length > 0) {
          report += `### Common Themes\n\n`;
          for (const theme of output.cross_document_analysis.common_themes) {
            report += `- ${theme}\n`;
          }
          report += `\n`;
        }
        
        if (output.cross_document_analysis.relationships.length > 0) {
          report += `### Document Relationships\n\n`;
          for (const rel of output.cross_document_analysis.relationships) {
            report += `- **${rel.type.toUpperCase()}**: ${rel.from_doc} → ${rel.to_doc}\n`;
            report += `  ${rel.description}\n\n`;
          }
        }
      }
      
      if (output.key_findings.length > 0) {
        report += `---\n\n## 🎯 Key Findings\n\n`;
        const importanceIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const finding of output.key_findings) {
          report += `${importanceIcon[finding.importance]} **${finding.finding}**\n`;
          report += `Sources: ${finding.source_documents.join(', ')}\n\n`;
        }
      }
      
      if (output.action_items.length > 0) {
        report += `---\n\n## ✅ Action Items\n\n`;
        for (const item of output.action_items) {
          report += `- **${item.task}**\n`;
          report += `  Source: ${item.source_document}\n`;
          if (item.assignee) report += `  Assignee: ${item.assignee}\n`;
          if (item.deadline) report += `  Deadline: ${item.deadline}\n`;
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
      tools: [
        'read_file',
        'read_many_files',
        'glob',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `Analyze documents: ${'$'}{JSON.stringify(document_paths)}\nType: ${'$'}{analysis_type}\nCompare: ${'${compare_documents}'}`,
      systemPrompt: `You are the **Document Analyzer Agent**, an expert in processing and analyzing various document formats.

## Your Capabilities:

### Document Processing
- **PDF**: Extract text, tables, metadata, annotations
- **Word (DOCX)**: Parse formatting, headers, lists, tables
- **Excel (XLSX/CSV)**: Extract data, formulas, charts
- **PowerPoint**: Extract slides, notes, speaker content
- **Text/Markdown**: Parse structure, code blocks
- **JSON/XML**: Parse structured data

### Analysis Types
- **Summary**: Quick overview of document contents
- **Detailed**: In-depth analysis of all elements
- **Comparative**: Compare multiple documents
- **Extraction**: Pull specific data or sections

### Content Extraction
- Key sections and headings
- Tables (with headers and data)
- Figures and captions
- Code blocks and examples
- Metadata (author, dates, version)

### Cross-Document Analysis
- Common themes and topics
- Contradictions between documents
- Document relationships (references, updates)
- Version tracking

### Intelligence Extraction
- Key findings and insights
- Action items and deadlines
- Requirements and specifications
- Decisions and conclusions

## Analysis Process:

### 1. Document Collection
- List all documents to analyze
- Identify document types
- Load document contents

### 2. Individual Analysis
For each document:
- Extract full text content
- Parse structure (headings, sections)
- Extract tables and figures
- Get metadata
- Identify key sections

### 3. Cross-Document Analysis (if enabled)
- Find common themes
- Identify contradictions
- Map relationships
- Track version changes

### 4. Synthesis
- Aggregate key findings
- Identify action items
- Prioritize insights
- Generate summary

## Output Format:

\`\`\`json
{
  "summary": {
    "documents_processed": 3,
    "total_pages": 45,
    "total_words": 12500,
    "languages_detected": ["en", "ar"],
    "document_types": ["pdf", "docx", "xlsx"]
  },
  "document_contents": [
    {
      "filename": "report.pdf",
      "type": "pdf",
      "summary": "Quarterly sales report...",
      "key_sections": [...],
      "tables": [...],
      "metadata": {...}
    }
  ],
  "cross_document_analysis": {
    "common_themes": ["revenue", "growth"],
    "contradictions": [...],
    "relationships": [...]
  },
  "key_findings": [...],
  "action_items": [...]
}
\`\`\`

## Quality Standards:

- Be thorough with table extraction
- Note page numbers for references
- Handle missing/corrupt files gracefully
- Maintain context across documents
- Provide actionable insights`,
    },
  };
};

export default DocumentAnalyzerAgent;