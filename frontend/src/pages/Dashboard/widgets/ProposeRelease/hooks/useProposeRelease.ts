import { useMemo, useState } from 'react';
import { contractAddress } from 'config';
import { signAndSendTransactions } from 'helpers';
import {
    Address,
    GAS_PRICE,
    ProxyNetworkProvider,
    ToastManager,
    Transaction,
    useGetAccount,
    useGetNetworkConfig
} from 'lib';
import { ErrEstimateTransactionCost } from '@multiversx/sdk-core/out';

const PROPOSE_TX_MESSAGES = {
    processingMessage: 'Processing proposeRelease transaction',
    errorMessage: 'An error has occurred during proposeRelease',
    successMessage: 'proposeRelease transaction successful'
};

export const useProposeRelease = () => {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const proxy = useMemo(
        () => new ProxyNetworkProvider(network.apiAddress),
        [network.apiAddress]
    );

    const proposeRelease = async (version: string, hash: string, url: string) => {
        console.log('proposeRelease called with:', { version, hash, url });
        if (!version || !hash || !url || !address) {
            return;
        }

        setIsSubmitting(true);

        try {
            const dataPayload = `proposeRelease@${Buffer.from(version).toString('hex')}@${Buffer.from(hash).toString('hex')}@${Buffer.from(url).toString('hex')}`;

            const tx = new Transaction({
                value: BigInt(0),
                data: Buffer.from(dataPayload),
                receiver: new Address(contractAddress),
                gasLimit: BigInt(10_000_000),
                gasPrice: BigInt(GAS_PRICE),
                chainID: network.chainId,
                sender: new Address(address),
                version: 2
            });

            const account = await proxy.getAccount(new Address(address));
            tx.nonce = account.nonce;

            const estimatedCost = await proxy.estimateTransactionCost(tx);
            tx.gasLimit = BigInt(estimatedCost.gasLimit);

            const sessionId = await signAndSendTransactions({
                transactions: [tx],
                transactionsDisplayInfo: PROPOSE_TX_MESSAGES
            });

            return sessionId;
        } catch (err) {
            console.error('Unable to call proposeRelease', err);
            new ToastManager().createCustomToast({
                message: (err as ErrEstimateTransactionCost)?.message ?? 'proposeRelease failed',
                toastId: 'propose-release-error'
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { proposeRelease, isSubmitting };
};
