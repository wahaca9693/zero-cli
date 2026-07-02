/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Single source of truth for mapping model IDs to tool families.
 */

import { isZERO3Model } from '../../config/models.js';
import { type ToolFamily } from './types.js';

/**
 * Resolves the ToolFamily for a given model ID.
 * Defaults to 'default-legacy' if the model is not recognized or not provided.
 *
 * @param modelId The model identifier (e.g., 'zero-2.5-pro', 'zero-3-flash-preview')
 * @returns The resolved ToolFamily
 */
export function getToolFamily(modelId?: string): ToolFamily {
  if (!modelId) {
    return 'default-legacy';
  }

  // Explicit mapping for ZERO 3 family
  if (isZERO3Model(modelId)) {
    return 'zero-3';
  }

  // Fallback for all other models
  return 'default-legacy';
}
