import { Keypair, TransactionBuilder, Networks, Operation, StrKey, Asset, Transaction, Address, nativeToScVal } from '@stellar/stellar-sdk';
import { LUMENS, STELLAR_NETWORK, RECIPIENT_ADDRESS } from '../config/constants';

/**
 * Get the public key from Freighter wallet
 * @returns {Promise<string>} - Public key
 */
export const getPublicKey = async () => {
  try {
    const { getPublicKey } = await import('@stellar/freighter-api');
    return await getPublicKey();
  } catch (error) {
    throw new Error('Failed to get public key from Freighter');
  }
};

/**
 * Build a Stellar transaction for payment
 * @param {string} sourcePublicKey - Sender's public key
 * @param {string} destinationPublicKey - Recipient's public key
 * @param {number} amount - Amount in XLM
 * @param {Object} server - Stellar SDK server instance
 * @returns {Promise<Transaction>} - Transaction object
 */
export const buildTransaction = async (sourcePublicKey, destinationPublicKey, amount, server) => {
  // Validate addresses
  if (!StrKey.isValidEd25519PublicKey(sourcePublicKey.address)) {
    throw new Error('Invalid source public key');
  }

  if (!StrKey.isValidContract(destinationPublicKey)) {
    throw new Error('Invalid destination public key');
  }

  const sourceAccount = await server.loadAccount(sourcePublicKey.address);
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: await server.fetchBaseFee(),
    networkPassphrase: STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET,
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: RECIPIENT_ADDRESS,
        function: "donate",
        args: [
          new Address(sourceAccount.account_id).toScVal(),
          new Address(destinationPublicKey).toScVal(), 
          new Address("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC").toScVal(), 
          nativeToScVal(amount * LUMENS, { type: "i128" })
        ]
      })
    )
    .setTimeout(180)
    .build();

  return transaction;
};

/**
 * Sign and submit transaction via Freighter
 * @param {Object} transaction - Stellar transaction object
 * @returns {Promise<Object>} - Transaction result with hash
 */
export const signAndSubmit = async (transaction) => {
  try {
    const { signTransaction } = await import('@stellar/freighter-api');
    
    // Let Freighter sign the transaction
    const { signedTxXdr } = await signTransaction(transaction.toXDR(), {
      networkPassphrase: STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET,
    });

    // Reconstruct the Transaction from the signed XDR
    const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET);

    // Submit to network
    const { Horizon } = await import('@stellar/stellar-sdk');
    const server = new Horizon.Server(
      STELLAR_NETWORK === 'PUBLIC'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );

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

/**
 * Get StellarExpert URL for transaction
 * @param {string} hash - Transaction hash
 * @returns {string} - URL to view transaction
 */
export const getTransactionUrl = (hash) => {
  return `https://stellar.expert/explorer/public/tx/${hash}`;
};
