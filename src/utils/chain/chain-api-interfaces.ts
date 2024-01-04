import { Transaction } from '../../types';
import type { Abi } from './chain-rpc-interfaces';

/** Arguments to `getRequiredKeys` */
export type AuthorityProviderArgs = {
  /** Transaction that needs to be signed */
  transaction: Transaction;

  /** Public keys associated with the private keys that the `SignatureProvider` holds */
  availableKeys: string[];
};

/** Get subset of `availableKeys` needed to meet authorities in `transaction` */
export type AuthorityProvider = {
  /** Get subset of `availableKeys` needed to meet authorities in `transaction` */
  getRequiredKeys: (args: AuthorityProviderArgs) => Promise<string[]>;
};

/** Retrieves raw ABIs for a specified accountName */
export type AbiProvider = {
  /** Retrieve the BinaryAbi */
  getRawAbi: (accountName: string) => Promise<BinaryAbi>;
};

/** Structure for the raw form of ABIs */
export type BinaryAbi = {
  /** account which has deployed the ABI */
  accountName: string;

  /** abi in binary form */
  abi: Uint8Array;
};

/** Holds a fetched abi */
export type CachedAbi = {
  /** abi in binary form */
  rawAbi: Uint8Array;

  /** abi in structured form */
  abi: Abi;
};

/** Arguments to `sign` */
export type SignatureProviderArgs = {
  /** Chain transaction is for */
  chainId: string;

  /** Private key buffer needed to sign the transaction */
  privateKeyBuffer: Uint8Array;

  /** Transaction to sign */
  serializedTransaction: Uint8Array;

  /** Context-free data to sign */
  serializedContextFreeData?: Uint8Array;

  /** ABIs for all contracts with actions included in `serializedTransaction` */
  abis?: BinaryAbi[];
};
