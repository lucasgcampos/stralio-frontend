import { TransactionBuilder, Operation, StrKey, Address, nativeToScVal, Horizon, rpc } from '@stellar/stellar-sdk';
import {
  LUMENS,
  STRALIO_CONTRACT_ID,
  HORIZON_SERVER_URL,
  XML_CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_SOROBAN_URL,
} from '../config/constants';

/**
 * Build an unsigned Soroban transaction for the `donate` contract function.
 *
 * @param {string} fromAddress  - Sender's public key (from the connected wallet)
 * @param {string} toAddress    - Recipient's public key
 * @param {number} amount       - Amount in XLM
 * @param {string} username     - Donor username
 * @param {string} message      - Donation message
 * @returns {Promise<Transaction>}
 */
export const buildTransaction = async (fromAddress, toAddress, amount, username, message) => {
  const server = new Horizon.Server(HORIZON_SERVER_URL);

  if (!StrKey.isValidEd25519PublicKey(fromAddress)) {
    throw new Error('Invalid source public key');
  }
  if (!StrKey.isValidEd25519PublicKey(toAddress)) {
    throw new Error('Invalid destination public key');
  }

  const sourceAccount = await server.loadAccount(fromAddress);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: STRALIO_CONTRACT_ID,
        function: 'donate',
        args: [
          new Address(fromAddress).toScVal(),
          new Address(toAddress).toScVal(),
          new Address(XML_CONTRACT_ID).toScVal(),
          nativeToScVal(BigInt(Math.round(amount * LUMENS)), { type: 'i128' }),
          nativeToScVal(username),
          nativeToScVal(message),
        ],
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
};

/**
 * Simulate, sign (via the provided signer function), and submit a transaction.
 *
 * @param {Transaction} transaction      - Unsigned transaction object
 * @param {Function}    signFn           - async (xdr: string) => signedXdr: string
 *                                         Provided by useWallet().signTransaction
 * @returns {Promise<{ success: boolean, hash: string }>}
 */
export const signAndSubmit = async (transaction, signFn) => {
  const rpcServer = new rpc.Server(RPC_SOROBAN_URL, { allowHttp: false });

  // 1. Simulate to get footprint / auth entries
  const sim = await rpcServer.simulateTransaction(transaction);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Transaction simulation failed: ${sim.error}`);
  }

  // 2. Assemble (attach footprint + auth)
  const preparedTx = rpc.assembleTransaction(transaction, sim).build();

  // 3. Sign via the active wallet (Freighter ext, Freighter mobile, Lobstr, etc.)
  const signedXdr = await signFn(preparedTx.toXDR());

  // 4. Submit via Soroban RPC
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await rpcServer.sendTransaction(signedTx);

  if (result.status === 'ERROR') {
    throw new Error(`Submission failed: ${result.errorResult ?? result.status}`);
  }

  // 5. Poll until confirmed or failed
  let poll = await rpcServer.getTransaction(result.hash);
  let attempts = 0;
  while (poll.status === rpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 20) {
    await new Promise((res) => setTimeout(res, 1000));
    poll = await rpcServer.getTransaction(result.hash);
    attempts++;
  }

  if (poll.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error('Transaction failed on-chain');
  }

  return { success: true, hash: result.hash };
};

/**
 * High-level helper: build, sign and submit a donation.
 *
 * @param {string}   fromAddress - Sender's public key
 * @param {string}   toAddress   - Recipient's public key
 * @param {number}   amount      - Amount in XLM
 * @param {string}   username    - Donor username
 * @param {string}   message     - Donation message
 * @param {Function} signFn      - useWallet().signTransaction
 */
export const donate = async (fromAddress, toAddress, amount, username, message, signFn) => {
  const tx = await buildTransaction(fromAddress, toAddress, amount, username, message);
  return signAndSubmit(tx, signFn);
};

/**
 * Get StellarExpert URL for a transaction hash.
 */
export const getTransactionUrl = (hash) =>
  `https://stellar.expert/explorer/public/tx/${hash}`;
