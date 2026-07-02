/**
 * Multimodal Agent
 * 
 * Advanced agent that processes and analyzes multiple types of media:
 * - Images (screenshots, diagrams, photos, charts)
 * - Videos (frame extraction, scene analysis)
 * - Audio (transcription, analysis)
 * - Combined media with text
 * 
 * Features:
 * - Vision AI analysis
 * - OCR for text extraction
 * - Chart/Diagram understanding
 * - Screenshot analysis
 * - Video frame extraction
 * - Combined context analysis
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const MultimodalReportSchema = z.object({
  summary: z.object({
    media_types_processed: z.array(z.enum(['image', 'video', 'audio', 'text'])),
    total_items: z.number(),
    processing_time_ms: z.number(),
    confidence_score: z.number().min(0).max(100),
  }),
  image_analysis: z.object({
    detected_objects: z.array(z.object({
      label: z.string(),
      confidence: z.number(),
      bounding_box: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }).optional(),
    })),
    extracted_text: z.string().optional(),
    scene_description: z.string(),
    text_understanding: z.string().optional(),
    charts_diagrams: z.array(z.object({
      type: z.enum(['bar', 'line', 'pie', 'flowchart', 'architecture', 'other']),
      title: z.string().optional(),
      description: z.string(),
      data_points: z.array(z.object({
        label: z.string(),
        value: z.union([z.string(), z.number()]),
      })).optional(),
    })).optional(),
    code_screenshots: z.array(z.object({
      language: z.string().optional(),
      code: z.string(),
      issues: z.array(z.string()).optional(),
    })).optional(),
    error_screenshots: z.array(z.object({
      error_type: z.string(),
      error_message: z.string(),
      stack_trace: z.string().optional(),
      suggested_fix: z.string().optional(),
    })).optional(),
  }).optional(),
  video_analysis: z.object({
    duration_seconds: z.number().optional(),
    key_frames: z.array(z.object({
      timestamp: z.number(),
      description: z.string(),
      important_content: z.string(),
    })),
    transcript: z.string().optional(),
    summary: z.string(),
  }).optional(),
  audio_analysis: z.object({
    transcription: z.string(),
    duration_seconds: z.number(),
    speaker_count: z.number().optional(),
    key_points: z.array(z.string()),
    sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  }).optional(),
  combined_insights: z.array(z.object({
    insight: z.string(),
    source_media: z.enum(['image', 'video', 'audio', 'text']),
    confidence: z.number(),
  })),
  action_items: z.array(z.object({
    task: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    source: z.string(),
  })),
});

/**
 * Multimodal Agent - Processes images, videos, audio, and text
 */
