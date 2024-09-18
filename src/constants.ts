export const FIO_TRANSACTION_ACTION_NAMES = {
  newfundsreq: 'newfundsreq',
  recordobt: 'recordobt',
};

export const FIO_CHAIN_NAME = 'FIO';

export const DEFAULT_TIMEOUT_OFFSET = '60000'; // 1 min in miliseconds

export const FIO_CHAIN_ID = {
  MAINNET: '21dcae42c0182200e93f954a074011f9048a7624c6fe81d3c9541a614a88bd1c',
  TESTNET: 'b20901380af44ef59c5918439a1f9a41d83669020319a80574b804a5f95cbd7e',
};

export const FIO_ENVIRONMENT_CHAIN_NAMES = {
  [FIO_CHAIN_ID.MAINNET]: 'FIO Mainnet',
  [FIO_CHAIN_ID.TESTNET]: 'FIO Testnet',
};

export const DEFAULT_FIO_API_URL = 'https://chain.fio.net';

export const PROTOCOL_NAME = 'FIO Handle'; 

export const CHAIN_CODES_AND_TOKEN_CODES_BY_NETWORK: { [key: string]: {
  chainCode: string;
  tokenCode: string;
}} = {
  'eip155:1': {
    chainCode: 'ETH',
    tokenCode: 'ETH',
  },
  'eip155:10': {
    chainCode: 'OP',
    tokenCode: 'ETH',
  },
  'eip155:56': {
    chainCode: 'BSC',
    tokenCode: 'BNB',
  },
  'eip155:61': {
    chainCode: 'ETC',
    tokenCode: 'ETC',
  },
  'eip155:137': {
    chainCode: 'POL',
    tokenCode: 'POL',
  },
  'eip155:324': {
    chainCode: 'ZKSYNC',
    tokenCode: 'ETH',
  },
  'eip155:1101': {
    chainCode: 'POLZK',
    tokenCode: 'ETH',
  },
  'eip155:5000': {
    chainCode: 'MNT',
    tokenCode: 'MNT',
  },
  'eip155:8453': {
    chainCode: 'BASE',
    tokenCode: 'ETH',
  },
  'eip155:42161': {
    chainCode: 'ARB',
    tokenCode: 'ETH',
  },
  'eip155:42220': {
    chainCode: 'CELO',
    tokenCode: 'CELO',
  },
  'eip155:43114': {
    chainCode: 'AVAX',
    tokenCode: 'AVAX',
  },
  'eip155:59144': {
    chainCode: 'LINEA',
    tokenCode: 'ETH',
  },
  'eip155:7777777': {
    chainCode: 'ZORA',
    tokenCode: 'ETH',
  },
};
