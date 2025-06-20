// SvelteKit adapter and handler utilities
export * from './handler.js';

export interface LambdaAdapterOptions {
  out?: string;
  precompress?: boolean;
  env?: {
    path?: string;
    host?: string;
    port?: string;
  };
}

export interface SvelteKitBuilder {
  log: {
    minor(message: string): void;
    success(message: string): void;
  };
  rimraf(path: string): void;
  writeClient(path: string): void;
  writePrerendered(path: string): void;
  writeServer(path: string): void;
}

export default function adapter(options: LambdaAdapterOptions = {}) {
  return {
    name: 'lambda-adapter-kit-sveltekit',
    async adapt(builder: SvelteKitBuilder) {
      const { out = 'build' } = options;

      builder.log.minor('Adapting for AWS Lambda...');

      builder.rimraf(out);

      builder.writeClient(`${out}/client`);
      builder.writePrerendered(`${out}/prerendered`);

      builder.writeServer(`${out}/server`);

      builder.log.success('AWS Lambda adapter complete');
    },
  };
}
