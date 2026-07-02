/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import { homedir, ZERO_DIR } from '../utils/paths.js';
import { ZEROLiveTranscriptionProvider } from './zeroLiveTranscriptionProvider.js';
import { WhisperTranscriptionProvider } from './whisperTranscriptionProvider.js';
import type { TranscriptionProvider } from './transcriptionProvider.js';

export class TranscriptionFactory {
  static createProvider(
    voiceConfig: { backend?: string; whisperModel?: string } | undefined,
    apiKey: string,
  ): TranscriptionProvider {
    const backend = voiceConfig?.backend ?? 'zero-live';

    if (backend === 'whisper') {
      const modelsDir = path.join(homedir(), ZERO_DIR, 'whisper_models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }

      const modelName = voiceConfig?.whisperModel ?? 'ggml-base.en.bin';
      const modelPath = path.join(modelsDir, modelName);

      return new WhisperTranscriptionProvider({
        modelPath,
        threads: 4,
        step: 0,
        length: 5000,
      });
    }

    // Default to ZERO Live
    return new ZEROLiveTranscriptionProvider(apiKey);
  }
}
