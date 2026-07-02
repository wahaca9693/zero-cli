export class GitService {
  clone(url: string, path: string): Promise<void> {}
  pull(): Promise<void> {}
  commit(message: string): void {}
}
