import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import assert from 'assert';

const apiUrl = 'https://fiotestnet.blockpane.com';
const transactionActionParams = {
  apiUrl,
  actionParams: [{
    action: 'newfundsreq',
    account: 'fio.reqobt',
    data: {
      payer_fio_address: 'fiohandle@regtest',
      payee_fio_address: 'metamask-test@regtest',
      content: {
        amount: 12,
        payee_public_address: 'FIO8KTMqzViVioAhn8tNjJFCabEavUyq4bAdj8sx79JpLBt7GGBx9',
        chain_code: 'FIO',
        token_code: 'FIO',
        memo: 'Hello Metamask',
        hash: '',
        offline_url: '',
      },
      tpid: 'dashboard@fiouat',
      max_fee: 1500000000000
    },
    contentType: 'new_funds_content',
    payerFioPublicKey: 'FIO8P2omf7dxuHWQAS4Jb3Sz2hqRxgDqJLdhs4esTKXQxzt6hj8E8',
    derivationIndex: 0
  }],
};

const decryptContentParams = {
  content: 'UaAQEoLY+119Qulc5RbMTBJaGCO4Rme8a3lJOZrel9chNofrqlB67DBt1yCUaLkKEf3vkiHTr/2EQd3hpaPUK3VisrHQFGgY1H3ijB1vbIKoYpLS3qE5WAwYEORLPT/2IMKhmh0Z+jrVEYW1Hbo0rAnAbMyN5BBvCp2OT0H8jB9sskD1hiAHqpnzu6FpIze1',
  derivationIndex: 0,
  encryptionPublicKey: 'FIO8P2omf7dxuHWQAS4Jb3Sz2hqRxgDqJLdhs4esTKXQxzt6hj8E8',
  contentType: 'new_funds_content',
};

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Method not found.',
      stack: expect.any(String),
    });
  });

  it('returns the public address of FIO wallet', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'showPublicKey',
      params: {
        derivationIndex: 0,
      }
    });

    expect(response).toRespondWith(
      'FIO8KTMqzViVioAhn8tNjJFCabEavUyq4bAdj8sx79JpLBt7GGBx9',
    );
  });

  it('returns signed nonce', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'signNonce',
      params: {
        nonce: '6d2242964fbf8a611c26b5cdabec56ff318cf75484fefa4ceebc2a1bc9ea4070',
      },
    });

    const ui = await response.getInterface();

    await ui.ok();

    const result = await response;

    expect(result).toRespondWith(
      'SIG_K1_KdhCLhG1xe1EXk6xDiH9ETf6rkWohjSeAzEcAbdfHjEhr28LMzyahFChXiyt47UGt2TQ3i2WGHzM9LScnL4zF4V6McNUEc',
    );
  });

  it('returns signed transaction', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'signTransaction',
      params: transactionActionParams,
    });

    const ui = await response.getInterface();

    await ui.ok();

    const result = await response;

    if ('result' in result.response) {
      const resultObj = JSON.parse(result.response.result as string);
      const expectedKeys = ['signatures', 'compression', 'packed_context_free_data', 'packed_trx'];

      expect(typeof resultObj === 'object').toBe(true);
      expect(Array.isArray(resultObj.successed)).toBe(true);

      expectedKeys.forEach(key => {
        expect(resultObj.successed[0]).toHaveProperty(key);
      });
    }
  });

  it('returns canceled transaction confirmation', async () => {
    const { request, close } = await installSnap();

    const response = request({
      method: 'signTransaction',
      params: transactionActionParams,
    });

    const ui = await response.getInterface();

    assert(ui.type === 'confirmation');

    await ui.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: 'Sign transaction canceled',
      stack: expect.any(String),
    });
  });

  it('check decrypted content', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'decryptContent',
      params: decryptContentParams,
    });

    const ui = await response.getInterface();

    await ui.ok();

    const result = await response;

    if ('result' in result.response) {
      const resultObj = result.response.result as { memo: string};
      expect(resultObj.memo).toEqual('Hello Metamask');
    }
  });
});
