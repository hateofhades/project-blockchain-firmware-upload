import fs from "fs-extra";
import { Abi, DevnetEntrypoint, Address } from "@multiversx/sdk-core";
import { data } from "./data";

export async function loadContractAbi() {
    const abiJson = await fs.readFile('./blockchain-contract.abi.json', 'utf8');

    data.abi = Abi.create(JSON.parse(abiJson));
    data.controller = new DevnetEntrypoint().createSmartContractController(data.abi);
    data.contractAddress = Address.newFromBech32(process.env.CONTRACT_ADDRESS || '');
}
