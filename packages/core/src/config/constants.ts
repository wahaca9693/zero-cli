/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FileFilteringOptions {
  respectGitIgnore: boolean;
  respectZEROIgnore: boolean;
  enableFileWatcher?: boolean;
  maxFileCount?: number;
  searchTimeout?: number;
  customIgnoreFilePaths: string[];
}

// For memory files
export const DEFAULT_MEMORY_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: false,
  respectZEROIgnore: true,
  enableFileWatcher: false,
  maxFileCount: 20000,
  searchTimeout: 5000,
  customIgnoreFilePaths: [],
};

// For all other files
export const DEFAULT_FILE_FILTERING_OPTIONS: FileFilteringOptions = {
  respectGitIgnore: true,
  respectZEROIgnore: true,
  enableFileWatcher: false,
  maxFileCount: 20000,
  searchTimeout: 5000,
  customIgnoreFilePaths: [],
};

// Generic exclusion file name
export const ZERO_IGNORE_FILE_NAME = '.zeroignore';

// Extension integrity constants
export const INTEGRITY_FILENAME = 'extension_integrity.json';
export const INTEGRITY_KEY_FILENAME = 'integrity.key';
export const KEYCHAIN_SERVICE_NAME = 'zero-cli-extension-integrity';
export const SECRET_KEY_ACCOUNT = 'secret-key';
