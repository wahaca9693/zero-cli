/**
 * Voice Agent
 * 
 * Advanced voice processing agent that:
 * - Converts speech to text (Speech-to-Text)
 * - Processes voice commands
 * - Analyzes audio content
 * - Supports multiple languages
 * - Extracts structured information from audio
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const VoiceAnalysisSchema = z.object({
  transcription: z.object({
    text: z.string(),
    language: z.string(),
    confidence: z.number(),
    duration_seconds: z.number(),
    segments: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
      confidence: z.number(),
      speaker: z.string().optional(),
    })),
  }),
  analysis: z.object({
    intent: z.string(),
    entities: z.array(z.object({
      type: z.enum(['person', 'place', 'organization', 'date', 'time', 'number', 'command', 'query']),
      value: z.string(),
      confidence: z.number(),
    })),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    topic: z.string(),
    summary: z.string(),
  }),
  commands: z.array(z.object({
    action: z.string(),
    target: z.string().optional(),
    parameters: z.record(z.unknown()).optional(),
    confidence: z.number(),
  })),
  action_items: z.array(z.object({
    task: z.string(),
    assignee: z.string().optional(),
    deadline: z.string().optional(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
  })).optional(),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['what', 'why', 'how', 'when', 'where', 'who', 'yes_no']),
    answer: z.string().optional(),
  })).optional(),
});

/**
 * Voice Agent - Processes and understands audio/speech
 */
