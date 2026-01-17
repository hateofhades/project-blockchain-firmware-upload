import { Abi, Address, SmartContractController } from "@multiversx/sdk-core";

export interface IData {
    abi?: Abi;
    controller?: SmartContractController;
    contractAddress?: Address;
};

export const data: IData = {
    abi: undefined,
    controller: undefined,
    contractAddress: undefined
};