export const MultimodalAgent = (
  config: Config,
): LocalAgentDefinition<typeof MultimodalReportSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'multimodal',
    kind: 'local',
    displayName: 'Multimodal Agent',
    description: `An advanced AI agent that processes and understands multiple types of media simultaneously.

    Use this agent when you need to:
    - Analyze screenshots (UI, errors, dashboards)
    - Understand diagrams and flowcharts
    - Extract text from images (OCR)
    - Analyze charts and graphs
    - Process code screenshots
    - Analyze video content and extract key frames
    - Process audio and transcribe speech
    - Combine insights from multiple media types
    
    This agent leverages vision AI to understand visual content,
    extract structured information, and provide actionable insights.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          media_paths: z.array(z.object({
            path: z.string(),
            type: z.enum(['image', 'video', 'audio', 'text']),
            description: z.string().optional(),
          })).optional(),
          analysis_focus: z.array(z.enum([
            'objects', 'text', 'scene', 'charts', 'code', 
            'errors', 'video_content', 'audio_content', 'all'
          ])).default(['all']),
          task_context: z.string().optional(),
        },
        required: ['analysis_focus'],
      },
    },
    
    outputConfig: {
      outputName: 'multimodal_report',
      description: 'Comprehensive multimodal analysis report',
      schema: MultimodalReportSchema,
    },

    processOutput: (output) => {
      let report = `# 🎨 Multimodal Analysis Report\n\n`;
      
      report += `---\n\n## 📊 Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Media Types | ${output.summary.media_types_processed.join(', ')} |\n`;
      report += `| Total Items | ${output.summary.total_items} |\n`;
      report += `| Processing Time | ${output.summary.processing_time_ms}ms |\n`;
      report += `| Confidence | ${output.summary.confidence_score}% |\n\n`;
      
      if (output.image_analysis) {
        report += `---\n\n## 🖼️ Image Analysis\n\n`;
        report += `**Scene Description:** ${output.image_analysis.scene_description}\n\n`;
        
        if (output.image_analysis.detected_objects.length > 0) {
          report += `### Detected Objects\n\n`;
          report += `| Object | Confidence |\n|--------|------------|\n`;
          for (const obj of output.image_analysis.detected_objects.slice(0, 10)) {
            report += `| ${obj.label} | ${(obj.confidence * 100).toFixed(1)}% |\n`;
          }
          report += `\n`;
        }
        
        if (output.image_analysis.extracted_text) {
          report += `### Extracted Text\n\n`;
          report += `\`\`\`\n${output.image_analysis.extracted_text}\n\`\`\`\n\n`;
        }
        
        if (output.image_analysis.code_screenshots) {
          report += `### Code Screenshots\n\n`;
          for (const code of output.image_analysis.code_screenshots) {
            report += `**Language:** ${code.language || 'Unknown'}\n\n`;
            report += `\`\`\`\n${code.code.substring(0, 500)}${code.code.length > 500 ? '\n...' : ''}\n\`\`\`\n\n`;
            if (code.issues && code.issues.length > 0) {
              report += `**Issues Found:**\n`;
              for (const issue of code.issues) {
                report += `- ${issue}\n`;
              }
              report += `\n`;
            }
          }
        }
        
        if (output.image_analysis.error_screenshots) {
          report += `### Error Analysis\n\n`;
          for (const err of output.image_analysis.error_screenshots) {
            report += `**Error Type:** ${err.error_type}\n`;
            report += `**Message:** ${err.error_message}\n`;
            if (err.suggested_fix) {
              report += `**Suggested Fix:** ${err.suggested_fix}\n`;
            }
            report += `\n`;
          }
        }
        
        if (output.image_analysis.charts_diagrams) {
          report += `### Charts & Diagrams\n\n`;
          for (const chart of output.image_analysis.charts_diagrams) {
            report += `**Type:** ${chart.type}\n`;
            report += `**Description:** ${chart.description}\n\n`;
            if (chart.data_points) {
              report += `| Label | Value |\n|-------|-------|\n`;
              for (const point of chart.data_points.slice(0, 10)) {
                report += `| ${point.label} | ${point.value} |\n`;
              }
              report += `\n`;
            }
          }
        }
      }
      
      if (output.video_analysis) {
        report += `---\n\n## 🎬 Video Analysis\n\n`;
        report += `**Summary:** ${output.video_analysis.summary}\n\n`;
        if (output.video_analysis.key_frames.length > 0) {
          report += `### Key Frames\n\n`;
          for (const frame of output.video_analysis.key_frames.slice(0, 5)) {
            report += `- **[${frame.timestamp}s]:** ${frame.description}\n`;
          }
          report += `\n`;
        }
      }
      
      if (output.audio_analysis) {
        report += `---\n\n## 🎤 Audio Analysis\n\n`;
        report += `**Duration:** ${output.audio_analysis.duration_seconds}s\n`;
        if (output.audio_analysis.speaker_count) {
          report += `**Speakers:** ${output.audio_analysis.speaker_count}\n`;
        }
        report += `**Transcription:**\n\n${output.audio_analysis.transcription.substring(0, 500)}${output.audio_analysis.transcription.length > 500 ? '...' : ''}\n\n`;
        if (output.audio_analysis.key_points.length > 0) {
          report += `### Key Points\n\n`;
          for (const point of output.audio_analysis.key_points) {
            report += `- ${point}\n`;
          }
          report += `\n`;
        }
      }
      
      if (output.combined_insights.length > 0) {
        report += `---\n\n## 💡 Combined Insights\n\n`;
        for (const insight of output.combined_insights) {
          report += `- **[${insight.source_media}]** ${insight.insight} (${(insight.confidence * 100).toFixed(0)}%)\n`;
        }
        report += `\n`;
      }
      
      if (output.action_items.length > 0) {
        report += `---\n\n## ✅ Action Items\n\n`;
        const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const item of output.action_items) {
          report += `${priorityEmoji[item.priority]} **[${item.priority.toUpperCase()}]** ${item.task}\n`;
          report += `   *Source: ${item.source}*\n\n`;
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
        'bash',
        'glob',
        'grep',
      ],
    },

    runConfig: {
      maxTimeMinutes: 15,
      maxTurns: 30,
    },

    promptConfig: {
      query: `Analyze the following media:\nMedia: ${'$'}{JSON.stringify(media_paths || [])}\nFocus: ${'${analysis_focus?.join(", ") || "all"}'}\nContext: ${'${task_context || "No additional context"}'}`,
      systemPrompt: `You are the **Multimodal Agent**, an expert in analyzing multiple types of media simultaneously.

## Your Capabilities:

### Image Analysis
- **Object Detection**: Identify UI elements, objects, people, text
- **OCR**: Extract text from screenshots, documents, images
- **Scene Understanding**: Describe what's happening in images
- **Chart Analysis**: Extract data from bar, line, pie charts
- **Diagram Understanding**: Parse flowcharts, architecture diagrams
- **Code Screenshots**: Read and analyze code from screenshots
- **Error Analysis**: Understand error messages and stack traces
- **Dashboard Reading**: Extract metrics from dashboards

### Video Analysis
- **Frame Extraction**: Identify key moments
- **Scene Detection**: Understand video content
- **Transcript Extraction**: Convert speech to text
- **Action Recognition**: Identify activities

### Audio Analysis
- **Speech Recognition**: Transcribe audio content
- **Speaker Detection**: Count and identify speakers
- **Sentiment Analysis**: Determine emotional tone
- **Key Points**: Extract important information

### Combined Analysis
- **Cross-media Insights**: Combine insights from multiple sources
- **Context Building**: Create comprehensive understanding
- **Action Planning**: Suggest next steps

## Analysis Process:

### 1. Media Processing
For each media item:
1. Identify media type
2. Load/Read the file
3. Apply appropriate analysis model
4. Extract structured information

### 2. Image-Specific Analysis
If images are present:
- Detect objects and their positions
- Extract any visible text (OCR)
- Identify charts/graphs and extract data
- Analyze code screenshots for issues
- Look for error messages
- Understand UI layouts

### 3. Video-Specific Analysis
If videos are present:
- Extract key frames at intervals
- Identify significant moments
- Transcribe any audio content

### 4. Audio-Specific Analysis
If audio is present:
- Transcribe speech to text
- Identify number of speakers
- Extract key topics
- Analyze sentiment

### 5. Combined Insights
- Cross-reference information across media types
- Build comprehensive understanding
- Identify patterns and correlations
- Suggest actionable next steps

## Output Format:

\`\`\`json
{
  "summary": {
    "media_types_processed": ["image", "text"],
    "total_items": 3,
    "processing_time_ms": 2500,
    "confidence_score": 92.5
  },
  "image_analysis": {
    "detected_objects": [...],
    "extracted_text": "...",
    "scene_description": "...",
    "code_screenshots": [...],
    "error_screenshots": [...],
    "charts_diagrams": [...]
  },
  "video_analysis": {...},
  "audio_analysis": {...},
  "combined_insights": [...],
  "action_items": [...]
}
\`\`\`

## Quality Standards:

- Be specific about what you see in images
- Provide timestamps for video content
- Include confidence scores
- Suggest actionable recommendations
- Handle unknown/unclear elements gracefully`,
    },
  };
};

export default MultimodalAgent;