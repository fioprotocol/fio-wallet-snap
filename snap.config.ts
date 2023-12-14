import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080,
  },
  polyfills: {
    assert: true,
    buffer: true,
    crypto: true,
    events: true,
    stream: true,
    util: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    string_decoder: true,
  },
};

export default config;
