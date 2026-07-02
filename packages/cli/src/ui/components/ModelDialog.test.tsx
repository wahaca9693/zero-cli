/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { ModelDialog } from './ModelDialog.js';
import { renderWithProviders } from '../../test-utils/render.js';
import { waitFor } from '../../test-utils/async.js';
import { createMockSettings } from '../../test-utils/settings.js';
import {
  DEFAULT_ZERO_MODEL,
  ZERO_MODEL_ALIAS_AUTO,
  DEFAULT_ZERO_FLASH_MODEL,
  DEFAULT_ZERO_FLASH_LITE_MODEL,
  PREVIEW_ZERO_MODEL,
  PREVIEW_ZERO_3_1_MODEL,
  PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
  PREVIEW_ZERO_FLASH_MODEL,
  PREVIEW_ZERO_FLASH_LITE_MODEL,
  AuthType,
} from '@google/zero-cli-core';
import type { Config, ModelSlashCommandEvent } from '@google/zero-cli-core';

// Mock dependencies
const mockGetDisplayString = vi.fn();
const mockLogModelSlashCommand = vi.fn();
const mockModelSlashCommandEvent = vi.fn();

vi.mock('@google/zero-cli-core', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@google/zero-cli-core')>();
  return {
    ...actual,
    getAutoModelDescription: (
      hasAccessToPreview: boolean,
      useZERO3_1?: boolean,
    ) =>
      `Auto Model Description (preview: ${hasAccessToPreview}, 3.1: ${useZERO3_1})`,
    getDisplayString: (val: string) => mockGetDisplayString(val),
    logModelSlashCommand: (config: Config, event: ModelSlashCommandEvent) =>
      mockLogModelSlashCommand(config, event),
    ModelSlashCommandEvent: class {
      constructor(model: string) {
        mockModelSlashCommandEvent(model);
      }
    },
    PREVIEW_ZERO_FLASH_LITE_MODEL: 'none',
  };
});

