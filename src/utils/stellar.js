import { Keypair, TransactionBuilder, Networks, Operation, StrKey, Asset, Transaction, Address, nativeToScVal } from '@stellar/stellar-sdk';
import { LUMENS, STRALIO_CONTRACT_ID, HORIZON_SERVER_URL, XML_CONTRACT_ID, NETWORK_PASSPHRASE, RPC_SOROBAN_URL } from '../config/constants';

/**
 * Get the public key from Freighter wallet
 * @returns {Promise<string>} - Address
 */
export const getAddress = async () => {
  try {
    const { getAddress } = await import('@stellar/freighter-api');
    return await getAddress();
  } catch (error) {
    throw new Error('Failed to get public key from Freighter');
  }
};

/**
 * Build a Stellar transaction for payment
 * @param {string} toAddress - Recipient's public key
 * @param {number} amount - Amount in XLM
 * @param {Object} server - Stellar SDK server instance
 * @returns {Promise<Transaction>} - Transaction object
 */
export const buildTransaction = async (server, toAddress, amount, username, message) => {
  const fromAddressWrapped = await getAddress();
  const fromAddress = fromAddressWrapped.address;

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
          nativeToScVal(BigInt(amount * LUMENS), { type: "i128" }),
          nativeToScVal(username),
          nativeToScVal(message)        
        ]
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
};

/**
 * Sign and submit transaction via Freighter
 * @param {Object} server - Stellar SDK server instance
 * @param {Object} transaction - Stellar transaction object
 * @returns {Promise<Object>} - Transaction result with hash
 */
export const signAndSubmit = async (server, transaction) => {
  try {
    const { signTransaction } = await import('@stellar/freighter-api');
    const { rpc, assembleTransaction } = await import('@stellar/stellar-sdk');
    const rpcServer = new rpc.Server(RPC_SOROBAN_URL);

    const sim = await rpcServer.simulateTransaction(transaction);
    const preparedTx = rpc.assembleTransaction(transaction, sim).build();
    
    const { signedTxXdr } = await signTransaction(preparedTx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
    const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

    const result = await server.submitTransaction(signedTransaction);

    return {
      success: true,
      hash: result.hash,
      ledger: result.ledger,
    };
  } catch (error) {
    if (error.message?.includes('User denied') || error.message?.includes('rejected')) {
      throw new Error('Transaction rejected by user');
    }
    throw error;
  }
};

export const donate = async (toAddress, amount, username, message) => {
  const { Horizon } = await import('@stellar/stellar-sdk');

  const server = new Horizon.Server(HORIZON_SERVER_URL);

  const transaction = await buildTransaction(server, toAddress, amount, username, message);
  const result = await signAndSubmit(server, transaction);

  return result;
};

/**
 * Get StellarExpert URL for transaction
 * @param {string} hash - Transaction hash
 * @returns {string} - URL to view transaction
 */
export const getTransactionUrl = (hash) => {
  return `https://stellar.expert/explorer/public/tx/${hash}`;
};
