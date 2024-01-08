import { Buffer } from 'buffer';

import { signSignature } from '../encrypt/signature';
import type {
  SignatureProviderArgs,
} from './chain-api-interfaces';

export const signTx = ({
  chainId,
  privateKeyBuffer,
  serializedTransaction,
}: SignatureProviderArgs): string[] => {
  const signBuf = Buffer.concat([
    Buffer.from(chainId, 'hex'),
    Buffer.from(serializedTransaction),
    Buffer.from(new Uint8Array(32)),
  ]);

  const signatures = [signSignature({ data: signBuf, privateKeyBuffer })];

  return signatures;
};
