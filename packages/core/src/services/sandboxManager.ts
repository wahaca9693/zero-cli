export interface SandboxConfig {
  timeout?: number;
  memory?: number;
}

export class SandboxManager {
  private sandboxes = new Map<string, unknown>();

  createSandbox(id: string, config?: SandboxConfig): unknown {
    this.sandboxes.set(id, { config, created: Date.now() });
    return { id };
  }

  destroySandbox(id: string): void {
    this.sandboxes.delete(id);
  }

  getSandbox(id: string): unknown | undefined {
    return this.sandboxes.get(id);
  }
}

export const sandboxManager = new SandboxManager();
