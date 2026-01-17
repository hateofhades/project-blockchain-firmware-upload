import app from './app';
import { loadContractAbi } from './utils/loadContractAbi';
import dotenv from 'dotenv';

async function main() {
    dotenv.config();

    const port = Number(process.env.PORT) || 3000;

    // Load the contract ABI before starting the server
    await loadContractAbi();

    app.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
    });
}

main();
