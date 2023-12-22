export const getChainInfo = async ({ apiUrl }: { apiUrl: string }) => {
  const info = await (await fetch(`${apiUrl}/v1/chain/get_info`)).json();

  const blockInfo = await (
    await fetch(`${apiUrl}/v1/chain/get_block`, {
      body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`,
      method: 'POST',
    })
  ).json();

  return { info, blockInfo };
};
