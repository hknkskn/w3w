import { BCS } from 'supra-l1-sdk';
import { WE3WAR_MODULES } from './chain-config';

// Define the StarKey provider interface based on common wallet standards
interface SupraProvider {
    connect: () => Promise<string[]>;
    account: () => Promise<string[]>;
    createRawTransactionData: (payload: any) => Promise<string>;
    sendTransaction: (tx: any) => Promise<string>; // returns tx hash
}

const RPC_URL = "https://rpc-testnet.supra.com";

const TESTNET_CHAIN_ID = 6; // Supra Testnet Chain ID

export const ContractService = {

    /**
     * Enforce Testnet Connection
     */
    enforceTestnet: async (): Promise<void> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const chainIdData = await provider.supra.getChainId();
        const chainId = (chainIdData as any).chainId || chainIdData;

        if (Number(chainId) !== TESTNET_CHAIN_ID) {
            try {
                await provider.supra.changeNetwork({ chainId: TESTNET_CHAIN_ID });
            } catch (e) {
                console.error("Failed to switch network:", e);
                alert("Please switch your StarKey wallet to Supra Testnet!");
                throw new Error("Incorrect network");
            }
        }
    },

    /**
     * Checks if a user is registered by calling the view function `is_registered`
     */
    checkRegistration: async (address: string): Promise<boolean> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.CITIZEN}::is_registered`,
                    type_arguments: [],
                    arguments: [address]
                })
            });

            const result = await response.json();

            // Handle different RPC formats
            if (result && Array.isArray(result)) {
                return result[0] === true;
            }

            if (result && result.result && Array.isArray(result.result)) {
                return result.result[0] === true;
            }

            return false;
        } catch (e) {
            console.error("Failed to check registration:", e);
            return false;
        }
    },

    /**
     * Registers a new citizen on-chain
     */
    registerCitizen: async (username: string, countryCode: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");

        const provider = window.starkey as any;
        if (!provider.supra) throw new Error("StarKey Supra provider not found");

        try {
            // 1. Enforce Testnet
            await ContractService.enforceTestnet();

            // 2. Fetch Chain ID and Account
            let chainId = await provider.supra.getChainId();
            if (typeof chainId === 'object' && (chainId as any).chainId) {
                chainId = (chainId as any).chainId;
            }
            console.log("Chain ID:", chainId);

            // Enforce Testnet (Chain ID 6)
            // The wallet usually returns string "6" or number 6
            if (String(chainId) !== '6') {
                throw new Error(`Wrong Network! Please switch your StarKey wallet to Supra Testnet (Chain ID 6). Current: ${chainId}`);
            }

            const accounts = await provider.supra.account();
            if (!accounts || accounts.length === 0) throw new Error("No account connected");
            const sender = accounts[0];

            // 2. Prepare BCS Arguments
            // register(username: String, citizenship: u8)
            console.log("BCS Methods available:", Object.keys(BCS));
            const serializedArgs = [
                Array.from(BCS.bcsSerializeStr(username)),
                Array.from(BCS.bcsSerializeU8(countryCode))
            ];

            console.log("Serialized Args (Types):", serializedArgs.map(arg => Array.isArray(arg) ? 'Array' : typeof arg));
            console.log("Serialized Args (Values):", serializedArgs);

            // 3. Build the 8-element array payload
            const moduleParts = WE3WAR_MODULES.CITIZEN.split('::');
            const moduleAddr = moduleParts[0];
            const moduleName = moduleParts[1];
            const functionName = "register";
            const txExpiryTime = Math.floor(Date.now() / 1000) + 300; // 5 mins

            const rawTxPayload = [
                sender,             // 1. senderAddr
                0,                  // 2. senderSequenceNumber (0 lets wallet handle it)
                moduleAddr,         // 3. moduleAddr
                moduleName,         // 4. moduleName
                functionName,       // 5. functionName
                [],                 // 6. functionTypeArgs
                serializedArgs,     // 7. functionArgs
                { txExpiryTime }    // 8. optionalTransactionPayloadArgs
            ];

            console.log("Creating Raw Transaction Data with Array:", rawTxPayload);
            const data = await provider.supra.createRawTransactionData(rawTxPayload);
            console.log("Raw Tx Created:", data);

            if (!data) {
                throw new Error("Failed to create raw transaction data (null returned)");
            }

            // 4. Send Transaction
            const params = {
                data: data,
                from: sender,
                to: moduleAddr,
                chainId: chainId,
                value: ""
            };

            console.log("Sending Transaction with Params:", params);
            const txHash = await provider.supra.sendTransaction(params);
            console.log("Transaction Hash:", txHash);

            console.log("Transaction Hash:", txHash);

            if (!txHash || (typeof txHash === 'object' && Object.keys(txHash).length === 0)) {
                throw new Error("Transaction failed or rejected (empty hash)");
            }

            return txHash;

        } catch (e: any) {
            console.error("Registration transaction failed:", e);
            throw e;
        }
    },

    /**
     * Fetches the full profile of a registered user
     */
    getProfile: async (address: string) => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.CITIZEN}::get_profile`,
                    type_arguments: [],
                    arguments: [address]
                })
            });

            const result = await response.json();

            if (!result || result.length === 0) return null;

            // Map result array to object
            return {
                id: result[0],
                username: result[1] ? (typeof result[1] === 'string' ? result[1] : "Citizen") : "Citizen",
                citizenship: Number(result[2]),
                level: Number(result[3]),
                xp: Number(result[4]),
                energy: Number(result[5]),
                maxEnergy: Number(result[6]),
                strength: Number(result[7]),
                rankPoints: Number(result[8]),
                credits: Number(result[9]),
                employerId: result[10]
            };
        } catch (e) {
            console.error("Failed to fetch profile:", e);
            return null;
        }
    },

    /**
     * Fetches the user's inventory
     */
    getInventory: async (address: string) => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.INVENTORY}::get_inventory`,
                    type_arguments: [],
                    arguments: [address]
                })
            });

            const result = await response.json();
            // result is [ [ {id, category, quality, quantity}, ... ] ]
            if (!result || !result[0]) return [];
            return result[0];
        } catch (e) {
            console.error("Failed to fetch inventory:", e);
            return [];
        }
    },

    /**
     * Fetches CRED token balance for an address using view function
     */
    getCoinBalance: async (address: string): Promise<number> => {
        try {
            // Use 0x1::coin::balance view function
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: "0x1::coin::balance",
                    type_arguments: [WE3WAR_MODULES.COIN_TYPE],
                    arguments: [address]
                })
            });

            const result = await response.json();
            console.log("CRED balance response:", result);

            // Handle different response formats
            let rawBalance = 0;
            if (Array.isArray(result) && result.length > 0) {
                rawBalance = Number(result[0]);
            } else if (result?.result && Array.isArray(result.result)) {
                rawBalance = Number(result.result[0]);
            }

            // CRED has 2 decimals
            return rawBalance / 100;
        } catch (e) {
            console.error("Failed to fetch CRED balance:", e);
            return 0;
        }
    },

    /**
     * Fetches SUPRA (native) balance for an address using view function
     */
    getSupraBalance: async (address: string): Promise<number> => {
        try {
            // Use 0x1::coin::balance view function for SupraCoin
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: "0x1::coin::balance",
                    type_arguments: ["0x1::supra_coin::SupraCoin"],
                    arguments: [address]
                })
            });

            const result = await response.json();
            console.log("SUPRA balance response:", result);

            // Handle different response formats
            let rawBalance = 0;
            if (Array.isArray(result) && result.length > 0) {
                rawBalance = Number(result[0]);
            } else if (result?.result && Array.isArray(result.result)) {
                rawBalance = Number(result.result[0]);
            }

            // SUPRA has 8 decimals
            return rawBalance / 100000000;
        } catch (e) {
            console.error("Failed to fetch SUPRA balance:", e);
            return 0;
        }
    },

    /**
     * Fetches dashboard data (profile + credits) from citizen module
     */
    getDashboardData: async (address: string) => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.CITIZEN}::get_dashboard_data`,
                    type_arguments: [],
                    arguments: [address]
                })
            });

            const rawResult = await response.json();
            console.log("getDashboardData RAW response:", rawResult);

            // Handle both {result: [...]} and direct array formats
            const result = rawResult?.result || rawResult;
            console.log("getDashboardData parsed result:", result);

            if (!result || !Array.isArray(result) || result.length === 0) {
                console.warn("getDashboardData: No data or unexpected format");
                return null;
            }

            // Map result: [level, xp, energy, strength, credits]
            const data = {
                level: Number(result[0] || 0),
                xp: Number(result[1] || 0),
                energy: Number(result[2] || 0),
                strength: Number(result[3] || 0),
                credits: Number(result[4] || 0)
            };
            console.log("getDashboardData final data:", data);
            return data;
        } catch (e) {
            console.error("Failed to fetch dashboard data:", e);
            return null;
        }
    },

    getAllCompanies: async () => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.COMPANY}::get_all_companies`,
                    type_arguments: [],
                    arguments: []
                })
            });

            const result = await response.json();
            console.log("getAllCompanies RAW response:", result);
            console.log("getAllCompanies result[0]:", result?.result?.[0] || result?.[0]);

            // Handle both {result: [...]} and direct array formats
            const companies = result?.result?.[0] || result?.[0];
            if (!companies || !Array.isArray(companies)) {
                return [];
            }
            return companies;
        } catch (e) {
            console.error("Failed to fetch companies:", e);
            return [];
        }
    },

    // --- Company Functions ---

    createCompany: async (name: string, type: number, regionId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "create_company",
            [],
            [
                Array.from(BCS.bcsSerializeStr(name)),
                Array.from(BCS.bcsSerializeU8(type)),
                Array.from(BCS.bcsSerializeUint64(regionId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    postJobOffer: async (companyId: number, salary: number, positions: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "post_job_offer",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId)),
                Array.from(BCS.bcsSerializeUint64(salary)),
                Array.from(BCS.bcsSerializeUint64(positions))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    takeJob: async (companyId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "take_job",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    resignJob: async (companyId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "resign_job",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    /**
     * Perform work shift
     */
    performWork: async (companyId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "work",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId, // Handle both object and value
            value: ""
        });
    },



    depositCompanyFunds: async (companyId: number, amount: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "deposit_funds",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId)),
                Array.from(BCS.bcsSerializeUint64(amount))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },


    // --- Marketplace Functions ---

    listMarketItem: async (itemId: number, category: number, quality: number, quantity: number, price: number, country: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "list_item",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(category)),
                Array.from(BCS.bcsSerializeU8(quality)),
                Array.from(BCS.bcsSerializeUint64(quantity)),
                Array.from(BCS.bcsSerializeUint64(price)),
                Array.from(BCS.bcsSerializeU8(country))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    buyMarketItem: async (listingId: number, quantity: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "buy_item",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(listingId)),
                Array.from(BCS.bcsSerializeUint64(quantity))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    fight: async (battleId: number, itemId: number, quality: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "fight",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(quality))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.BATTLE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    declareWar: async (regionId: number, countryId: number, isTraining: boolean): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "declare_war",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(regionId)),
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeBool(isTraining))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.BATTLE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    endRound: async (battleId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "end_round",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.BATTLE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    endBattle: async (battleId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "end_battle",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.BATTLE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    createMilitaryUnit: async (name: String): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "create_unit",
            [],
            [Array.from(BCS.bcsSerializeStr(name.toString()))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    joinMilitaryUnit: async (unitId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "join_unit",
            [],
            [Array.from(BCS.bcsSerializeUint64(unitId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    setDailyOrder: async (regionId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "set_daily_order",
            [],
            [Array.from(BCS.bcsSerializeUint64(regionId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    getMemberUnit: async (address: string): Promise<number> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.MILITARY_UNIT}::get_member_unit`,
                    arguments: [address],
                    type_arguments: []
                })
            });
            const result = await response.json();
            return parseInt(result[0] || "0");
        } catch (e) {
            console.error("Failed to fetch member unit:", e);
            return 0;
        }
    },

    cancelListing: async (listingId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            WE3WAR_MODULES.MARKETPLACE.split('::')[1],
            "cancel_listing",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(listingId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.MARKETPLACE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    /**
     * Fetch user's own marketplace listings
     */
    getMyListings: async (address: string): Promise<any[]> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.MARKETPLACE}::get_my_listings`,
                    arguments: [address],
                    type_arguments: []
                })
            });
            const result = await response.json();
            return Array.isArray(result) ? result[0] : [];
        } catch (e) {
            console.error("Failed to fetch my listings:", e);
            return [];
        }
    },

    withdrawCompanyProduct: async (companyId: number, amount: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "withdraw_product",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId)),
                Array.from(BCS.bcsSerializeUint64(amount))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    depositCompanyRaw: async (companyId: number, itemId: number, amount: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "deposit_raw",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(companyId)),
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeUint64(amount))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    upgradeCompanyQuality: async (companyId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.COMPANY.split('::')[0],
            WE3WAR_MODULES.COMPANY.split('::')[1],
            "upgrade_quality",
            [],
            [Array.from(BCS.bcsSerializeUint64(companyId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.COMPANY.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    trainMulti: async (regimenIds: number[]): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const moduleAddr = WE3WAR_MODULES.TRAINING.split('::')[0];
        const moduleName = WE3WAR_MODULES.TRAINING.split('::')[1];

        console.log("Training Multi Call:", {
            sender,
            module: `${moduleAddr}::${moduleName}`,
            regimenIds,
            serializedArgs: [Array.from(BCS.bcsSerializeBytes(new Uint8Array(regimenIds)))]
        });

        const rawTxPayload = [
            sender, 0,
            moduleAddr,
            moduleName,
            "train_multi",
            [],
            [Array.from(BCS.bcsSerializeBytes(new Uint8Array(regimenIds)))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.TRAINING.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    upgradeTrainingGrounds: async (regimenId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        console.log("Upgrade Training Grounds - regimenId:", regimenId);

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.TRAINING.split('::')[0],
            WE3WAR_MODULES.TRAINING.split('::')[1],
            "upgrade_building",
            [],
            [Array.from(BCS.bcsSerializeU8(regimenId))], // Properly serialize as u8
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        console.log("Upgrade rawTxPayload:", rawTxPayload);

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.TRAINING.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    getActiveBattleDetails: async (): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.BATTLE}::get_active_battle_details`,
                    arguments: [],
                    type_arguments: []
                })
            });
            return await response.json();
        } catch (e) {
            console.error("Failed to fetch active battle details:", e);
            return null;
        }
    },

    getBattleRoundDetails: async (battleId: number): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.BATTLE}::get_battle_round_details`,
                    type_arguments: [],
                    arguments: [battleId]
                })
            });
            const result = await response.json();
            if (!result || result.length === 0) return null;
            return {
                currentRound: parseInt(result[0]),
                attackerPoints: parseInt(result[1]),
                defenderPoints: parseInt(result[2]),
                roundEndTime: parseInt(result[3]),
                attackerDamage: result[4],
                defenderDamage: result[5],
                attackerTopAddr: result[6],
                attackerTopInfluence: result[7],
                defenderTopAddr: result[8],
                defenderTopInfluence: result[9]
            };
        } catch (e) {
            console.error("Failed to fetch battle round details:", e);
            return null;
        }
    },

    getRoundData: async (battleId: number): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.BATTLE}::get_round_data`,
                    arguments: [battleId],
                    type_arguments: []
                })
            });
            const result = await response.json();
            return result[0];
        } catch (e) {
            console.error("Failed to fetch round data:", e);
            return null;
        }
    },


    getTrainingInfo: async (address: string): Promise<any> => {
        const functionPath = `${WE3WAR_MODULES.TRAINING}::get_training_info`;
        try {
            console.log("Fetching Training Info from:", functionPath, "for address:", address);
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: functionPath,
                    arguments: [address],
                    type_arguments: []
                })
            });
            const rawResult = await response.json();

            console.log("RAW Training Info Response:", rawResult);
            console.log("rawResult.result:", rawResult.result);
            console.log("Type of rawResult:", typeof rawResult);
            console.log("Is rawResult array:", Array.isArray(rawResult));

            if (rawResult.message && rawResult.message.includes("can't be found")) {
                console.error(`CRITICAL: Training Module NOT FOUND at ${WE3WAR_MODULES.TRAINING}. Please verify deployment.`);
            }

            // Handle both {result: []} and direct array formats
            const result = rawResult.result || rawResult;
            console.log("Extracted result:", result);
            console.log("Is result array:", Array.isArray(result));
            console.log("Result length:", result?.length);

            // Defensive: ensure result is an array and has expected elements
            if (!Array.isArray(result) || result.length < 3) {
                console.warn("Training info format unexpected or missing - using fallback");
                return {
                    qualities: [1, 1, 1, 1],
                    lastTrainTime: 0,
                    totalTrains: 0
                };
            }

            console.log("Training Info Parsed:", {
                qualities: result[0],
                lastTrainTime: parseInt(result[1]),
                totalTrains: parseInt(result[2])
            });

            // Handle different quality array formats
            let qualities: number[];
            const rawQualities = result[0];

            if (typeof rawQualities === 'string' && rawQualities.startsWith('0x')) {
                // Hex string format: '0x01010101' -> [1, 1, 1, 1]
                const hexStr = rawQualities.slice(2); // remove '0x'
                qualities = [];
                for (let i = 0; i < hexStr.length; i += 2) {
                    qualities.push(parseInt(hexStr.slice(i, i + 2), 16));
                }
                console.log("Parsed qualities from hex:", qualities);
            } else if (Array.isArray(rawQualities)) {
                qualities = rawQualities.map((q: any) => parseInt(q));
            } else if (typeof rawQualities === 'object' && rawQualities !== null) {
                qualities = Object.values(rawQualities).map((q: any) => parseInt(q));
            } else {
                qualities = [1, 1, 1, 1];
            }

            return {
                qualities,
                lastTrainTime: parseInt(result[1]),
                totalTrains: parseInt(result[2])
            };
        } catch (e) {
            console.error("Failed to fetch training info:", e);
            return null;
        }
    },

    getTrainingPricing: async (): Promise<any> => {
        const functionPath = `${WE3WAR_MODULES.TRAINING}::get_training_pricing`;
        try {
            console.log("Fetching Training Pricing from:", functionPath);
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: functionPath,
                    arguments: [],
                    type_arguments: []
                })
            });
            const rawResult = await response.json();

            if (rawResult.message && rawResult.message.includes("can't be found")) {
                console.error(`CRITICAL: Training Module NOT FOUND at ${WE3WAR_MODULES.TRAINING}. Please verify deployment.`);
            }

            // Handle both {result: []} and direct array formats
            const result = rawResult.result || rawResult;

            // Defensive: ensure result is an array and has expected elements
            if (!Array.isArray(result) || result.length < 2) {
                console.warn("Training pricing format unexpected, using fallbacks:", rawResult);
                return {
                    upgradeCosts: [250000000000, 500000000000, 1000000000000, 2000000000000],
                    regimenCosts: [19, 89, 179]
                };
            }

            console.log("Training Pricing Parsed:", {
                upgradeCosts: result[0],
                regimenCosts: result[1]
            });

            return {
                upgradeCosts: result[0].map((c: string) => parseInt(c)),
                regimenCosts: result[1].map((c: string) => parseInt(c))
            };
        } catch (e) {
            console.error("Failed to fetch training pricing:", e);
            return null;
        }
    },

    getMarketListingsByCategory: async (category: number): Promise<any[]> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.MARKETPLACE}::get_listings_by_category`,
                    type_arguments: [],
                    arguments: [category]
                })
            });

            const rawResult = await response.json();
            console.log("getMarketListingsByCategory RAW response:", rawResult);

            // Handle both {result: [...]} and direct array formats
            const result = rawResult?.result || rawResult;

            if (result && Array.isArray(result) && result.length > 0) {
                console.log("getMarketListingsByCategory listings:", result[0]);
                return result[0];
            }
            return [];
        } catch (e) {
            console.error("Failed to fetch market listings:", e);
            return [];
        }
    },

    getBattleInfo: async (battleId: number): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.BATTLE}::get_battle_info`,
                    type_arguments: [],
                    arguments: [battleId]
                })
            });
            const result = await response.json();
            if (!result || result.length === 0) return null;
            return {
                regionId: parseInt(result[0]),
                attacker: parseInt(result[1]),
                defender: parseInt(result[2]),
                attackerDamage: result[3],
                defenderDamage: result[4],
                wall: parseInt(result[5]),
                currentRound: parseInt(result[6]),
                attackerPoints: parseInt(result[7]),
                defenderPoints: parseInt(result[8]),
                roundEndTime: parseInt(result[9])
            };
        } catch (e) {
            console.error("Failed to fetch battle info:", e);
            return null;
        }
    },

    getBattleHistory: async (battleId: number): Promise<any[]> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.BATTLE}::get_battle_history`,
                    type_arguments: [],
                    arguments: [battleId]
                })
            });
            const result = await response.json();
            return result[0] || [];
        } catch (e) {
            console.error("Failed to fetch battle history:", e);
            return [];
        }
    },

    // --- Admin Functions ---

    isAdmin: async (addr: string): Promise<boolean> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.ADMIN}::is_admin`,
                    type_arguments: [],
                    arguments: [addr]
                })
            });

            const result = await response.json();
            console.log("Admin check result:", result);

            if (result && Array.isArray(result)) {
                return result[0] === true;
            }
            if (result && result.result && Array.isArray(result.result)) {
                return result.result[0] === true;
            }
            return false;
        } catch (e) {
            console.error("Error checking admin status:", e);
            return false;
        }
    },

    initializeAdminRegistry: async (): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.ADMIN.split('::')[0],
            WE3WAR_MODULES.ADMIN.split('::')[1],
            "initialize_registry",
            [],
            [],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.ADMIN.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    mintCredits: async (target: string, amount: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        // For address type: pass as string directly
        // For u64 type: BCS serialize
        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "mint_credits",
            [],
            [
                target, // address passed as string
                Array.from(BCS.bcsSerializeUint64(BigInt(amount * 100))) // u64 scaled by 100 (2 decimals)
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        console.log("mintCredits Payload:", rawTxPayload);
        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.CITIZEN.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    addEnergy: async (target: string, amount: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "add_energy",
            [],
            [
                target, // address passed as string
                Array.from(BCS.bcsSerializeUint64(BigInt(amount))) // u64
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        console.log("addEnergy Payload:", rawTxPayload);
        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.CITIZEN.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    mintItem: async (target: string, itemId: number, category: number, quality: number, quantity: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.ADMIN.split('::')[0],
            WE3WAR_MODULES.ADMIN.split('::')[1],
            "mint_item",
            [],
            [
                target, // address passed as string
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(category)),
                Array.from(BCS.bcsSerializeU8(quality)),
                Array.from(BCS.bcsSerializeUint64(quantity))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        console.log("mintItem Payload:", rawTxPayload);
        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.ADMIN.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    // --- Governance Functions ---

    getCountryData: async (countryId: number): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.GOVERNANCE}::get_country_data`,
                    type_arguments: [],
                    arguments: [countryId]
                })
            });
            const result = await response.json();
            if (!result || result.length === 0) return null;
            return {
                name: result[0],
                president: result[1],
                incomeTax: parseInt(result[2]),
                importTax: parseInt(result[3]),
                vat: parseInt(result[4]),
                electionActive: result[5]
            };
        } catch (e) {
            console.error("Failed to fetch country data:", e);
            return null;
        }
    },

    getProposals: async (): Promise<any[]> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.GOVERNANCE}::get_proposals`,
                    type_arguments: [],
                    arguments: []
                })
            });
            const result = await response.json();
            return result[0] || [];
        } catch (e) {
            console.error("Failed to fetch proposals:", e);
            return [];
        }
    },

    checkCongressMember: async (addr: string, countryId: number): Promise<boolean> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.GOVERNANCE}::is_congress_member`,
                    type_arguments: [],
                    arguments: [addr, countryId]
                })
            });
            const result = await response.json();
            return result[0] || false;
        } catch (e) {
            console.error("Failed to check congress membership:", e);
            return false;
        }
    },

    getCandidates: async (countryId: number): Promise<any> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.GOVERNANCE}::get_candidates`,
                    type_arguments: [],
                    arguments: [countryId]
                })
            });
            const result = await response.json();
            if (!result || result.length < 2) return { addresses: [], votes: [] };
            return {
                addresses: result[0],
                votes: result[1].map((v: string) => parseInt(v))
            };
        } catch (e) {
            console.error("Failed to fetch candidates:", e);
            return { addresses: [], votes: [] };
        }
    },

    registerCandidate: async (countryId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "register_candidate",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    vote: async (countryId: number, candidateIdx: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "vote",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeUint64(candidateIdx))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    createProposal: async (countryId: number, type: number, dataBytes: number[]): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "create_proposal",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeU8(type)),
                Array.from(BCS.bcsSerializeBytes(new Uint8Array(dataBytes)))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    voteProposal: async (proposalId: number, support: boolean): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "vote_proposal",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(proposalId)),
                Array.from(BCS.bcsSerializeBool(support))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    recoverEnergy: async (itemId: number, quality: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.CITIZEN.split('::')[0],
            WE3WAR_MODULES.CITIZEN.split('::')[1],
            "recover_energy",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(quality))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.CITIZEN.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    // --- Newspaper Functions ---

    createNewspaper: async (name: string): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "create_newspaper",
            [],
            [Array.from(BCS.bcsSerializeStr(name))],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    publishArticle: async (title: string, contentHash: string): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "publish_article",
            [],
            [
                Array.from(BCS.bcsSerializeStr(title)),
                Array.from(BCS.bcsSerializeStr(contentHash))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    endorseArticle: async (newspaperAddr: string, articleId: number): Promise<string> => {
        if (!window.starkey) throw new Error("Wallet not found");
        const provider = window.starkey as any;
        const accounts = await provider.supra.account();
        const sender = accounts[0];
        const chainId = await provider.supra.getChainId();

        const rawTxPayload = [
            sender, 0,
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "endorse_article",
            [],
            [
                newspaperAddr,
                Array.from(BCS.bcsSerializeUint64(articleId))
            ],
            { txExpiryTime: Math.floor(Date.now() / 1000) + 300 }
        ];

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        return await provider.supra.sendTransaction({
            data,
            from: sender,
            to: WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            chainId: (chainId as any).chainId || chainId,
            value: ""
        });
    },

    getAllNewspapers: async (): Promise<string[]> => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.NEWSPAPER}::get_all_newspapers`,
                    arguments: [],
                    type_arguments: []
                })
            });
            const result = await response.json();
            return result[0] || [];
        } catch (e) {
            console.error("Failed to fetch newspapers:", e);
            return [];
        }
    },

    getNewspaperArticles: async (ownerAddr: string) => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${WE3WAR_MODULES.NEWSPAPER}::get_articles`,
                    arguments: [ownerAddr],
                    type_arguments: []
                })
            });
            const result = await response.json();
            return result[0] || [];
        } catch (e) {
            console.error("Failed to fetch articles:", e);
            return [];
        }
    },
};
