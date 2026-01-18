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

const REJECT_TX_MESSAGES = {
    processingMessage: 'Processing rejectRelease transaction',
    errorMessage: 'An error has occurred during rejectRelease',
    successMessage: 'rejectRelease transaction successful'
};

export const useRejectRelease = () => {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const proxy = useMemo(
        () => new ProxyNetworkProvider(network.apiAddress),
        [network.apiAddress]
    );

    const rejectRelease = async (version: string) => {
        if (!version || !address) {
            return;
        }

        setIsSubmitting(true);

        try {
            const dataPayload = `rejectRelease@${Buffer.from(version).toString('hex')}`;

            const tx = new Transaction({
                value: BigInt(0),
                // @ts-ignore
                data: Buffer.from(dataPayload),
                receiver: new Address(contractAddress),
                gasLimit: BigInt(8_000_000),
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
                transactionsDisplayInfo: REJECT_TX_MESSAGES
            });

            return sessionId;
        } catch (err) {
            console.error('Unable to call rejectRelease', err);
            new ToastManager().createCustomToast({
                message: (err as ErrEstimateTransactionCost)?.message ?? 'rejectRelease failed',
                toastId: 'reject-release-error'
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { rejectRelease, isSubmitting };
};
