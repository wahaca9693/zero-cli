/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { memoryCommand } from './memoryCommand.js';
import type { SlashCommand, CommandContext } from './types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { MessageType } from '../types.js';
import type { LoadedSettings } from '../../config/settings.js';
import {
  refreshMemory,
  SimpleExtensionLoader,
  type FileDiscoveryService,
  showMemory,
  listMemoryFiles,
  flattenMemory,
} from '@google/zero-cli-core';

vi.mock('@google/zero-cli-core', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@google/zero-cli-core')>();
  return {
    ...original,
    getErrorMessage: vi.fn((error: unknown) => {
      if (error instanceof Error) return error.message;
      return String(error);
    }),
    refreshMemory: vi.fn(async (config) => {
      await config.getMemoryContextManager()?.refresh();
      const memoryContent = original.flattenMemory(config.getUserMemory());
      const fileCount = config.getZEROMdFileCount() || 0;
      return {
        type: 'message',
        messageType: 'info',
        content: `Memory reloaded successfully. Loaded ${memoryContent.length} characters from ${fileCount} file(s).`,
      };
    }),
    showMemory: vi.fn(),
    listMemoryFiles: vi.fn(),
  };
});

const mockRefreshMemory = refreshMemory as Mock;

describe('memoryCommand', () => {
  let mockContext: CommandContext;

  const buildMemoryCommand = (): SlashCommand => memoryCommand(null);

  const getSubCommand = (name: 'show' | 'reload' | 'list'): SlashCommand => {
    const subCommand = buildMemoryCommand().subCommands?.find(
      (cmd) => cmd.name === name,
    );
    if (!subCommand) {
      throw new Error(`/memory ${name} command not found.`);
    }
    return subCommand;
  };

  describe('subcommands', () => {
    it('does not include the legacy add subcommand', () => {
      const command = buildMemoryCommand();
      const names = command.subCommands?.map((cmd) => cmd.name) ?? [];
      expect(names).toEqual(['show', 'reload', 'list', 'inbox']);
    });
  });

  describe('/memory show', () => {
    let showCommand: SlashCommand;
    let mockGetUserMemory: Mock;
    let mockGetZEROMdFileCount: Mock;

    beforeEach(() => {
      showCommand = getSubCommand('show');

      mockGetUserMemory = vi.fn();
      mockGetZEROMdFileCount = vi.fn();

      vi.mocked(showMemory).mockImplementation((config) => {
        const memoryContent = flattenMemory(config.getUserMemory());
        const fileCount = config.getZEROMdFileCount() || 0;
        let content;
        if (memoryContent.length > 0) {
          content = `Current memory content from ${fileCount} file(s):\n\n---\n${memoryContent}\n---`;
        } else {
          content = 'Memory is currently empty.';
        }
        return {
          type: 'message',
          messageType: 'info',
          content,
        };
      });

      mockContext = createMockCommandContext({
        services: {
          agentContext: {
            config: {
              getUserMemory: mockGetUserMemory,
              getZEROMdFileCount: mockGetZEROMdFileCount,
              getExtensionLoader: () => new SimpleExtensionLoader([]),
            },
          },
        },
      });
    });

    it('should display a message if memory is empty', async () => {
      if (!showCommand.action) throw new Error('Command has no action');

      mockGetUserMemory.mockReturnValue('');
      mockGetZEROMdFileCount.mockReturnValue(0);

      await showCommand.action(mockContext, '');

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Memory is currently empty.',
        },
        expect.any(Number),
      );
    });

    it('should display the memory content and file count if it exists', async () => {
      if (!showCommand.action) throw new Error('Command has no action');

      const memoryContent = 'This is a test memory.';

      mockGetUserMemory.mockReturnValue(memoryContent);
      mockGetZEROMdFileCount.mockReturnValue(1);

      await showCommand.action(mockContext, '');

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: `Current memory content from 1 file(s):\n\n---\n${memoryContent}\n---`,
        },
        expect.any(Number),
      );
    });
  });

  describe('/memory reload', () => {
    let reloadCommand: SlashCommand;
    let mockSetUserMemory: Mock;
    let mockSetZEROMdFileCount: Mock;
    let mockSetZEROMdFilePaths: Mock;
    let mockContextManagerRefresh: Mock;

    beforeEach(() => {
      reloadCommand = getSubCommand('reload');
      mockSetUserMemory = vi.fn();
      mockSetZEROMdFileCount = vi.fn();
      mockSetZEROMdFilePaths = vi.fn();
      mockContextManagerRefresh = vi.fn().mockResolvedValue(undefined);

      const mockConfig = {
        setUserMemory: mockSetUserMemory,
        setZEROMdFileCount: mockSetZEROMdFileCount,
        setZEROMdFilePaths: mockSetZEROMdFilePaths,
        getWorkingDir: () => '/test/dir',
        getDebugMode: () => false,
        getFileService: () => ({}) as FileDiscoveryService,
        getExtensionLoader: () => new SimpleExtensionLoader([]),
        getExtensions: () => [],
        shouldLoadMemoryFromIncludeDirectories: () => false,
        getWorkspaceContext: () => ({
          getDirectories: () => [],
        }),
        getFileFilteringOptions: () => ({
          ignore: [],
          include: [],
        }),
        isTrustedFolder: () => false,
        updateSystemInstructionIfInitialized: vi
          .fn()
          .mockResolvedValue(undefined),
        getMemoryContextManager: vi.fn().mockReturnValue({
          refresh: mockContextManagerRefresh,
        }),
        getUserMemory: vi.fn().mockReturnValue(''),
        getZEROMdFileCount: vi.fn().mockReturnValue(0),
      };

      mockContext = createMockCommandContext({
        services: {
          agentContext: { config: mockConfig },
          settings: {
            merged: {
              memoryDiscoveryMaxDirs: 1000,
              context: {
                importFormat: 'tree',
              },
            },
          } as unknown as LoadedSettings,
        },
      });
      mockRefreshMemory.mockClear();
    });

    it('should use MemoryContextManager.refresh', async () => {
      if (!reloadCommand.action) throw new Error('Command has no action');

      const config = mockContext.services.agentContext?.config;
      if (!config) throw new Error('Config is undefined');

      vi.mocked(config.getUserMemory).mockReturnValue('JIT Memory Content');
      vi.mocked(config.getZEROMdFileCount).mockReturnValue(3);

      await reloadCommand.action(mockContext, '');

      expect(mockContextManagerRefresh).toHaveBeenCalledOnce();

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Memory reloaded successfully. Loaded 18 characters from 3 file(s).',
        },
        expect.any(Number),
      );
    });

    it('should display success message when memory is reloaded with content', async () => {
      if (!reloadCommand.action) throw new Error('Command has no action');

      const successMessage = {
        type: 'message',
        messageType: MessageType.INFO,
        content:
          'Memory reloaded successfully. Loaded 18 characters from 2 file(s).',
      };
      mockRefreshMemory.mockResolvedValue(successMessage);

      await reloadCommand.action(mockContext, '');

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Reloading memory from source files...',
        },
        expect.any(Number),
      );

      expect(mockRefreshMemory).toHaveBeenCalledOnce();

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Memory reloaded successfully. Loaded 18 characters from 2 file(s).',
        },
        expect.any(Number),
      );
    });

    it('should display success message when memory is reloaded with no content', async () => {
      if (!reloadCommand.action) throw new Error('Command has no action');

      const successMessage = {
        type: 'message',
        messageType: MessageType.INFO,
        content: 'Memory reloaded successfully. No memory content found.',
      };
      mockRefreshMemory.mockResolvedValue(successMessage);

      await reloadCommand.action(mockContext, '');

      expect(mockRefreshMemory).toHaveBeenCalledOnce();

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Memory reloaded successfully. No memory content found.',
        },
        expect.any(Number),
      );
    });

    it('should display an error message if reloading fails', async () => {
      if (!reloadCommand.action) throw new Error('Command has no action');

      const error = new Error('Failed to read memory files.');
      mockRefreshMemory.mockRejectedValue(error);

      await reloadCommand.action(mockContext, '');

      expect(mockRefreshMemory).toHaveBeenCalledOnce();
      expect(mockSetUserMemory).not.toHaveBeenCalled();
      expect(mockSetZEROMdFileCount).not.toHaveBeenCalled();
      expect(mockSetZEROMdFilePaths).not.toHaveBeenCalled();

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.ERROR,
          text: `Error reloading memory: ${error.message}`,
        },
        expect.any(Number),
      );
    });

    it('should not throw if config service is unavailable', async () => {
      if (!reloadCommand.action) throw new Error('Command has no action');

      const nullConfigContext = createMockCommandContext({
        services: { agentContext: null },
      });

      await expect(
        reloadCommand.action(nullConfigContext, ''),
      ).resolves.toBeUndefined();

      expect(nullConfigContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'Reloading memory from source files...',
        },
        expect.any(Number),
      );

      expect(mockRefreshMemory).not.toHaveBeenCalled();
    });
  });

  describe('/memory list', () => {
    let listCommand: SlashCommand;
    let mockGetZEROMdfilePaths: Mock;

    beforeEach(() => {
      listCommand = getSubCommand('list');
      mockGetZEROMdfilePaths = vi.fn();
      vi.mocked(listMemoryFiles).mockImplementation((config) => {
        const filePaths = config.getZEROMdFilePaths() || [];
        const fileCount = filePaths.length;
        let content;
        if (fileCount > 0) {
          content = `There are ${fileCount} ZERO.md file(s) in use:\n\n${filePaths.join('\n')}`;
        } else {
          content = 'No ZERO.md files in use.';
        }
        return {
          type: 'message',
          messageType: 'info',
          content,
        };
      });
      mockContext = createMockCommandContext({
        services: {
          agentContext: {
            config: {
              getZEROMdFilePaths: mockGetZEROMdfilePaths,
            },
          },
        },
      });
    });

    it('should display a message if no ZERO.md files are found', async () => {
      if (!listCommand.action) throw new Error('Command has no action');

      mockGetZEROMdfilePaths.mockReturnValue([]);

      await listCommand.action(mockContext, '');

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: 'No ZERO.md files in use.',
        },
        expect.any(Number),
      );
    });

    it('should display the file count and paths if they exist', async () => {
      if (!listCommand.action) throw new Error('Command has no action');

      const filePaths = ['/path/one/ZERO.md', '/path/two/ZERO.md'];
      mockGetZEROMdfilePaths.mockReturnValue(filePaths);

      await listCommand.action(mockContext, '');

      expect(mockContext.ui.addItem).toHaveBeenCalledWith(
        {
          type: MessageType.INFO,
          text: `There are 2 ZERO.md file(s) in use:\n\n${filePaths.join('\n')}`,
        },
        expect.any(Number),
      );
    });
  });

  describe('/memory inbox', () => {
    let inboxCommand: SlashCommand;

    beforeEach(() => {
      inboxCommand = buildMemoryCommand().subCommands!.find(
        (cmd) => cmd.name === 'inbox',
      )!;
      expect(inboxCommand).toBeDefined();
    });

    it('should return custom_dialog when config is available and flag is enabled', () => {
      if (!inboxCommand.action) throw new Error('Command has no action');

      const mockConfig = {
        reloadSkills: vi.fn(),
        isAutoMemoryEnabled: vi.fn().mockReturnValue(true),
      };
      const context = createMockCommandContext({
        services: {
          agentContext: { config: mockConfig },
        },
        ui: {
          removeComponent: vi.fn(),
          reloadCommands: vi.fn(),
        },
      });

      const result = inboxCommand.action(context, '');

      expect(result).toHaveProperty('type', 'custom_dialog');
      expect(result).toHaveProperty('component');
    });

    it('should return info message when auto memory is disabled', () => {
      if (!inboxCommand.action) throw new Error('Command has no action');

      const mockConfig = {
        isAutoMemoryEnabled: vi.fn().mockReturnValue(false),
      };
      const context = createMockCommandContext({
        services: {
          agentContext: { config: mockConfig },
        },
      });

      const result = inboxCommand.action(context, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'The memory inbox requires Auto Memory. Enable it with: experimental.autoMemory = true in settings.',
      });
    });

    it('should return error when config is not loaded', () => {
      if (!inboxCommand.action) throw new Error('Command has no action');

      const context = createMockCommandContext({
        services: {
          agentContext: null,
        },
      });

      const result = inboxCommand.action(context, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Config not loaded.',
      });
    });
  });
});
