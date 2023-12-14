/**
 * @module JS-Sig
 */
// copyright defined in fiojs/LICENSE.txt

// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from 'buffer';

import type {
  SignatureProvider,
  SignatureProviderArgs,
} from './chain-api-interfaces';
import { signChainTx } from './ecc/signature';

// const ecc = require('./ecc');

/** Signs transactions using in-process private keys */
// export class JsSignatureProvider implements SignatureProvider {

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
