import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import { getPublicKey } from './utils/getKeys';
import { signTransaction } from './utils/transaction/sign-transaction';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const requestParams = request?.params as unknown;
  switch (request.method) {
    case 'showPublicKey': {
      return await getPublicKey();
    }
    case 'signTransaction': {
      return await signTransaction({ requestParams });
    }
    default:
      throw new Error('Method not found.');
  }
};
