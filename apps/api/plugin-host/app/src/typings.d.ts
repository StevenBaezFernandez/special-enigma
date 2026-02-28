declare module 'isolated-vm' {
  export class Isolate {
    constructor(options?: any);
    createContextSync(options?: any): Context;
    compileScriptSync(code: string, options?: any): Script;
    getHeapStatisticsSync(): { total_heap_size: number };
    dispose(): void;
    isDisposed: boolean;
  }

  export class Context {
    global: Reference;
    release(): void;
  }

  export class Script {
    run(context: Context, options?: any): Promise<any>;
    runSync(context: Context, options?: any): any;
  }

  export class Reference {
    setSync(key: string, value: any, options?: any): boolean;
    getSync(key: string, options?: any): any;
    derefInto(): any;
  }

  export class ExternalCopy {
      constructor(value: any, options?: any);
      copyInto(): any;
  }
}
