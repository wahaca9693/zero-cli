/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelResolutionContext {
  useZERO3_1?: boolean;
  useZERO3_5Flash?: boolean;
  useCustomTools?: boolean;
  hasAccessToPreview?: boolean;
  requestedModel?: string;
  releaseChannel?: string;
}

/**
 * Interface for the ModelConfigService to break circular dependencies.
 */
export interface IModelConfigService {
  getModelDefinition(modelId: string):
    | {
        tier?: string;
        family?: string;
        isPreview?: boolean;
        displayName?: string;
        features?: {
          thinking?: boolean;
          multimodalToolUse?: boolean;
        };
      }
    | undefined;

  resolveModelId(
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;

  resolveClassifierModelId(
    tier: string,
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;
}

/**
 * Interface defining the minimal configuration required for model capability checks.
 * This helps break circular dependencies between Config and models.ts.
 */
export interface ModelCapabilityContext {
  readonly modelConfigService: IModelConfigService;
  getExperimentalDynamicModelConfiguration(): boolean;
}

export const PREVIEW_ZERO_MODEL = 'zero-3-pro-preview';
export const PREVIEW_ZERO_3_1_MODEL = 'zero-3.1-pro-preview';
export const PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL =
  'zero-3.1-pro-preview-customtools';
// TODO: set to none and const once the experiment for 3_5 flash rollut can be
// cleaned up.
export let PREVIEW_ZERO_FLASH_MODEL = 'zero-3-flash-preview';
export const DEFAULT_ZERO_MODEL = 'zero-2.5-pro';
// TODO: Set to const and update to 'zero-3.5-flash' once the experiment for
// 3_5 flash rollut can be cleaned up.
// This is set to either the same as the DEFAULT_ZERO_3_5_FLASH_MODEL const
// OR the SECONDARY_ZERO_3_5_FLASH_MODEL depending on which is needed for
// the user's backend as determined by hasZERO35FlashGAAccess in
// packages/core/src/config/config.ts
export let DEFAULT_ZERO_FLASH_MODEL = 'zero-2.5-flash';
export const DEFAULT_ZERO_3_5_FLASH_MODEL = 'zero-3.5-flash';
// This is resolved to 3.5 flash in backends where it is used,
// however those backends do not expect to see the string zero-3.5-flash
// so we need to provide this model as an alternative name in certain instances.
export const SECONDARY_ZERO_3_5_FLASH_MODEL = 'zero-3-flash';

// Used to set default flash models based on access
// TODO: Cleanup once the experiment for 3_5 flash rollut can be cleaned up.
export function setFlashModels(preview: string, defaultFlash: string) {
  PREVIEW_ZERO_FLASH_MODEL = preview;
  DEFAULT_ZERO_FLASH_MODEL = defaultFlash;
}
export const DEFAULT_ZERO_FLASH_LITE_MODEL = 'zero-3.1-flash-lite';
/** @deprecated ZERO 3.1 Flash Lite is now GA. Use DEFAULT_ZERO_FLASH_LITE_MODEL. */
export const PREVIEW_ZERO_FLASH_LITE_MODEL = 'none';

export const GEMMA_4_31B_IT_MODEL = 'gemma-4-31b-it';
export const GEMMA_4_26B_A4B_IT_MODEL = 'gemma-4-26b-a4b-it';

export const VALID_ZERO_MODELS = new Set([
  PREVIEW_ZERO_MODEL,
  PREVIEW_ZERO_3_1_MODEL,
  PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
  PREVIEW_ZERO_FLASH_MODEL,
  PREVIEW_ZERO_FLASH_LITE_MODEL,
  DEFAULT_ZERO_MODEL,
  DEFAULT_ZERO_FLASH_MODEL,
  DEFAULT_ZERO_3_5_FLASH_MODEL,
  SECONDARY_ZERO_3_5_FLASH_MODEL,
  DEFAULT_ZERO_FLASH_LITE_MODEL,

  GEMMA_4_31B_IT_MODEL,
  GEMMA_4_26B_A4B_IT_MODEL,
]);

/** @deprecated Use ZERO_MODEL_ALIAS_AUTO instead. */
export const PREVIEW_ZERO_MODEL_AUTO = 'auto-zero-3';
/** @deprecated Use ZERO_MODEL_ALIAS_AUTO instead. */
export const DEFAULT_ZERO_MODEL_AUTO = 'auto-zero-2.5';

// Model aliases for user convenience.
export const ZERO_MODEL_ALIAS_AUTO = 'auto';
export const ZERO_MODEL_ALIAS_PRO = 'pro';
export const ZERO_MODEL_ALIAS_FLASH = 'flash';
export const ZERO_MODEL_ALIAS_FLASH_LITE = 'flash-lite';

export const DEFAULT_ZERO_EMBEDDING_MODEL = 'zero-embedding-001';

// Cap the thinking at 8192 to prevent run-away thinking loops.
export const DEFAULT_THINKING_MODE = 8192;

export function getAutoModelDescription(
  hasAccessToPreview: boolean,
  useZERO3_1: boolean = false,
  useZERO3_5Flash: boolean = false,
) {
  const proModel = hasAccessToPreview
    ? useZERO3_1
      ? PREVIEW_ZERO_3_1_MODEL
      : PREVIEW_ZERO_MODEL
    : DEFAULT_ZERO_MODEL;
  const flashModel = hasAccessToPreview
    ? useZERO3_5Flash
      ? DEFAULT_ZERO_3_5_FLASH_MODEL
      : PREVIEW_ZERO_FLASH_MODEL
    : DEFAULT_ZERO_FLASH_MODEL;
  return `Let ZERO CLI decide the best model for the task: ${getDisplayString(proModel)}, ${getDisplayString(flashModel)}`;
}

/**
 * Resolves the requested model alias (e.g., 'auto', 'pro', 'flash', 'flash-lite')
 * to a concrete model name.
 *
 * @param requestedModel The model alias or concrete model name requested by the user.
 * @param useZERO3_1 Whether to use ZERO 3.1 Pro Preview for auto/pro aliases.
 * @param useZERO3_5Flash Whether to use ZERO 3.5 Flash GA.
 * @param hasAccessToPreview Whether the user has access to preview models.
 * @returns The resolved concrete model name.
 */
export function resolveModel(
  requestedModel: string,
  useZERO3_1: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
  useZERO3_5Flash: boolean = false,
): string {
  // Defensive check against non-string inputs at runtime
  const normalizedModel = Array.isArray(requestedModel)
    ? String(requestedModel.at(-1) ?? '').trim() || ''
    : typeof requestedModel !== 'string'
      ? String(requestedModel ?? '').trim() || ''
      : requestedModel.trim() || '';

  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = config.modelConfigService.resolveModelId(normalizedModel, {
      useZERO3_1,
      useCustomTools: useCustomToolModel,
      hasAccessToPreview,
      useZERO3_5Flash,
    });

    if (!hasAccessToPreview && isPreviewModel(resolved, config)) {
      // Fallback for unknown preview models.
      if (resolved.includes('flash-lite')) {
        return DEFAULT_ZERO_FLASH_LITE_MODEL;
      }
      if (resolved.includes('flash')) {
        return DEFAULT_ZERO_FLASH_MODEL;
      }
      return DEFAULT_ZERO_MODEL;
    }

    return resolved;
  }

  let resolved: string;
  switch (normalizedModel) {
    case ZERO_MODEL_ALIAS_AUTO:
    case ZERO_MODEL_ALIAS_PRO: {
      if (!hasAccessToPreview) {
        resolved = DEFAULT_ZERO_MODEL;
        break;
      }
      // fallthrough
    }
    case PREVIEW_ZERO_MODEL:
    case PREVIEW_ZERO_MODEL_AUTO: {
      if (useZERO3_1) {
        resolved = useCustomToolModel
          ? PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL
          : PREVIEW_ZERO_3_1_MODEL;
      } else {
        resolved = PREVIEW_ZERO_MODEL;
      }
      break;
    }
    case DEFAULT_ZERO_MODEL_AUTO: {
      resolved = DEFAULT_ZERO_MODEL;
      break;
    }
    case ZERO_MODEL_ALIAS_FLASH: {
      resolved = useZERO3_5Flash
        ? DEFAULT_ZERO_FLASH_MODEL
        : PREVIEW_ZERO_FLASH_MODEL;
      break;
    }
    case ZERO_MODEL_ALIAS_FLASH_LITE: {
      resolved = DEFAULT_ZERO_FLASH_LITE_MODEL;
      break;
    }
    default: {
      resolved = normalizedModel;
      break;
    }
  }

  if (resolved === 'none') {
    return DEFAULT_ZERO_FLASH_LITE_MODEL;
  }

  if (
    useZERO3_5Flash &&
    isFlashModel(resolved) &&
    normalizedModel !== PREVIEW_ZERO_FLASH_MODEL
  ) {
    return DEFAULT_ZERO_FLASH_MODEL;
  }

  if (!hasAccessToPreview && isPreviewModel(resolved)) {
    // Downgrade to stable models if user lacks preview access.
    switch (resolved) {
      case PREVIEW_ZERO_FLASH_MODEL:
        return DEFAULT_ZERO_FLASH_MODEL;
      case PREVIEW_ZERO_MODEL:
      case PREVIEW_ZERO_3_1_MODEL:
      case PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL:
        return DEFAULT_ZERO_MODEL;
      default:
        // Fallback for unknown preview models, preserving original logic.
        if (resolved.includes('flash-lite')) {
          return DEFAULT_ZERO_FLASH_LITE_MODEL;
        }
        if (resolved.includes('flash')) {
          return DEFAULT_ZERO_FLASH_MODEL;
        }
        return DEFAULT_ZERO_MODEL;
    }
  }

  return resolved;
}

function isFlashModel(model: string): boolean {
  return (
    model === DEFAULT_ZERO_FLASH_MODEL ||
    model === PREVIEW_ZERO_FLASH_MODEL ||
    model === DEFAULT_ZERO_3_5_FLASH_MODEL ||
    model === SECONDARY_ZERO_3_5_FLASH_MODEL ||
    model === 'flash' ||
    model.endsWith('flash')
  );
}

/**
 * Resolves the appropriate model based on the classifier's decision.
 *
 * @param requestedModel The current requested model (e.g. auto).
 * @param modelAlias The alias selected by the classifier ('flash' or 'pro').
 * @param useZERO3_1 Whether to use ZERO 3.1 Pro Preview.
 * @param useCustomToolModel Whether to use the custom tool model.
 * @param config Optional config object for dynamic model configuration.
 * @returns The resolved concrete model name.
 */
export function resolveClassifierModel(
  requestedModel: string,
  modelAlias: string,
  useZERO3_1: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
  useZERO3_5Flash: boolean = false,
): string {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.resolveClassifierModelId(
      modelAlias,
      requestedModel,
      {
        useZERO3_1,
        useCustomTools: useCustomToolModel,
        hasAccessToPreview,
        useZERO3_5Flash,
      },
    );
  }

