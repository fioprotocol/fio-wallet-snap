import { accountHash } from '../general';

export const createTransaction = async ({
  account,
  action,
  authActor,
  chainInfo,
  data,
  dataActor,
  fioPubKey,
  timeoutOffset,
}: {
  account: string;
  action: string;
  authActor: string | undefined;
  chainInfo: {
    blockInfo: {
      block_num: string;
      ref_block_prefix: string;
    };
  };
  data: any;
  dataActor?: string | undefined;
  fioPubKey: string;
  timeoutOffset: number;
}) => {
  const {
    blockInfo: { block_num, ref_block_prefix },
  } = chainInfo;
  const currentDate = new Date();
  const timePlusTimeout = currentDate.getTime() + timeoutOffset;
  const timeInISOString = new Date(timePlusTimeout).toISOString();
  const expiration = timeInISOString.substr(0, timeInISOString.length - 1);

  const userAccount = accountHash(fioPubKey);

  const transaction = {
    expiration,
    ref_block_num: block_num & 0xffff,
    ref_block_prefix,
    actions: [
      {
        account,
        name: action,
        authorization: [
          {
            actor: authActor ?? userAccount,
            permission: 'active',
          },
        ],
        data: {
          ...data,
          actor: dataActor ?? userAccount,
        },
      },
    ],
  };

  return transaction;
};
