import type { BlockInfo, ChainInfo } from '../../types';

export const getChainInfo = async ({
  apiUrl,
}: {
  apiUrl: string;
}): Promise<{ info: ChainInfo; blockInfo: BlockInfo }> => {
  const info = await (await fetch(`${apiUrl}/v1/chain/get_info`)).json();

  const blockInfo = await (
    await fetch(`${apiUrl}/v1/chain/get_block`, {
      body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`,
      method: 'POST',
    })
  ).json();

  return { info, blockInfo };
};

export const getPublicAddressByFioHandle = async ({
  apiUrl,
  chainCode,
  fioHandle,
  tokenCode
}: {
  apiUrl: string,
  chainCode: string,
  fioHandle: string,
  tokenCode: string
}): Promise<string> => {
  const publicAddresses = await (await fetch(`${apiUrl}/v1/chain/get_pub_address`, {
    body: `{"fio_address": "${fioHandle}", "chain_code": "${chainCode}", "token_code": "${tokenCode}"}`,
    method: 'POST',
  })).json();

  return publicAddresses?.public_address;
};