export const VoiceAgent = (
  config: Config,
): LocalAgentDefinition<typeof VoiceAnalysisSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'voice',
    kind: 'local',
    displayName: 'Voice Agent',
    description: `An advanced voice processing agent that converts speech to text and understands audio content.

    Use this agent when you need to:
    - Transcribe audio files to text
    - Process voice commands
    - Analyze meeting recordings
    - Extract action items from conversations
    - Identify speakers in audio
    - Understand intent from voice input
    - Analyze sentiment from speech
    - Convert voice queries to actionable tasks
    
    Supports multiple languages and dialects.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          audio_paths: z.array(z.object({
            path: z.string(),
            format: z.enum(['mp3', 'wav', 'm4a', 'ogg', 'flac', 'unknown']).default('unknown'),
            language: z.string().optional(),
          })).optional(),
          task: z.string().describe('Task to perform with the audio'),
          extract_commands: z.boolean().default(true),
          extract_action_items: z.boolean().default(true),
          identify_speakers: z.boolean().default(true),
          target_language: z.string().optional(),
        },
        required: ['task'],
      },
    },
    
    outputConfig: {
      outputName: 'voice_analysis',
      description: 'Comprehensive voice/audio analysis report',
      schema: VoiceAnalysisSchema,
    },

    processOutput: (output) => {
      let report = `# 🎤 Voice Analysis Report\n\n`;
      
      report += `---\n\n## 📝 Transcription\n\n`;
      report += `**Language:** ${output.transcription.language}\n`;
      report += `**Confidence:** ${(output.transcription.confidence * 100).toFixed(1)}%\n`;
      report += `**Duration:** ${output.transcription.duration_seconds.toFixed(1)}s\n\n`;
      report += `### Full Transcription\n\n`;
      report += `\`\`\`\n${output.transcription.text}\n\`\`\`\n\n`;
      
      if (output.transcription.segments.length > 0) {
        report += `### Segments\n\n`;
        report += `| Time | Speaker | Text |\n|------|---------|------|\n`;
        for (const seg of output.transcription.segments.slice(0, 20)) {
          const speaker = seg.speaker || 'Unknown';
          const time = `${seg.start.toFixed(1)}s - ${seg.end.toFixed(1)}s`;
          const text = seg.text.length > 50 ? seg.text.substring(0, 50) + '...' : seg.text;
          report += `| ${time} | ${speaker} | ${text} |\n`;
        }
        report += `\n`;
      }
      
      report += `---\n\n## 🧠 Analysis\n\n`;
      report += `**Intent:** ${output.analysis.intent}\n`;
      report += `**Topic:** ${output.analysis.topic}\n`;
      report += `**Sentiment:** ${output.analysis.sentiment}\n\n`;
      
      if (output.analysis.entities.length > 0) {
        report += `### Entities Detected\n\n`;
        report += `| Type | Value | Confidence |\n|------|-------|------------|\n`;
        for (const entity of output.analysis.entities) {
          report += `| ${entity.type} | ${entity.value} | ${(entity.confidence * 100).toFixed(0)}% |\n`;
        }
        report += `\n`;
      }
      
      if (output.commands.length > 0) {
        report += `---\n\n## 🔧 Commands Detected\n\n`;
        for (const cmd of output.commands) {
          report += `### ${cmd.action}\n`;
          report += `**Target:** ${cmd.target || 'N/A'}\n`;
          report += `**Confidence:** ${(cmd.confidence * 100).toFixed(0)}%\n`;
          if (cmd.parameters && Object.keys(cmd.parameters).length > 0) {
            report += `**Parameters:**\n`;
            for (const [key, value] of Object.entries(cmd.parameters)) {
              report += `- ${key}: ${JSON.stringify(value)}\n`;
            }
          }
          report += `\n`;
        }
      }
      
      if (output.action_items && output.action_items.length > 0) {
        report += `---\n\n## ✅ Action Items\n\n`;
        const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const item of output.action_items) {
          report += `${priorityEmoji[item.priority]} **${item.task}**\n`;
          if (item.assignee) report += `  Assignee: ${item.assignee}\n`;
          if (item.deadline) report += `  Deadline: ${item.deadline}\n`;
          report += `\n`;
        }
      }
      
      if (output.questions && output.questions.length > 0) {
        report += `---\n\n## ❓ Questions Found\n\n`;
        for (const q of output.questions) {
          report += `**[${q.type.toUpperCase()}]** ${q.question}\n`;
          if (q.answer) {
            report += `Answer: ${q.answer}\n`;
          }
          report += `\n`;
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
        'bash',
        'glob',
      ],
    },

    runConfig: {
      maxTimeMinutes: 10,
      maxTurns: 20,
    },

    promptConfig: {
      query: `Analyze audio for: ${'$'}{task}\nAudio: ${'$'}{JSON.stringify(audio_paths || [])}\nExtract commands: ${'${extract_commands}'}\nExtract actions: ${'${extract_action_items}'}`,
      systemPrompt: `You are the **Voice Agent**, an expert in processing and understanding audio/speech content.

## Your Capabilities:

### Speech-to-Text
- Transcribe audio files to text
- Support multiple languages
- Handle multiple speakers
- Provide timestamps for segments
- Handle background noise gracefully

### Intent Recognition
- Understand what the speaker wants
- Classify into categories:
  - Command: Direct instruction
  - Query: Question or request for information
  - Statement: Informational
  - Task: Assignment or action item

### Entity Extraction
- Identify named entities:
  - People (names, roles)
  - Organizations
  - Locations
  - Dates and times
  - Numbers and quantities
  - Commands and actions
  - Queries

### Sentiment Analysis
- Classify emotional tone:
  - Positive
  - Negative
  - Neutral

### Command Detection
- Extract actionable commands:
  - Action type
  - Target
  - Parameters
  - Confidence score

### Action Item Extraction
- Identify tasks to be done:
  - Task description
  - Assignee (if mentioned)
  - Deadline (if mentioned)
  - Priority

### Question Answering
- Detect questions:
  - What, Why, How, When, Where, Who
  - Yes/No questions
  - Provide answers if possible

## Analysis Process:

### 1. Audio Processing
- Load audio file
- Convert to processable format
- Get duration and metadata

### 2. Transcription
- Transcribe speech to text
- Include timestamps
- Identify speakers if possible
- Note non-speech sounds

### 3. Analysis
- Determine primary intent
- Extract key entities
- Analyze sentiment
- Identify commands

### 4. Action Items
- Identify tasks mentioned
- Note assignees
- Extract deadlines
- Prioritize tasks

### 5. Questions
- List all questions
- Classify question types
- Attempt to answer if possible

## Output Format:

\`\`\`json
{
  "transcription": {
    "text": "Full transcription text...",
    "language": "en",
    "confidence": 0.95,
    "duration_seconds": 120.5,
    "segments": [
      {
        "start": 0.0,
        "end": 5.2,
        "text": "Segment text...",
        "confidence": 0.98,
        "speaker": "Speaker A"
      }
    ]
  },
  "analysis": {
    "intent": "command|query|statement|task",
    "entities": [...],
    "sentiment": "positive|negative|neutral",
    "topic": "topic name",
    "summary": "Brief summary"
  },
  "commands": [
    {
      "action": "create",
      "target": "project",
      "parameters": {"name": "New Project"},
      "confidence": 0.92
    }
  ],
  "action_items": [...],
  "questions": [...]
}
\`\`\`

## Quality Standards:

- Be accurate with transcriptions
- Provide confidence scores
- Handle multiple speakers clearly
- Identify actionable items precisely
- Maintain context across segments`,
    },
  };
};

export default VoiceAgent;