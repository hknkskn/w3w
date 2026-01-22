import { BCS } from 'supra-l1-sdk';
import { WE3WAR_MODULES } from '../chain-config';

// --- Constants ---
export const RPC_URL = "https://rpc-testnet.supra.com";

export { WE3WAR_MODULES };


// --- Utils ---

export const parseMoveString = (value: any) => {
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            const hex = value.slice(2);
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
            }
            return str;
        }
        return value;
    }
    if (Array.isArray(value)) {
        return String.fromCharCode(...value);
    }
    return '';
};

export const hexToUint8Array = (hex: string): number[] => {
    if (typeof hex !== 'string') return [];
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
    }
    return bytes;
};

// --- Base Service ---

export const BaseService = {
    getProvider: () => {
        if (typeof window !== 'undefined' && window.starkey) {
            return window.starkey;
        }
        return null;
    },

    getAccount: async () => {
        const provider = BaseService.getProvider();
        if (!provider) throw new Error("Wallet not found");
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        return { provider, account: accounts[0] };
    },

    /**
     * Helper to send a transaction
     * Note: Sequence number is now managed by the wallet SDK internally
     * to avoid TOO_OLD/TOO_NEW race conditions with RPC.
     */
    sendTransaction: async (
        moduleAddress: string,
        moduleName: string,
        functionName: string,
        typeArgs: any[],
        args: any[]
    ): Promise<string> => {
        const { provider, account } = await BaseService.getAccount();
        const chainIdObject = await provider.supra.getChainId();
        const chainId = (chainIdObject as any).chainId || chainIdObject;

        // Let the wallet SDK handle sequence number internally
        // This avoids the TOO_OLD/TOO_NEW race conditions with stale RPC data
        const rawTxPayload = [
            account,
            0, // Placeholder - StarKey SDK will override this with correct value
            moduleAddress,
            moduleName,
            functionName,
            typeArgs,
            args,
            { txExpiryTime: Math.floor(Date.now() / 1000) + 60 } // 60 seconds, short timeout for faster retries
        ];

        console.log(`[BaseService] Sending TX: ${moduleName}::${functionName}`, rawTxPayload);

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: account,
            to: moduleAddress,
            chainId,
            value: ""
        });
    },

    /**
     * Helper for VIEW functions
     */
    view: async (functionFullname: string, typeArgs: any[] = [], args: any[] = []) => {
        if (!functionFullname) throw new Error("Function name required for view call");

        const MAX_RETRIES = 3;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
            try {
                const body = JSON.stringify({
                    function: functionFullname,
                    type_arguments: typeArgs,
                    arguments: args.map(arg => {
                        if (typeof arg === 'bigint') return arg.toString();
                        if (typeof arg === 'number') return arg;
                        return arg;
                    })
                });

                const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body
                });

                if (response.status === 429) {
                    attempt++;
                    const delay = attempt * 1000 + Math.random() * 500; // Add jitter
                    if (attempt < MAX_RETRIES) {
                        console.warn(`[BaseService] Rate limited (429) for ${functionFullname}. Retrying in ${Math.floor(delay)}ms...`);
                        await new Promise(r => setTimeout(r, delay));
                        continue;
                    }
                }

                if (!response.ok) {
                    const errText = await response.text();
                    // If function doesn't exist on-chain yet, return null instead of throwing
                    if (errText.includes("could not find entry function")) {
                        console.warn(`[BaseService] Function NOT FOUND on-chain: ${functionFullname}`);
                        return null;
                    }
                    throw new Error(`RPC Error (${response.status}): ${errText}`);
                }

                const result = await response.json();
                return result?.result || result;

            } catch (e: any) {
                // Retry on network errors too if we have retries left
                attempt++;
                if (attempt < MAX_RETRIES) {
                    const delay = attempt * 1000;
                    console.warn(`[BaseService] Network error for ${functionFullname}. Retrying in ${delay}ms...`, e.message);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }

                console.error(`[BaseService] View call failed for ${functionFullname}:`, e.message || e);
                throw e;
            }
        }
    }
};