  if (modelAlias === ZERO_MODEL_ALIAS_FLASH) {
    if (
      requestedModel === DEFAULT_ZERO_MODEL_AUTO ||
      requestedModel === DEFAULT_ZERO_MODEL
    ) {
      return DEFAULT_ZERO_FLASH_MODEL;
    }
    if (
      requestedModel === PREVIEW_ZERO_MODEL_AUTO ||
      requestedModel === PREVIEW_ZERO_MODEL ||
      requestedModel === ZERO_MODEL_ALIAS_AUTO
    ) {
      if (useZERO3_5Flash) {
        return DEFAULT_ZERO_FLASH_MODEL;
      }
      return hasAccessToPreview
        ? PREVIEW_ZERO_FLASH_MODEL
        : DEFAULT_ZERO_FLASH_MODEL;
    }
    return resolveModel(
      ZERO_MODEL_ALIAS_FLASH,
      false,
      false,
      hasAccessToPreview,
      config,
      useZERO3_5Flash,
    );
  }
  return resolveModel(
    requestedModel,
    useZERO3_1,
    useCustomToolModel,
    hasAccessToPreview,
    config,
    useZERO3_5Flash,
  );
}

export function getDisplayString(
  model: string,
  config?: ModelCapabilityContext,
) {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const definition = config.modelConfigService.getModelDefinition(model);
    if (definition?.displayName) {
      return definition.displayName;
    }
  }

  switch (model) {
    case 'zero-3-flash':
      return DEFAULT_ZERO_3_5_FLASH_MODEL;
    case ZERO_MODEL_ALIAS_AUTO:
      return 'Auto';
    case PREVIEW_ZERO_MODEL_AUTO:
      return 'Auto (ZERO 3)';
    case DEFAULT_ZERO_MODEL_AUTO:
      return 'Auto (ZERO 2.5)';
    case GEMMA_4_31B_IT_MODEL:
      return GEMMA_4_31B_IT_MODEL;
    case GEMMA_4_26B_A4B_IT_MODEL:
      return GEMMA_4_26B_A4B_IT_MODEL;
    case ZERO_MODEL_ALIAS_PRO:
      return PREVIEW_ZERO_MODEL;
    case ZERO_MODEL_ALIAS_FLASH:
      return PREVIEW_ZERO_FLASH_MODEL;
    case PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL:
      return PREVIEW_ZERO_3_1_MODEL;
    case PREVIEW_ZERO_FLASH_LITE_MODEL:
      return PREVIEW_ZERO_FLASH_LITE_MODEL;
    default:
      return model;
  }
}

