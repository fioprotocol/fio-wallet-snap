import BigInteger from 'bigi';

export type DataParams = {
  amount?: string;
  bundle_sets?: number;
  chain_code?: string;
  content?:
  | {
    payer_public_address?: string;
    payee_public_address: string;
    amount: string;
    chain_code: string;
    token_code: string;
    status?: string;
    obt_id?: string;
    memo: string | null;
    hash: string | null;
    offline_url: string | null;
  }
  | string;
  fio_address?: string;
  fio_domain?: string;
  fio_request_id?: string;
  is_public?: number;
  max_fee: number;
  max_oracle_fee?: string;
  nfts?: {
    chain_code: string;
    contract_address: string;
    token_id: string;
    url?: string;
    hash?: string;
    metadata?: string;
  }[];
  new_owner_fio_public_key?: string;
  owner_fio_public_key?: string;
  payer_fio_address?: string;
  payee_fio_address?: string;
  payee_public_key?: string;
  public_addresses?: {
    chain_code: string;
    token_code: string;
    public_address: string;
  }[];
  public_address?: string;
  tpid: string;
};

export type RequestParamsItem = {
  actor?: string;
  account: string;
  action: string;
  authActor: string | undefined;
  contentType?: string;
  content?: string;
  data: DataParams;
  dataActor?: string;
  derivationIndex?: number;
  encryptionPublicKey?: string | undefined;
  id?: string;
  payerFioPublicKey?: string;
  timeoutOffset?: string;
  nonce?: string;
};

export type RequestParams = {
  apiUrl: string;
  actionParams: Array<RequestParamsItem>
} | {
  apiUrl: string;
} & RequestParamsItem;

export type BlockInfo = {
  action_mroot: string;
  block_extensions: string[];
  block_num: number;
  confirmed: number;
  header_extensions: string[];
  id: string;
  new_producers: string[] | null;
  previous: string;
  producer: string;
  producer_signature: string;
  ref_block_prefix: number;
  schedule_version: number;
  timestamp: string;
  transaction_mroot: string;
  transactions: string[];
};

export type ChainInfo = {
  block_cpu_limit: number;
  block_net_limit: number;
  chain_id: string;
  fork_db_head_block_id: string;
  fork_db_head_block_num: number;
  head_block_id: string;
  head_block_num: number;
  head_block_producer: string;
  head_block_time: string;
  last_irreversible_block_id: string;
  last_irreversible_block_num: number;
  server_version: string;
  server_version_string: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
};

export type TransactionAction = {
  account: string;
  name: string;
  authorization: Array<{
    actor: string;
    permission: string;
  }>;
  data: DataParams | string;
};

export type Transaction = {
  expiration: string;
  ref_block_num: number;
  ref_block_prefix: number;
  actions: Array<TransactionAction>;
};

export type SignedTransaction = {
  signatures: string[];
  compression: number;
  packed_context_free_data: string;
  packed_trx: string;
};

export type ECSignatureType = {
  r: BigInteger;
  s: BigInteger;
  toDER: () => Buffer;
};
