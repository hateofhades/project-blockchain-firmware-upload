import { Router } from 'express';
import { data } from '../utils/data';
import { Address } from '@multiversx/sdk-core';

const router = Router();

interface SlotResponse {
    version: Buffer,
    hash: Buffer,
    url: Buffer
    status: {
        name: String,
        fields: String[]
    },
    approvals: Address[],
    creator: Address
}

router.get('/all', async (_req, res) => {
    if (!data.controller || !data.controller || !data.contractAddress) {
        return res.status(500).json({ error: 'SDK not initialized. Did you load ABI and set CONTRACT_ADDRESS?' });
    }

    try {
        const query = await data.controller.createQuery({
            contract: data.contractAddress,
            function: 'getSlots',
            arguments: []
        });
        const response = await data.controller.runQuery(query);
        let parsedResponse = await data.controller.parseQueryResponse(response)[0];

        parsedResponse = parsedResponse.map((item: [Buffer, SlotResponse]) => {
            return {
                version: item[1].version.toString(),
                hash: item[1].hash.toString(),
                url: item[1].url.toString(),
                status: {
                    name: item[1].status.name.toString(),
                    fields: item[1].status.fields.map(field => field.toString())
                }
            };
        });

        res.status(200).json(parsedResponse);
    } catch (error: unknown) {
        console.error('Failed to decode getSlots result', error);
        res.status(500).json({ error: 'Failed to decode contract response' });
    }
});

router.get('/latestRelease', async (_req, res) => {
    if (!data.controller || !data.controller || !data.contractAddress) {
        return res.status(500).json({ error: 'SDK not initialized. Did you load ABI and set CONTRACT_ADDRESS?' });
    }

    try {
        const query = await data.controller.createQuery({
            contract: data.contractAddress,
            function: 'getSlots',
            arguments: []
        });
        const response = await data.controller.runQuery(query);
        let parsedResponse = await data.controller.parseQueryResponse(response)[0];

        // Get the latest approved release (biggest version number with status "Approved")
        parsedResponse = parsedResponse.map((item: [Buffer, SlotResponse]) => {
            return {
                version: item[1].version.toString(),
                hash: item[1].hash.toString(),
                url: item[1].url.toString(),
                status: {
                    name: item[1].status.name.toString(),
                    fields: item[1].status.fields.map(field => field.toString())
                }
            };
        });

        const approvedReleases = parsedResponse.filter((item: any) => item.status.name === 'APPROVED');
        if (approvedReleases.length === 0) {
            return res.status(404).json({ error: 'No approved releases found' });
        }

        approvedReleases.sort((a: any, b: any) => {
            const versionA = a.version.split('.').map((num: string) => parseInt(num, 10));
            const versionB = b.version.split('.').map((num: string) => parseInt(num, 10));
            for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
                const diff = (versionB[i] || 0) - (versionA[i] || 0);
                if (diff !== 0) return diff;
            }
            return 0;
        });

        const latestRelease = approvedReleases[0];

        res.status(200).json(latestRelease);
    } catch (error: unknown) {
        console.error('Failed to decode getSlots result', error);
        res.status(500).json({ error: 'Failed to decode contract response' });
    }
});

export default router;
