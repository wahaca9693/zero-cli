export interface ModelConfig {
  name: string;
  displayName: string;
  description?: string;
}

export interface ModelConfigService {
  getAvailableModels(): ModelConfig[];
  getModelByName(name: string): ModelConfig | undefined;
}

export class DefaultModelConfigService implements ModelConfigService {
  private models: ModelConfig[] = [
    { name: 'zero-2.0', displayName: 'Zero 2.0' },
    { name: 'zero-2.5-flash', displayName: 'Zero 2.5 Flash' },
  ];

  getAvailableModels(): ModelConfig[] {
    return this.models;
  }

  getModelByName(name: string): ModelConfig | undefined {
    return this.models.find((m) => m.name === name);
  }
}

export const modelConfigService = new DefaultModelConfigService();
