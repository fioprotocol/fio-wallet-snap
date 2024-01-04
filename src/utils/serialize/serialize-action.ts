import { Transaction, TransactionAction } from '../../types';
import {
  SerialBuffer,
  arrayToHex,
  createInitialTypes,
  getTypesFromAbi,
} from '../chain/chain-serialize';

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export const serializeAction = async ({
  account,
  action,
  apiUrl,
  transaction,
}: {
  account: string;
  action: string;
  apiUrl: string;
  transaction: Transaction;
  }): Promise<TransactionAction | null> => {
  const abiFioAddress = await (
    await fetch(`${apiUrl}/v1/chain/get_abi`, {
      body: `{"account_name": ${account}}`,
      method: 'POST',
    })
  ).json();

  // Get a Map of all the types from fio.address
  const typesFioAddress = getTypesFromAbi(
    createInitialTypes(),
    abiFioAddress.abi,
  );

  // Get the addaddress action type
  const fioAction = typesFioAddress.get(action);

  const buffer = new SerialBuffer({ textEncoder, textDecoder });
  fioAction && fioAction.serialize(buffer, transaction.actions[0]?.data);
  const serializedData = arrayToHex(buffer.asUint8Array());

  if (!transaction.actions[0]) {
    return null;
  }

  const serializedAction = transaction.actions[0];

  if (serializedAction) {
    serializedAction.data = serializedData;
  }

  return serializedAction;
};
