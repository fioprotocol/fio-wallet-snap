import type { BlockInfo, DataParams, Transaction } from '../../types';
import { accountHash } from '../general';

export const createTransaction = ({
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
    blockInfo: BlockInfo;
  };
  data: DataParams;
  dataActor?: string | undefined;
  fioPubKey: string;
  timeoutOffset: string;
  }): Transaction => {
  const {
    blockInfo: { block_num, ref_block_prefix },
  } = chainInfo;
  const currentDate = new Date();
  const timePlusTimeout = currentDate.getTime() + Number(timeoutOffset);
  const timeInISOString = new Date(timePlusTimeout).toISOString();
  const expiration = timeInISOString.substring(0, timeInISOString.length - 1);

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
