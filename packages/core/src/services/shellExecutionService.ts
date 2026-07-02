export class ShellExecutionService {
  execute(
    cmd: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return Promise.resolve({ stdout: '', stderr: '', exitCode: 0 });
  }
}
