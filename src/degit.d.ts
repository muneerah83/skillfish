declare module 'degit' {
  interface DegitOptions {
    cache?: boolean;
    force?: boolean;
    verbose?: boolean;
  }

  interface Emitter {
    clone(dest: string): Promise<void>;
  }

  function degit(src: string, opts?: DegitOptions): Emitter;
  export = degit;
}
