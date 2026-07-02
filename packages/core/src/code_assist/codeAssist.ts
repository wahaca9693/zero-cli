/**
 * Code Assist Module
 */
export interface CodeAssistConfig {
  enabled: boolean;
}

export class CodeAssist {
  constructor(config: CodeAssistConfig) {}
}

export const codeAssist = {
  init: () => {},
  isEnabled: () => true,
};