/**
 * Checks if the model is a preview model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a preview model.
 */
export function isPreviewModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (model === 'none') {
    return false;
  }
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.isPreview === true
    );
  }

  return (
    model === PREVIEW_ZERO_MODEL ||
    model === PREVIEW_ZERO_3_1_MODEL ||
    model === PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL ||
    model === PREVIEW_ZERO_FLASH_MODEL ||
    model === PREVIEW_ZERO_MODEL_AUTO ||
    model === ZERO_MODEL_ALIAS_AUTO ||
    model === PREVIEW_ZERO_FLASH_LITE_MODEL
  );
}

/**
 * Checks if the model is a Pro model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a Pro model.
 */
export function isProModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'pro';
  }
  return model.toLowerCase().includes('pro');
}

/**
 * Checks if the model is a ZERO 3 model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a ZERO 3 model.
 */
export function isZERO3Model(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    // Legacy behavior resolves the model first.
    const resolved = resolveModel(model, false, false, true, config);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.family ===
      'zero-3'
    );
  }

  const resolved = resolveModel(model);
  return /^zero-3(\.|-|$)/.test(resolved);
}

/**
 * Checks if the model is a ZERO 2.x model.
 *
 * @param model The model name to check.
 * @returns True if the model is a ZERO-2.x model.
 */
