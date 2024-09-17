import { AddressLookupArgs, AddressLookupResult, DomainLookupArgs, DomainLookupResult } from '@metamask/snaps-sdk';

import { CHAIN_CODES_AND_TOKEN_CODES_BY_NETWORK, PROTOCOL_NAME } from '../constants';
import { validateFioHandle } from './validation/fio';
import { getPublicAddressByFioHandle } from './chain/chain-get-info';

export const nameLookup = async (request: AddressLookupArgs | DomainLookupArgs): Promise<AddressLookupResult | DomainLookupResult | null> => {
  const { chainId, domain } = request;

  if (domain && chainId) {
    const isDomainValid = validateFioHandle(domain);
    const { chainCode, tokenCode } = CHAIN_CODES_AND_TOKEN_CODES_BY_NETWORK[chainId] || {};

    if (!chainCode || !tokenCode || !isDomainValid) {
      return null;
    }

    try {
      const publicAddress = await getPublicAddressByFioHandle({
        apiUrl: 'https://fio.blockpane.com',
        chainCode,
        fioHandle: domain,
        tokenCode,
      });

      if (!publicAddress) {
        return null;
      }

      return {
        resolvedAddresses: [{
          protocol: PROTOCOL_NAME,
          resolvedAddress: publicAddress,
          domainName: domain,
        }]
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  } else {
    return null;
  }
};
