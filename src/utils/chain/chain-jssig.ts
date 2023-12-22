/**
 * @module JS-Sig
 */
// copyright defined in fiojs/LICENSE.txt

// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from 'buffer';

import { signChainTx } from '../encrypt/signature';
import type {
  SignatureProvider,
  SignatureProviderArgs,
} from './chain-api-interfaces';

/** Signs transactions using in-process private keys */

/** Sign a transaction */

export const signTx = async ({
  chainId,
  privateKeyBuffer,
  serializedTransaction,
}: SignatureProviderArgs): SignatureProvider => {
  const signBuf = Buffer.concat([
    Buffer.from(chainId, 'hex'),
    Buffer.from(serializedTransaction),
    Buffer.from(new Uint8Array(32)),
  ]);

  const signatures = [signChainTx({ data: signBuf, privateKeyBuffer })];

  return signatures;
};
