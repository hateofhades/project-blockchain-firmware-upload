import { useCallback, useEffect, useMemo, useState } from 'react';
import { contractAddress } from 'config';
import blockchainContractAbi from 'contracts/blockchain-contract.abi.json';
import {
    AbiRegistry,
    Address,
    ProxyNetworkProvider,
    SmartContractController,
    useGetNetworkConfig
} from 'lib';

export type SlotStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'UNKNOWN';

export interface SlotItemType {
    version: string;
    hash: string;
    url: string;
    status: SlotStatus;
    statusFields: string[];
    approvals?: string[];
    creator?: string;
}

const parseStatusName = (statusRaw: unknown): SlotStatus => {
    const name = (statusRaw as any)?.name?.toString?.();
    if (name === 'PROPOSED' || name === 'APPROVED' || name === 'REJECTED') {
        return name;
    }
    return 'UNKNOWN';
};

const parseSlotItem = (item: any): SlotItemType => {
    const slotStruct = Array.isArray(item) && item.length >= 2 ? item[1] : item;

    const versionFromTuple = Array.isArray(item) && item.length >= 1 ? item[0] : undefined;

    const statusName = parseStatusName(slotStruct?.status);
    const statusFields = (slotStruct?.status?.fields ?? [])
        .map((field: any) => field?.toString?.() ?? '')
        .filter(Boolean);

    return {
        version: slotStruct?.version?.toString?.() ?? versionFromTuple?.toString?.() ?? '',
        hash: slotStruct?.hash?.toString?.() ?? '',
        url: slotStruct?.url?.toString?.() ?? '',
        status: statusName,
        statusFields,
        approvals: (slotStruct?.approvals ?? [])
            .map((approval: any) => approval?.bech32?.() ?? approval?.toString?.() ?? '')
            .filter(Boolean),
        creator: slotStruct?.creator?.bech32?.() ?? slotStruct?.creator?.toString?.()
    };
};

export const useGetSlots = () => {
    const { network } = useGetNetworkConfig();
    const [slots, setSlots] = useState<SlotItemType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const proxy = useMemo(
        () => new ProxyNetworkProvider(network.apiAddress),
        [network.apiAddress]
    );

    const fetchSlots = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const abi = AbiRegistry.create(blockchainContractAbi);
            const controller = new SmartContractController({
                chainID: network.chainId,
                networkProvider: proxy,
                abi
            });

            const query = await controller.createQuery({
                contract: Address.newFromBech32(contractAddress),
                function: 'getSlots',
                arguments: []
            });

            const response = await controller.runQuery(query);
            const parsedResponse = (await controller.parseQueryResponse(response))[0] ?? [];

            const parsedSlots = parsedResponse.map((item: any) => parseSlotItem(item));

            setSlots(parsedSlots);
        } catch (err) {
            console.error('Unable to call getSlots', err);
            setError('Unable to load slots');
        } finally {
            setIsLoading(false);
        }
    }, [network.chainId, proxy]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    return {
        slots,
        isLoading,
        error,
        refetch: fetchSlots
    };
};
