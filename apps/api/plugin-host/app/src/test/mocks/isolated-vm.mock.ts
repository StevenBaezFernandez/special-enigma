export class Isolate {
  constructor() {
    // Mock constructor
  }
  createContextSync() {
    return new Context();
  }
  getHeapStatisticsSync() {
    return { total_heap_size: 100 };
  }
  dispose() {
    // Mock dispose
  }
  get isDisposed() { return false; }
  compileScriptSync(code: string) {
    return new Script(code);
  }
}

export class Context {
  global = {
    setSync: (fn: any) => {},
    derefInto: () => ({}),
  };
  release() {
    // Mock release
  }
}

export class Script {
  constructor(private code: string) {}
  run(context: any, options: any) {
    if (this.code.includes('throw new Error')) {
      return Promise.reject(new Error('Boom'));
    }
    if (this.code.includes('while(true)')) {
      return Promise.reject(new Error('Script execution timed out.'));
    }
    return Promise.resolve('Success');
  }
}
