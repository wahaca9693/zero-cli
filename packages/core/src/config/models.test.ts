/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  resolveModel,
  resolveClassifierModel,
  isZERO3Model,
  isZERO2Model,
  isCustomModel,
  supportsModernFeatures,
  isAutoModel,
  getDisplayString,
  DEFAULT_ZERO_MODEL,
  PREVIEW_ZERO_MODEL,
  DEFAULT_ZERO_FLASH_MODEL,
  DEFAULT_ZERO_3_5_FLASH_MODEL,
  DEFAULT_ZERO_FLASH_LITE_MODEL,
  supportsMultimodalFunctionResponse,
  ZERO_MODEL_ALIAS_PRO,
  ZERO_MODEL_ALIAS_FLASH,
  ZERO_MODEL_ALIAS_FLASH_LITE,
  ZERO_MODEL_ALIAS_AUTO,
  PREVIEW_ZERO_FLASH_MODEL,
  PREVIEW_ZERO_MODEL_AUTO,
  DEFAULT_ZERO_MODEL_AUTO,
  isActiveModel,
  PREVIEW_ZERO_3_1_MODEL,
  PREVIEW_ZERO_FLASH_LITE_MODEL,
  PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
  isPreviewModel,
  isProModel,
  GEMMA_4_31B_IT_MODEL,
  GEMMA_4_26B_A4B_IT_MODEL,
  getAutoModelDescription,
} from './models.js';
import type { Config } from './config.js';
import { ModelConfigService } from '../services/modelConfigService.js';
import { DEFAULT_MODEL_CONFIGS } from './defaultModelConfigs.js';

const modelConfigService = new ModelConfigService(DEFAULT_MODEL_CONFIGS);

const dynamicConfig = {
  getExperimentalDynamicModelConfiguration: () => true,
  modelConfigService,
} as unknown as Config;

const legacyConfig = {
  getExperimentalDynamicModelConfiguration: () => false,
  modelConfigService,
} as unknown as Config;