describe('<ModelDialog />', () => {
  const mockSetModel = vi.fn();
  const mockGetModel = vi.fn();
  const mockOnClose = vi.fn();
  const mockGetHasAccessToPreviewModel = vi.fn();
  const mockGetZERO31LaunchedSync = vi.fn();
  const mockGetZERO31FlashLiteLaunchedSync = vi.fn();
  const mockGetProModelNoAccess = vi.fn();
  const mockGetProModelNoAccessSync = vi.fn();

  interface MockConfig extends Partial<Config> {
    setModel: (model: string, isTemporary?: boolean) => void;
    getModel: () => string;
    getHasAccessToPreviewModel: () => boolean;
    getIdeMode: () => boolean;
    getZERO31LaunchedSync: () => boolean;
    getProModelNoAccess: () => Promise<boolean>;
    getProModelNoAccessSync: () => boolean;
    getExperimentalGemma: () => boolean;
    getLastRetrievedQuota: () =>
      | {
          buckets: Array<{
            modelId?: string;
            remainingFraction?: number;
            resetTime?: string;
          }>;
        }
      | undefined;
  }

  const mockConfig: MockConfig = {
    setModel: mockSetModel,
    getModel: mockGetModel,
    getHasAccessToPreviewModel: mockGetHasAccessToPreviewModel,
    getIdeMode: () => false,
    getZERO31LaunchedSync: mockGetZERO31LaunchedSync,
    getProModelNoAccess: mockGetProModelNoAccess,
    getProModelNoAccessSync: mockGetProModelNoAccessSync,
    getExperimentalGemma: () => false,
    getLastRetrievedQuota: () => ({ buckets: [] }),
    getSessionId: () => 'test-session-id',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetModel.mockReturnValue(ZERO_MODEL_ALIAS_AUTO);
    mockGetHasAccessToPreviewModel.mockReturnValue(false);
    mockGetZERO31LaunchedSync.mockReturnValue(false);
    mockGetProModelNoAccess.mockResolvedValue(false);
    mockGetProModelNoAccessSync.mockReturnValue(false);

    // Default implementation for getDisplayString
    mockGetDisplayString.mockImplementation((val: string) => {
      if (val === 'auto') return 'Auto';
      return val;
    });
  });

  const renderComponent = async (
    configValue = mockConfig as Config,
    authType = AuthType.LOGIN_WITH_GOOGLE,
  ) => {
    const settings = createMockSettings({
      security: {
        auth: {
          selectedType: authType,
        },
      },
    });

    const result = await renderWithProviders(
      <ModelDialog onClose={mockOnClose} />,
      {
        config: configValue,
        settings,
      },
    );
    return result;
  };

  it('renders the initial "main" view correctly', async () => {
    const { lastFrame, unmount } = await renderComponent();
    expect(lastFrame()).toContain('Select Model');
    expect(lastFrame()).toContain('Remember model for future sessions: false');
    expect(lastFrame()).toContain('Auto');
    expect(lastFrame()).toContain('Manual');
    unmount();
  });

  it('renders the "manual" view initially for users with no pro access and filters Pro models with correct order', async () => {
    mockGetProModelNoAccessSync.mockReturnValue(true);
    mockGetProModelNoAccess.mockResolvedValue(true);
    mockGetHasAccessToPreviewModel.mockReturnValue(true);
    mockGetZERO31FlashLiteLaunchedSync.mockReturnValue(true);
    mockGetDisplayString.mockImplementation((val: string) => val);

    const { lastFrame, unmount } = await renderComponent();

    const output = lastFrame();
    expect(output).toContain('Select Model');
    expect(output).not.toContain(DEFAULT_ZERO_MODEL);
    expect(output).not.toContain(PREVIEW_ZERO_MODEL);

    // Verify order: Flash Preview -> Flash Lite (Preview/Default) -> Flash
    const flashPreviewIdx = output.indexOf(PREVIEW_ZERO_FLASH_MODEL);
    const flashLiteIdx = output.indexOf(DEFAULT_ZERO_FLASH_LITE_MODEL);
    const flashIdx = output.indexOf(DEFAULT_ZERO_FLASH_MODEL);

    expect(flashPreviewIdx).toBeLessThan(flashLiteIdx);
    expect(flashLiteIdx).toBeLessThan(flashIdx);

    expect(output).not.toContain('Auto');
    unmount();
  });

  it('closes dialog on escape in "manual" view for users with no pro access', async () => {
    mockGetProModelNoAccessSync.mockReturnValue(true);
    mockGetProModelNoAccess.mockResolvedValue(true);
    const { stdin, waitUntilReady, unmount } = await renderComponent();

    // Already in manual view
    await act(async () => {
      stdin.write('\u001B'); // Escape
    });
    await act(async () => {
      await waitUntilReady();
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    unmount();
  });

  it('switches to "manual" view when "Manual" is selected and uses getDisplayString for models', async () => {
    mockGetDisplayString.mockImplementation((val: string) => {
      if (val === DEFAULT_ZERO_MODEL) return 'Formatted Pro Model';
      if (val === DEFAULT_ZERO_FLASH_MODEL) return 'Formatted Flash Model';
      if (val === DEFAULT_ZERO_FLASH_LITE_MODEL)
        return 'Formatted Lite Model';
      return val;
    });

    const { lastFrame, stdin, waitUntilReady, unmount } =
      await renderComponent();

    // Select "Manual" (index 1)
    // Press down arrow to move to "Manual"
    await act(async () => {
      stdin.write('\u001B[B'); // Arrow Down
    });
    await waitUntilReady();

    // Press enter to select
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    // Should now show manual options
    await waitFor(() => {
      const output = lastFrame();
      expect(output).toContain('Formatted Pro Model');
      expect(output).toContain('Formatted Flash Model');
      expect(output).toContain('Formatted Lite Model');
    });
    unmount();
  });

  it('sets model and closes when a model is selected in "main" view', async () => {
    const { stdin, waitUntilReady, unmount } = await renderComponent();

    // Select "Auto" (index 0)
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    await waitFor(() => {
      expect(mockSetModel).toHaveBeenCalledWith(
        ZERO_MODEL_ALIAS_AUTO,
        true, // Session only by default
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
    unmount();
  });

  it('sets model and closes when a model is selected in "manual" view', async () => {
    const { stdin, waitUntilReady, unmount } = await renderComponent();

    // Navigate to Manual (index 1) and select
    await act(async () => {
      stdin.write('\u001B[B');
    });
    await waitUntilReady();
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    // Now in manual view. Default selection is first item (DEFAULT_ZERO_MODEL)
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    await waitFor(() => {
      expect(mockSetModel).toHaveBeenCalledWith(DEFAULT_ZERO_MODEL, true);
      expect(mockOnClose).toHaveBeenCalled();
    });
    unmount();
  });

  it('toggles persist mode with Tab key', async () => {
    const { lastFrame, stdin, waitUntilReady, unmount } =
      await renderComponent();

    expect(lastFrame()).toContain('Remember model for future sessions: false');

    // Press Tab to toggle persist mode
    await act(async () => {
      stdin.write('\t');
    });
    await waitUntilReady();

    await waitFor(() => {
      expect(lastFrame()).toContain('Remember model for future sessions: true');
    });

    // Select "Auto" (index 0)
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    await waitFor(() => {
      expect(mockSetModel).toHaveBeenCalledWith(
        ZERO_MODEL_ALIAS_AUTO,
        false, // Persist enabled
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
    unmount();
  });

  it('closes dialog on escape in "main" view', async () => {
    const { stdin, waitUntilReady, unmount } = await renderComponent();

    await act(async () => {
      stdin.write('\u001B'); // Escape
    });
    // Escape key has a 50ms timeout in KeypressContext, so we need to wrap waitUntilReady in act
    await act(async () => {
      await waitUntilReady();
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
    unmount();
  });

  it('goes back to "main" view on escape in "manual" view', async () => {
    const { lastFrame, stdin, waitUntilReady, unmount } =
      await renderComponent();

    // Go to manual view
    await act(async () => {
      stdin.write('\u001B[B');
    });
    await waitUntilReady();
    await act(async () => {
      stdin.write('\r');
    });
    await waitUntilReady();

    await waitFor(() => {
      expect(lastFrame()).toContain(DEFAULT_ZERO_MODEL);
    });

    // Press Escape
    await act(async () => {
      stdin.write('\u001B');
    });
    await act(async () => {
      await waitUntilReady();
    });

    await waitFor(() => {
      expect(mockOnClose).not.toHaveBeenCalled();
      // Should be back to main view (Manual option visible)
      expect(lastFrame()).toContain('Manual');
    });
    unmount();
  });

  it('shows the preferred manual model in the main view option using getDisplayString', async () => {
    mockGetModel.mockReturnValue(DEFAULT_ZERO_MODEL);
    mockGetDisplayString.mockImplementation((val: string) => {
      if (val === DEFAULT_ZERO_MODEL) return 'My Custom Model Display';
      if (val === 'auto') return 'Auto';
      return val;
    });
    const { lastFrame, unmount } = await renderComponent();

    expect(lastFrame()).toContain('Manual (My Custom Model Display)');
    unmount();
  });

  describe('Preview Models', () => {
    beforeEach(() => {
      mockGetHasAccessToPreviewModel.mockReturnValue(true);
    });

    it('shows Auto in main view when access is granted', async () => {
      const { lastFrame, unmount } = await renderComponent();
      expect(lastFrame()).toContain('Auto');
      unmount();
    });

    it('shows ZERO 3 models in manual view when ZERO 3.1 is NOT launched', async () => {
      mockGetZERO31LaunchedSync.mockReturnValue(false);
      const { lastFrame, stdin, waitUntilReady, unmount } =
        await renderComponent();

      // Go to manual view
      await act(async () => {
        stdin.write('\u001B[B'); // Manual
      });
      await waitUntilReady();
      await act(async () => {
        stdin.write('\r');
      });
      await waitUntilReady();

      const output = lastFrame();
      expect(output).toContain(PREVIEW_ZERO_MODEL);
      expect(output).toContain(PREVIEW_ZERO_FLASH_MODEL);
      unmount();
    });

    it('shows ZERO 3.1 models in manual view when ZERO 3.1 IS launched', async () => {
      mockGetZERO31LaunchedSync.mockReturnValue(true);
      const { lastFrame, stdin, waitUntilReady, unmount } =
        await renderComponent(mockConfig as Config, AuthType.USE_VERTEX_AI);

      // Go to manual view
      await act(async () => {
        stdin.write('\u001B[B'); // Manual
      });
      await waitUntilReady();
      await act(async () => {
        stdin.write('\r');
      });
      await waitUntilReady();

      const output = lastFrame();
      expect(output).toContain(PREVIEW_ZERO_3_1_MODEL);
      expect(output).toContain(PREVIEW_ZERO_FLASH_MODEL);
      unmount();
    });

    it('uses custom tools model when ZERO 3.1 IS launched and auth is ZERO API Key', async () => {
      mockGetZERO31LaunchedSync.mockReturnValue(true);
      const { stdin, waitUntilReady, unmount } = await renderComponent(
        mockConfig as Config,
        AuthType.USE_ZERO,
      );

      // Go to manual view
      await act(async () => {
        stdin.write('\u001B[B'); // Manual
      });
      await waitUntilReady();
      await act(async () => {
        stdin.write('\r');
      });
      await waitUntilReady();

      // Select ZERO 3.1 (first item in preview section)
      await act(async () => {
        stdin.write('\r');
      });
      await waitUntilReady();

      await waitFor(() => {
        expect(mockSetModel).toHaveBeenCalledWith(
          PREVIEW_ZERO_3_1_CUSTOM_TOOLS_MODEL,
          true,
        );
      });
      unmount();
    });

    it('does not show Flash Lite Preview model when it is retired (none) even if flag is enabled', async () => {
      mockGetProModelNoAccessSync.mockReturnValue(false);
      mockGetProModelNoAccess.mockResolvedValue(false);
      mockGetHasAccessToPreviewModel.mockReturnValue(true);
      mockGetZERO31FlashLiteLaunchedSync.mockReturnValue(true);
      const { lastFrame, stdin, waitUntilReady, unmount } =
        await renderComponent();

      // Go to manual view
      await act(async () => {
        stdin.write('\u001B[B'); // Manual
      });
      await waitUntilReady();
      await act(async () => {
        stdin.write('\r');
      });
      await waitUntilReady();

      const output = lastFrame();
      expect(output).not.toContain(PREVIEW_ZERO_FLASH_LITE_MODEL);
      expect(output).toContain(DEFAULT_ZERO_FLASH_LITE_MODEL);
      unmount();
    });
  });
});
