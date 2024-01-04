/** Structured format for abis */
export type Abi = {
  version: string;
  types: Array<{ new_type_name: string; type: string }>;
  structs: Array<{
    name: string;
    base: string;
    fields: Array<{ name: string; type: string }>;
  }>;
  variants?: Array<{ name: string; types: string[] }>;
};

/** Return value of `/v1/chain/get_abi` */
export type GetAbiResult = {
  account_name: string;
  abi: Abi;
};

/** Subset of `GetBlockResult` needed to calculate TAPoS fields in transactions */
export type BlockTaposInfo = {
  timestamp: string;
  block_num: number;
  ref_block_prefix: number;
};

/** Return value of `/v1/chain/get_block` */
export type GetBlockResult = {
  timestamp: string;
  producer: string;
  confirmed: number;
  previous: string;
  transaction_mroot: string;
  action_mroot: string;
  schedule_version: number;
  producer_signature: string;
  id: string;
  block_num: number;
  ref_block_prefix: number;
};

/** Return value of `/v1/chain/get_code` */
export type GetCodeResult = {
  account_name: string;
  code_hash: string;
  wast: string;
  wasm: string;
  abi: Abi;
};

/** Return value of `/v1/chain/get_info` */
export type GetInfoResult = {
  server_version: string;
  chain_id: string;
  head_block_num: number;
  last_irreversible_block_num: number;
  last_irreversible_block_id: string;
  head_block_id: string;
  head_block_time: string;
  head_block_producer: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
  block_cpu_limit: number;
  block_net_limit: number;
};

/** Return value of `/v1/chain/get_raw_code_and_abi` */
export type GetRawCodeAndAbiResult = {
  account_name: string;
  wasm: string;
  abi: string;
};

/** Return value of `/v1/chain/get_raw_abi` */
export type GetRawAbiResult = {
  account_name: string;
  code_hash: string;
  abi_hash: string;
  abi: string;
};