describe('Dynamic Configuration Parity', () => {
  const modelsToTest = [
    ZERO_MODEL_ALIAS_AUTO,
    ZERO_MODEL_ALIAS_PRO,
    ZERO_MODEL_ALIAS_FLASH,
    PREVIEW_ZERO_MODEL_AUTO,
    DEFAULT_ZERO_MODEL_AUTO,
    PREVIEW_ZERO_MODEL,
    DEFAULT_ZERO_MODEL,
    'custom-model',
  ];

  const flagCombos = [
    {
      useZERO3_1: false,
      useCustomToolModel: false,
    },
    {
      useZERO3_1: true,
      useCustomToolModel: false,
    },
    {
      useZERO3_1: true,
      useCustomToolModel: true,
    },
  ];

  it('resolveModel should match legacy behavior when dynamicModelConfiguration flag enabled.', () => {
    for (const model of modelsToTest) {
      for (const flags of flagCombos) {
        for (const hasAccess of [true, false]) {
          const mockLegacyConfig = {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...legacyConfig,
            getHasAccessToPreviewModel: () => hasAccess,
          } as unknown as Config;
          const mockDynamicConfig = {
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...dynamicConfig,
            getHasAccessToPreviewModel: () => hasAccess,
          } as unknown as Config;

          const legacy = resolveModel(
            model,
            flags.useZERO3_1,
            flags.useCustomToolModel,
            hasAccess,
            mockLegacyConfig,
          );
          const dynamic = resolveModel(
            model,
            flags.useZERO3_1,
            flags.useCustomToolModel,
            hasAccess,
            mockDynamicConfig,
          );
          expect(dynamic).toBe(legacy);
        }
      }
    }
  });

  it('resolveClassifierModel should match legacy behavior.', () => {
    const classifierTiers = [ZERO_MODEL_ALIAS_PRO, ZERO_MODEL_ALIAS_FLASH];
    const anchorModels = [
      PREVIEW_ZERO_MODEL_AUTO,
      DEFAULT_ZERO_MODEL_AUTO,
      PREVIEW_ZERO_MODEL,
      DEFAULT_ZERO_MODEL,
    ];

    for (const hasAccess of [true, false]) {
      const mockLegacyConfig = {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...legacyConfig,
        getHasAccessToPreviewModel: () => hasAccess,
      } as unknown as Config;
      const mockDynamicConfig = {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...dynamicConfig,
        getHasAccessToPreviewModel: () => hasAccess,
      } as unknown as Config;

      for (const tier of classifierTiers) {
        for (const anchor of anchorModels) {
          for (const flags of flagCombos) {
            const legacy = resolveClassifierModel(
              anchor,
              tier,
              flags.useZERO3_1,
              flags.useCustomToolModel,
              hasAccess,
              mockLegacyConfig,
            );
            const dynamic = resolveClassifierModel(
              anchor,
              tier,
              flags.useZERO3_1,
              flags.useCustomToolModel,
              hasAccess,
              mockDynamicConfig,
            );
            expect(dynamic).toBe(legacy);
          }
        }
      }
    }
  });

  it('getDisplayString should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = getDisplayString(model, legacyConfig);
      const dynamic = getDisplayString(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isPreviewModel should match legacy behavior', () => {
    const allModels = [
      ...modelsToTest,
      PREVIEW_ZERO_3_1_MODEL,
      PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
      PREVIEW_ZERO_FLASH_MODEL,
    ];
    for (const model of allModels) {
      const legacy = isPreviewModel(model, legacyConfig);
      const dynamic = isPreviewModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isProModel should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isProModel(model, legacyConfig);
      const dynamic = isProModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isZERO3Model should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isZERO3Model(model, legacyConfig);
      const dynamic = isZERO3Model(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('isCustomModel should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = isCustomModel(model, legacyConfig);
      const dynamic = isCustomModel(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });

  it('supportsMultimodalFunctionResponse should match legacy behavior', () => {
    for (const model of modelsToTest) {
      const legacy = supportsMultimodalFunctionResponse(model, legacyConfig);
      const dynamic = supportsMultimodalFunctionResponse(model, dynamicConfig);
      expect(dynamic).toBe(legacy);
    }
  });
});

describe('isPreviewModel', () => {
  const PREVIEW_MODELS = [
    PREVIEW_ZERO_MODEL,
    PREVIEW_ZERO_3_1_MODEL,
    PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
    PREVIEW_ZERO_FLASH_MODEL,
    PREVIEW_ZERO_FLASH_LITE_MODEL,
  ];

  it('should return true for active preview models', () => {
    for (const model of PREVIEW_MODELS) {
      if (model !== 'none') {
        expect(isPreviewModel(model)).toBe(true);
      }
    }
    expect(isPreviewModel(PREVIEW_ZERO_MODEL_AUTO)).toBe(true);
    expect(isPreviewModel(ZERO_MODEL_ALIAS_AUTO)).toBe(true);
  });

  it('should return false if a preview model is retired (set to none)', () => {
    const retiredModels = PREVIEW_MODELS.filter((m) => m === 'none');
    for (const model of retiredModels) {
      expect(isPreviewModel(model)).toBe(false);
    }
  });

  it('should return false for non-preview models', () => {
    expect(isPreviewModel(DEFAULT_ZERO_MODEL)).toBe(false);
    expect(isPreviewModel('zero-1.5-pro')).toBe(false);
  });
});

describe('isProModel', () => {
  it('should return true for models containing "pro"', () => {
    expect(isProModel('zero-3-pro-preview')).toBe(true);
    expect(isProModel('zero-2.5-pro')).toBe(true);
    expect(isProModel('pro')).toBe(true);
  });

  it('should return false for models without "pro"', () => {
    expect(isProModel('zero-3-flash-preview')).toBe(false);
    expect(isProModel('zero-2.5-flash')).toBe(false);
    expect(isProModel('auto')).toBe(false);
  });
});

describe('isCustomModel', () => {
  it('should return true for models not starting with zero-', () => {
    expect(isCustomModel('testing')).toBe(true);
    expect(isCustomModel('gpt-4')).toBe(true);
    expect(isCustomModel('claude-3')).toBe(true);
  });

  it('should return false for ZERO models', () => {
    expect(isCustomModel('zero-1.5-pro')).toBe(false);
    expect(isCustomModel('zero-2.0-flash')).toBe(false);
    expect(isCustomModel('zero-3-pro-preview')).toBe(false);
  });

  it('should return false for aliases that resolve to ZERO models', () => {
    expect(isCustomModel(ZERO_MODEL_ALIAS_AUTO)).toBe(false);
    expect(isCustomModel(ZERO_MODEL_ALIAS_PRO)).toBe(false);
  });

  it('should not throw if the model is an array (e.g. from yargs)', () => {
    // @ts-expect-error - testing invalid runtime input
    expect(() => isCustomModel(['zero-2.0-flash', 'gpt-4'])).not.toThrow();
    // @ts-expect-error - testing invalid runtime input
    expect(isCustomModel(['zero-2.0-flash', 'gpt-4'])).toBe(true); // last one is custom
  });
});

describe('supportsModernFeatures', () => {
  it('should return true for ZERO 3 models', () => {
    expect(supportsModernFeatures('zero-3-pro-preview')).toBe(true);
    expect(supportsModernFeatures('zero-3-flash-preview')).toBe(true);
  });

  it('should return true for custom models', () => {
    expect(supportsModernFeatures('testing')).toBe(true);
    expect(supportsModernFeatures('some-custom-model')).toBe(true);
  });

  it('should return false for older ZERO models', () => {
    expect(supportsModernFeatures('zero-2.5-pro')).toBe(false);
    expect(supportsModernFeatures('zero-2.5-flash')).toBe(false);
    expect(supportsModernFeatures('zero-2.0-flash')).toBe(false);
    expect(supportsModernFeatures('zero-1.5-pro')).toBe(false);
    expect(supportsModernFeatures('zero-1.0-pro')).toBe(false);
  });

  it('should return true for modern aliases', () => {
    expect(supportsModernFeatures(ZERO_MODEL_ALIAS_PRO)).toBe(true);
    expect(supportsModernFeatures(ZERO_MODEL_ALIAS_AUTO)).toBe(true);
  });
});

describe('isZERO3Model', () => {
  it('should return true for zero-3 models', () => {
    expect(isZERO3Model('zero-3-pro-preview')).toBe(true);
    expect(isZERO3Model('zero-3-flash-preview')).toBe(true);
  });

  it('should return true for aliases that resolve to ZERO 3', () => {
    expect(isZERO3Model(ZERO_MODEL_ALIAS_AUTO)).toBe(true);
    expect(isZERO3Model(ZERO_MODEL_ALIAS_PRO)).toBe(true);
    expect(isZERO3Model(PREVIEW_ZERO_MODEL_AUTO)).toBe(true);
  });

  it('should return false for ZERO 2 models', () => {
    expect(isZERO3Model('zero-2.5-pro')).toBe(false);
    expect(isZERO3Model('zero-2.5-flash')).toBe(false);
    expect(isZERO3Model(DEFAULT_ZERO_MODEL_AUTO)).toBe(false);
  });

  it('should return false for arbitrary strings', () => {
    expect(isZERO3Model('gpt-4')).toBe(false);
  });
});

describe('getDisplayString', () => {
  it('should return Auto (ZERO 3) for preview auto model', () => {
    expect(getDisplayString(PREVIEW_ZERO_MODEL_AUTO)).toBe('Auto (ZERO 3)');
  });

  it('should return Auto (ZERO 2.5) for default auto model', () => {
    expect(getDisplayString(DEFAULT_ZERO_MODEL_AUTO)).toBe(
      'Auto (ZERO 2.5)',
    );
  });

  it('should return concrete model name for pro alias', () => {
    expect(getDisplayString(ZERO_MODEL_ALIAS_PRO)).toBe(PREVIEW_ZERO_MODEL);
  });

  it('should return concrete model name for flash alias', () => {
    expect(getDisplayString(ZERO_MODEL_ALIAS_FLASH)).toBe(
      PREVIEW_ZERO_FLASH_MODEL,
    );
  });

  it('should return PREVIEW_ZERO_3_1_MODEL for PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL', () => {
    expect(getDisplayString(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL)).toBe(
      PREVIEW_ZERO_3_1_MODEL,
    );
  });

  it('should return PREVIEW_ZERO_FLASH_LITE_MODEL for PREVIEW_ZERO_FLASH_LITE_MODEL', () => {
    expect(getDisplayString(PREVIEW_ZERO_FLASH_LITE_MODEL)).toBe(
      PREVIEW_ZERO_FLASH_LITE_MODEL,
    );
  });

  it('should return the model name as is for other models', () => {
    expect(getDisplayString('custom-model')).toBe('custom-model');
    expect(getDisplayString(GEMMA_4_31B_IT_MODEL)).toBe(GEMMA_4_31B_IT_MODEL);
    expect(getDisplayString(GEMMA_4_26B_A4B_IT_MODEL)).toBe(
      GEMMA_4_26B_A4B_IT_MODEL,
    );
    expect(getDisplayString(DEFAULT_ZERO_FLASH_LITE_MODEL)).toBe(
      DEFAULT_ZERO_FLASH_LITE_MODEL,
    );
  });
});

describe('supportsMultimodalFunctionResponse', () => {
  it('should return true for zero-3 model', () => {
    expect(supportsMultimodalFunctionResponse('zero-3-pro')).toBe(true);
  });

  it('should return false for zero-2 models', () => {
    expect(supportsMultimodalFunctionResponse('zero-2.5-pro')).toBe(false);
    expect(supportsMultimodalFunctionResponse('zero-2.5-flash')).toBe(false);
  });

  it('should return false for other models', () => {
    expect(supportsMultimodalFunctionResponse('some-other-model')).toBe(false);
    expect(supportsMultimodalFunctionResponse('')).toBe(false);
  });
});

describe('resolveModel', () => {
  describe('delegation logic', () => {
    it('should return the Preview Pro model when auto-zero-3 is requested', () => {
      const model = resolveModel(PREVIEW_ZERO_MODEL_AUTO);
      expect(model).toBe(PREVIEW_ZERO_MODEL);
    });

    it('should return ZERO 3.1 Pro when auto-zero-3 is requested and useZERO3_1 is true', () => {
      const model = resolveModel(PREVIEW_ZERO_MODEL_AUTO, true);
      expect(model).toBe(PREVIEW_ZERO_3_1_MODEL);
    });

    it('should return ZERO 3.1 Pro Custom Tools when auto-zero-3 is requested, useZERO3_1 is true, and useCustomToolModel is true', () => {
      const model = resolveModel(PREVIEW_ZERO_MODEL_AUTO, true, true);
      expect(model).toBe(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL);
    });

    it('should return the Default Pro model when auto-zero-2.5 is requested', () => {
      const model = resolveModel(DEFAULT_ZERO_MODEL_AUTO);
      expect(model).toBe(DEFAULT_ZERO_MODEL);
    });

    it('should return the Default Flash-Lite model when flash-lite is requested', () => {
      const model = resolveModel(ZERO_MODEL_ALIAS_FLASH_LITE);
      expect(model).toBe(DEFAULT_ZERO_FLASH_LITE_MODEL);
    });

    it('should return the Flash-Lite model when flash-lite is requested', () => {
      const model = resolveModel(ZERO_MODEL_ALIAS_FLASH_LITE, false);
      expect(model).toBe(DEFAULT_ZERO_FLASH_LITE_MODEL);
    });

    it('should return the requested model as-is for explicit specific models', () => {
      expect(resolveModel(DEFAULT_ZERO_MODEL)).toBe(DEFAULT_ZERO_MODEL);
      expect(resolveModel(DEFAULT_ZERO_FLASH_MODEL)).toBe(
        DEFAULT_ZERO_FLASH_MODEL,
      );
      expect(resolveModel(DEFAULT_ZERO_FLASH_LITE_MODEL)).toBe(
        DEFAULT_ZERO_FLASH_LITE_MODEL,
      );
    });

    it('should return a custom model name when requested', () => {
      const customModel = 'custom-model-v1';
      const model = resolveModel(customModel);
      expect(model).toBe(customModel);
    });

    it('should handle non-string inputs gracefully', () => {
      // @ts-expect-error - testing invalid runtime input
      expect(resolveModel(['a', 'b'])).toBe('b');
      // @ts-expect-error - testing invalid runtime input
      expect(resolveModel(true)).toBe('true');
      // @ts-expect-error - testing invalid runtime input
      expect(resolveModel(null)).toBe('');
    });
  });

  describe('hasAccessToPreview logic', () => {
    it('should return default model when access to preview is false and preview model is requested', () => {
      expect(resolveModel(PREVIEW_ZERO_MODEL, false, false, false)).toBe(
        DEFAULT_ZERO_MODEL,
      );
    });

    it('should return default flash model when access to preview is false and preview flash model is requested', () => {
      expect(
        resolveModel(PREVIEW_ZERO_FLASH_MODEL, false, false, false),
      ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    });

    it('should return default flash lite model when access to preview is false and preview flash lite model is requested', () => {
      expect(
        resolveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, false, false, false),
      ).toBe(DEFAULT_ZERO_FLASH_LITE_MODEL);
    });

    it('should return default model when access to preview is false and auto-zero-3 is requested', () => {
      expect(resolveModel(PREVIEW_ZERO_MODEL_AUTO, false, false, false)).toBe(
        DEFAULT_ZERO_MODEL,
      );
    });

    it('should return default model when access to preview is false and ZERO 3.1 is requested', () => {
      expect(resolveModel(PREVIEW_ZERO_MODEL_AUTO, true, false, false)).toBe(
        DEFAULT_ZERO_MODEL,
      );
    });

    it('should still return default model when access to preview is false and auto-zero-2.5 is requested', () => {
      expect(resolveModel(DEFAULT_ZERO_MODEL_AUTO, false, false, false)).toBe(
        DEFAULT_ZERO_MODEL,
      );
    });
  });
});

describe('isZERO2Model', () => {
  it('should return true for zero-2.5-pro', () => {
    expect(isZERO2Model('zero-2.5-pro')).toBe(true);
  });

  it('should return true for zero-2.5-flash', () => {
    expect(isZERO2Model('zero-2.5-flash')).toBe(true);
  });

  it('should return true for zero-2.0-flash', () => {
    expect(isZERO2Model('zero-2.0-flash')).toBe(true);
  });

  it('should return false for zero-1.5-pro', () => {
    expect(isZERO2Model('zero-1.5-pro')).toBe(false);
  });

  it('should return false for zero-3-pro', () => {
    expect(isZERO2Model('zero-3-pro')).toBe(false);
  });

  it('should return false for arbitrary strings', () => {
    expect(isZERO2Model('gpt-4')).toBe(false);
  });
});

describe('isAutoModel', () => {
  it('should return true for "auto"', () => {
    expect(isAutoModel(ZERO_MODEL_ALIAS_AUTO)).toBe(true);
  });

  it('should return true for "auto-zero-3"', () => {
    expect(isAutoModel(PREVIEW_ZERO_MODEL_AUTO)).toBe(true);
  });

  it('should return true for "auto-zero-2.5"', () => {
    expect(isAutoModel(DEFAULT_ZERO_MODEL_AUTO)).toBe(true);
  });

  it('should return false for concrete models', () => {
    expect(isAutoModel(DEFAULT_ZERO_MODEL)).toBe(false);
    expect(isAutoModel(PREVIEW_ZERO_MODEL)).toBe(false);
    expect(isAutoModel('some-random-model')).toBe(false);
  });
});

describe('resolveClassifierModel', () => {
  it('should return flash model when alias is flash', () => {
    expect(
      resolveClassifierModel(
        DEFAULT_ZERO_MODEL_AUTO,
        ZERO_MODEL_ALIAS_FLASH,
      ),
    ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    expect(
      resolveClassifierModel(
        PREVIEW_ZERO_MODEL_AUTO,
        ZERO_MODEL_ALIAS_FLASH,
      ),
    ).toBe(PREVIEW_ZERO_FLASH_MODEL);
  });

  it('should return pro model when alias is pro', () => {
    expect(
      resolveClassifierModel(DEFAULT_ZERO_MODEL_AUTO, ZERO_MODEL_ALIAS_PRO),
    ).toBe(DEFAULT_ZERO_MODEL);
    expect(
      resolveClassifierModel(PREVIEW_ZERO_MODEL_AUTO, ZERO_MODEL_ALIAS_PRO),
    ).toBe(PREVIEW_ZERO_MODEL);
  });

  it('should return ZERO 3.1 Pro when alias is pro and useZERO3_1 is true', () => {
    expect(
      resolveClassifierModel(
        PREVIEW_ZERO_MODEL_AUTO,
        ZERO_MODEL_ALIAS_PRO,
        true,
      ),
    ).toBe(PREVIEW_ZERO_3_1_MODEL);
  });

  it('should return ZERO 3.1 Pro Custom Tools when alias is pro, useZERO3_1 is true, and useCustomToolModel is true', () => {
    expect(
      resolveClassifierModel(
        PREVIEW_ZERO_MODEL_AUTO,
        ZERO_MODEL_ALIAS_PRO,
        true,
        true,
      ),
    ).toBe(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL);
  });
});

describe('isActiveModel', () => {
  it('should return true for valid models when useZERO3_1 is false', () => {
    expect(isActiveModel(DEFAULT_ZERO_MODEL)).toBe(true);
    expect(isActiveModel(PREVIEW_ZERO_MODEL)).toBe(true);
    expect(isActiveModel(DEFAULT_ZERO_FLASH_MODEL)).toBe(true);
  });

  it('should return true for Gemma 4 models when experimentalGemma is not provided (defaults to true)', () => {
    expect(isActiveModel(GEMMA_4_31B_IT_MODEL)).toBe(true);
    expect(isActiveModel(GEMMA_4_26B_A4B_IT_MODEL)).toBe(true);
    expect(isActiveModel(GEMMA_4_31B_IT_MODEL, false, false, true)).toBe(true);
    expect(isActiveModel(GEMMA_4_26B_A4B_IT_MODEL, false, false, true)).toBe(
      true,
    );
  });

  it('should return false for ZERO 3.1 models when ZERO 3.1 is not launched', () => {
    expect(isActiveModel(PREVIEW_ZERO_3_1_MODEL)).toBe(false);
  });

  it('should return true for unknown models and aliases', () => {
    expect(isActiveModel('invalid-model')).toBe(false);
    expect(isActiveModel(ZERO_MODEL_ALIAS_AUTO)).toBe(false);
  });

  it('should return false for PREVIEW_ZERO_MODEL when useZERO3_1 is true', () => {
    expect(isActiveModel(PREVIEW_ZERO_MODEL, true)).toBe(false);
  });

  it('should return true for other valid models when useZERO3_1 is true', () => {
    expect(isActiveModel(DEFAULT_ZERO_MODEL, true)).toBe(true);
  });

  it('should handle PREVIEW_ZERO_FLASH_LITE_MODEL activity correctly based on retirement status', () => {
    if (PREVIEW_ZERO_FLASH_LITE_MODEL === 'none') {
      expect(isActiveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, false, true)).toBe(
        false,
      );
      expect(isActiveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, true, true)).toBe(
        false,
      );
    } else {
      expect(isActiveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, false, true)).toBe(
        true,
      );
      expect(isActiveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, true, true)).toBe(
        true,
      );
    }
    expect(isActiveModel(DEFAULT_ZERO_FLASH_LITE_MODEL, false, false)).toBe(
      true,
    );
    expect(isActiveModel(DEFAULT_ZERO_FLASH_LITE_MODEL, true, true)).toBe(
      true,
    );
    expect(isActiveModel(DEFAULT_ZERO_FLASH_LITE_MODEL, true, false)).toBe(
      true,
    );
  });

  it('should correctly filter ZERO 3.1 models based on useCustomToolModel when useZERO3_1 is true', () => {
    // When custom tools are preferred, standard 3.1 should be inactive
    expect(isActiveModel(PREVIEW_ZERO_3_1_MODEL, true, true)).toBe(false);
    expect(
      isActiveModel(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL, true, true),
    ).toBe(true);

    // When custom tools are NOT preferred, custom tools 3.1 should be inactive
    expect(isActiveModel(PREVIEW_ZERO_3_1_MODEL, true, false)).toBe(true);
    expect(
      isActiveModel(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL, true, false),
    ).toBe(false);
  });

  it('should return false for ZERO 3.1 preview models when useZERO3_1 is false', () => {
    expect(isActiveModel(PREVIEW_ZERO_3_1_MODEL, false, false, true)).toBe(
      false,
    );
    expect(isActiveModel(PREVIEW_ZERO_3_1_MODEL, false, false, false)).toBe(
      false,
    );
    expect(
      isActiveModel(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL, false, false, true),
    ).toBe(false);
    expect(
      isActiveModel(PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL, false, false, false),
    ).toBe(false);
    if (PREVIEW_ZERO_FLASH_LITE_MODEL !== 'none') {
      expect(isActiveModel(PREVIEW_ZERO_FLASH_LITE_MODEL, false, false)).toBe(
        false,
      );
    }
    expect(isActiveModel(DEFAULT_ZERO_FLASH_LITE_MODEL, false, false)).toBe(
      true,
    );
  });
});

describe('ZERO 3.1 Config Resolution', () => {
  it('PREVIEW_ZERO_3_1_MODEL should resolve to chat-base-3 config (including thinkingLevel)', () => {
    const resolved = modelConfigService.getResolvedConfig({
      model: PREVIEW_ZERO_3_1_MODEL,
      isChatModel: true,
    });
    expect(
      resolved.generateContentConfig?.thinkingConfig?.thinkingLevel,
    ).toBeDefined();
  });

  it('PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL should resolve to chat-base-3 config (including thinkingLevel)', () => {
    const resolved = modelConfigService.getResolvedConfig({
      model: PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
      isChatModel: true,
    });
    expect(
      resolved.generateContentConfig?.thinkingConfig?.thinkingLevel,
    ).toBeDefined();
  });

  it('PREVIEW_ZERO_FLASH_LITE_MODEL should resolve to appropriate config based on retirement status', () => {
    if (PREVIEW_ZERO_FLASH_LITE_MODEL === 'none') {
      // If none, it falls back to chat-base which may not have thinkingLevel
      const resolved = modelConfigService.getResolvedConfig({
        model: PREVIEW_ZERO_FLASH_LITE_MODEL,
        isChatModel: true,
      });
      expect(resolved.model).toBe(PREVIEW_ZERO_FLASH_LITE_MODEL);
    } else {
      const resolved = modelConfigService.getResolvedConfig({
        model: PREVIEW_ZERO_FLASH_LITE_MODEL,
        isChatModel: true,
      });
      expect(
        resolved.generateContentConfig?.thinkingConfig?.thinkingLevel,
      ).toBeDefined();
    }
  });
});

describe('getAutoModelDescription', () => {
  it('should return ZERO 2.5 description when hasAccessToPreview is false', () => {
    const desc = getAutoModelDescription(false, false);
    expect(desc).toContain('zero-2.5-pro');
    expect(desc).toContain('zero-2.5-flash');
  });

  it('should return ZERO 3.0 description when hasAccessToPreview is true', () => {
    const desc = getAutoModelDescription(true, false);
    expect(desc).toContain('zero-3-pro-preview');
    expect(desc).toContain('zero-3-flash-preview');
  });

  it('should return ZERO 3.1 description when hasAccessToPreview and useZERO3_1 are true', () => {
    const desc = getAutoModelDescription(true, true);
    expect(desc).toContain('zero-3.1-pro-preview');
    expect(desc).toContain('zero-3-flash-preview');
  });

  it('should return ZERO 3.5 Flash description when hasAccessToPreview and useZERO3_5Flash are true', () => {
    const desc = getAutoModelDescription(true, true, true);
    expect(desc).toContain('zero-3.1-pro-preview');
    expect(desc).toContain(DEFAULT_ZERO_3_5_FLASH_MODEL);
  });
});

describe('resolveModel ZERO 3.5 Flash GA', () => {
  it('should resolve all but preview flash models to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is true (legacy)', () => {
    expect(
      resolveModel(
        ZERO_MODEL_ALIAS_FLASH,
        false,
        false,
        true,
        undefined,
        true,
      ),
    ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    expect(
      resolveModel(
        DEFAULT_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        undefined,
        true,
      ),
    ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    expect(
      resolveModel(
        PREVIEW_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        undefined,
        true,
      ),
    ).toBe(PREVIEW_ZERO_FLASH_MODEL);
  });

  it('should resolve all but preview flash models to zero-3.5-flash when useZERO3_5Flash is true (dynamic)', () => {
    const mockDynamicConfig = {
      getExperimentalDynamicModelConfiguration: () => true,
      modelConfigService,
    } as unknown as Config;

    expect(
      resolveModel(
        ZERO_MODEL_ALIAS_FLASH,
        false,
        false,
        true,
        mockDynamicConfig,
        true,
      ),
    ).toBe('zero-3.5-flash');
    expect(
      resolveModel(
        DEFAULT_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        mockDynamicConfig,
        true,
      ),
    ).toBe('zero-3.5-flash');
    expect(
      resolveModel(
        PREVIEW_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        mockDynamicConfig,
        true,
      ),
    ).toBe(PREVIEW_ZERO_FLASH_MODEL);
  });

  it('should NOT resolve flash models to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is false', () => {
    expect(
      resolveModel(
        ZERO_MODEL_ALIAS_FLASH,
        false,
        false,
        true,
        undefined,
        false,
      ),
    ).toBe(PREVIEW_ZERO_FLASH_MODEL);
    expect(
      resolveModel(
        DEFAULT_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        undefined,
        false,
      ),
    ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    expect(
      resolveModel(
        PREVIEW_ZERO_FLASH_MODEL,
        false,
        false,
        true,
        undefined,
        false,
      ),
    ).toBe(PREVIEW_ZERO_FLASH_MODEL);
  });

  it('should resolve to DEFAULT_ZERO_FLASH_MODEL when GA is false AND preview access is false (dynamic)', () => {
    const mockDynamicConfig = {
      getExperimentalDynamicModelConfiguration: () => true,
      modelConfigService,
    } as unknown as Config;

    expect(
      resolveModel(
        DEFAULT_ZERO_FLASH_MODEL,
        false,
        false,
        false, // No preview access
        mockDynamicConfig,
        false, // GA false
      ),
    ).toBe('zero-2.5-flash');
  });

  it('should resolve auto to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is true and classifier selects flash', () => {
    expect(
      resolveClassifierModel(
        ZERO_MODEL_ALIAS_AUTO,
        ZERO_MODEL_ALIAS_FLASH,
        false,
        false,
        true,
        undefined,
        true,
      ),
    ).toBe(DEFAULT_ZERO_FLASH_MODEL);
  });

  it('should resolve auto to zero-3.5-flash when useZERO3_5Flash is true and classifier selects flash (dynamic)', () => {
    const mockDynamicConfig = {
      getExperimentalDynamicModelConfiguration: () => true,
      modelConfigService,
    } as unknown as Config;

    expect(
      resolveClassifierModel(
        ZERO_MODEL_ALIAS_AUTO,
        ZERO_MODEL_ALIAS_FLASH,
        false,
        false,
        true,
        mockDynamicConfig,
        true,
      ),
    ).toBe('zero-3.5-flash');
  });

  describe('Flash model promotion and manual override routing logic', () => {
    it('should resolve flash alias to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is true (static)', () => {
      expect(
        resolveModel(
          ZERO_MODEL_ALIAS_FLASH,
          false,
          false,
          true,
          undefined,
          true,
        ),
      ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    });

    it('should resolve flash alias to zero-3.5-flash when useZERO3_5Flash is true (dynamic)', () => {
      const mockDynamicConfig = {
        getExperimentalDynamicModelConfiguration: () => true,
        modelConfigService,
      } as unknown as Config;

      expect(
        resolveModel(
          ZERO_MODEL_ALIAS_FLASH,
          false,
          false,
          true,
          mockDynamicConfig,
          true,
        ),
      ).toBe('zero-3.5-flash');
    });

    it('should resolve manual selection of zero-3-flash-preview to zero-3-flash-preview when useZERO3_5Flash is true and has preview access (static)', () => {
      expect(
        resolveModel(
          PREVIEW_ZERO_FLASH_MODEL,
          false,
          false,
          true,
          undefined,
          true,
        ),
      ).toBe('zero-3-flash-preview');
    });

    it('should resolve manual selection of zero-3-flash-preview to zero-3-flash-preview when useZERO3_5Flash is true and has preview access (dynamic)', () => {
      const mockDynamicConfig = {
        getExperimentalDynamicModelConfiguration: () => true,
        modelConfigService,
      } as unknown as Config;

      expect(
        resolveModel(
          PREVIEW_ZERO_FLASH_MODEL,
          false,
          false,
          true,
          mockDynamicConfig,
          true,
        ),
      ).toBe('zero-3-flash-preview');
    });

    it('should resolve manual selection of zero-3-flash-preview to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is true but lacks preview access (static)', () => {
      expect(
        resolveModel(
          PREVIEW_ZERO_FLASH_MODEL,
          false,
          false,
          false,
          undefined,
          true,
        ),
      ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    });

    it('should resolve manual selection of zero-3-flash-preview to zero-3.5-flash when useZERO3_5Flash is true but lacks preview access (dynamic)', () => {
      const mockDynamicConfig = {
        getExperimentalDynamicModelConfiguration: () => true,
        modelConfigService,
      } as unknown as Config;

      expect(
        resolveModel(
          PREVIEW_ZERO_FLASH_MODEL,
          false,
          false,
          false,
          mockDynamicConfig,
          true,
        ),
      ).toBe('zero-3.5-flash');
    });

    it('should resolve classifier-selected flash alias to DEFAULT_ZERO_FLASH_MODEL when useZERO3_5Flash is true (static)', () => {
      expect(
        resolveClassifierModel(
          ZERO_MODEL_ALIAS_AUTO,
          ZERO_MODEL_ALIAS_FLASH,
          false,
          false,
          true,
          undefined,
          true,
        ),
      ).toBe(DEFAULT_ZERO_FLASH_MODEL);
    });

    it('should resolve classifier-selected flash alias to zero-3.5-flash when useZERO3_5Flash is true (dynamic)', () => {
      const mockDynamicConfig = {
        getExperimentalDynamicModelConfiguration: () => true,
        modelConfigService,
      } as unknown as Config;

      expect(
        resolveClassifierModel(
          ZERO_MODEL_ALIAS_AUTO,
          ZERO_MODEL_ALIAS_FLASH,
          false,
          false,
          true,
          mockDynamicConfig,
          true,
        ),
      ).toBe('zero-3.5-flash');
    });

    it('should resolve auto to PREVIEW_ZERO_MODEL when useZERO3_5Flash is true and has preview access', () => {
      expect(
        resolveModel(
          ZERO_MODEL_ALIAS_AUTO,
          false,
          false,
          true, // hasAccessToPreview
          undefined,
          true, // useZERO3_5Flash
        ),
      ).toBe(PREVIEW_ZERO_MODEL);
    });
  });
});
