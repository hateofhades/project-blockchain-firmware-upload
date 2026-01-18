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

const APPROVE_TX_MESSAGES = {
    processingMessage: 'Processing approveRelease transaction',
    errorMessage: 'An error has occurred during approveRelease',
    successMessage: 'approveRelease transaction successful'
};

export const useApproveRelease = () => {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const proxy = useMemo(
        () => new ProxyNetworkProvider(network.apiAddress),
        [network.apiAddress]
    );

    const approveRelease = async (version: string) => {
        if (!version || !address) {
            return;
        }

        setIsSubmitting(true);

        try {
            const dataPayload = `approveRelease@${Buffer.from(version).toString('hex')}`;

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
                transactionsDisplayInfo: APPROVE_TX_MESSAGES
            });

            return sessionId;
        } catch (err) {
            console.error('Unable to call approveRelease', err);
            new ToastManager().createCustomToast({
                message: (err as ErrEstimateTransactionCost).message,
                toastId: 'approve-release-error',
            });
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { approveRelease, isSubmitting };
};
