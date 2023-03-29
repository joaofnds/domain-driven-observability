export interface Logger {
  log(msg: string);
  error(msg: string, error: any);
}

export class NodeLogger implements Logger {
  log(msg: string) {}
  error(msg: string, error: any) {}
}