export function isZERO2Model(model: string): boolean {
  // This is legacy behavior, will remove this when zero 2 models are no
  // longer needed.
  return /^zero-2(\.|$)/.test(model);
}

/**
 * Checks if the model is a "custom" model (not ZERO branded).
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is not a ZERO branded model.
 */
export function isCustomModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = resolveModel(model, false, false, true, config);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.tier ===
        'custom' || !resolved.startsWith('zero-')
    );
  }
  const resolved = resolveModel(model);
  return !resolved.startsWith('zero-');
}

/**
 * Checks if the model should be treated as a modern model.
 * This includes ZERO 3 models and any custom models.
 *
 * @param model The model name to check.
 * @returns True if the model supports modern features like thoughts.
 */
export function supportsModernFeatures(model: string): boolean {
  if (isZERO3Model(model)) return true;
  return isCustomModel(model);
}

/**
 * Checks if the model is an auto model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is an auto model.
 */
export function isAutoModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'auto';
  }
  return (
    model === ZERO_MODEL_ALIAS_AUTO ||
    model === PREVIEW_ZERO_MODEL_AUTO ||
    model === DEFAULT_ZERO_MODEL_AUTO
  );
}

/**
 * Checks if the model supports multimodal function responses (multimodal data nested within function response).
 * This is supported in ZERO 3.
 *
 * @param model The model name to check.
 * @returns True if the model supports multimodal function responses.
 */
export function supportsMultimodalFunctionResponse(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.features
        ?.multimodalToolUse === true
    );
  }
  return model.startsWith('zero-3-');
}

/**
 * Checks if the given model is considered active based on the current configuration.
 *
 * @param model The model name to check.
 * @param useZERO3_1 Whether ZERO 3.1 Pro Preview is enabled.
 * @returns True if the model is active.
 */
export function isActiveModel(
  model: string,
  useZERO3_1: boolean = false,
  useCustomToolModel: boolean = false,
  experimentalGemma: boolean = true,
): boolean {
  if (!VALID_ZERO_MODELS.has(model) || model === 'none') {
    return false;
  }
  if (model === GEMMA_4_31B_IT_MODEL || model === GEMMA_4_26B_A4B_IT_MODEL) {
    return experimentalGemma;
  }
  if (model === PREVIEW_ZERO_FLASH_LITE_MODEL) {
    return false;
  }
  if (useZERO3_1) {
    if (model === PREVIEW_ZERO_MODEL) {
      return false;
    }
    if (useCustomToolModel) {
      return model !== PREVIEW_ZERO_3_1_MODEL;
    } else {
      return model !== PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL;
    }
  } else {
    return (
      model !== PREVIEW_ZERO_3_1_MODEL &&
      model !== PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL
    );
  }
}

export const CCPA_AI_MODEL_MAPPINGS: Record<string, string> = {
  [DEFAULT_ZERO_3_5_FLASH_MODEL]: SECONDARY_ZERO_3_5_FLASH_MODEL,
};
