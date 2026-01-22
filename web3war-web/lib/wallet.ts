export interface StarKeyProvider {
    isStarKey: boolean;
    connect: () => Promise<string[]>;
    account: () => Promise<string[]>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: any) => void;
    off: (event: string, callback: any) => void;
    supra?: any; // Add optional property for potential multi-provider structure
    getChainId?: () => Promise<{ chainId: string } | string>;
    changeNetwork?: (network: string) => Promise<boolean>;
}

declare global {
    interface Window {
        starkey?: StarKeyProvider;
    }
}

export const WalletService = {
    /**
     * Checks if StarKey wallet is installed
     */
    isInstalled: (): boolean => {
        return typeof window !== 'undefined' && !!window.starkey;
    },

    /**
     * Connects to StarKey wallet
     * Returns the first account address if successful
     */
    connect: async (): Promise<string | null> => {
        if (typeof window === 'undefined') return null;


        const provider = window.starkey?.supra || window.starkey;

        if (!provider) {
            console.error("No provider found");
            throw new Error("StarKey Wallet is not installed");
        }

        try {
            // Check if connect exists
            if (typeof provider.connect !== 'function') {
                console.error("Connect method missing on provider. Available keys:", Object.keys(provider));
                throw new Error("Connect method missing from StarKey provider");
            }

            const accounts = await provider.connect();
            if (accounts && accounts.length > 0) {
                return accounts[0];
            }
            return null;
        } catch (error) {
            console.error("StarKey connection error:", error);
            throw error;
        }
    },

    /**
     * Gets the currently connected account without prompting if already connected
     */
    getAccount: async (): Promise<string | null> => {
        if (!WalletService.isInstalled()) return null;

        try {
            const accounts = await window.starkey!.account();
            if (accounts && accounts.length > 0) {
                return accounts[0];
            }
            return null;
        } catch (error) {
            console.error("StarKey getAccount error:", error);
            return null;
        }
    },

    /**
     * Gets the current chain ID
     */
    getChainId: async (): Promise<string | null> => {
        if (!WalletService.isInstalled()) return null;

        try {
            const provider = window.starkey?.supra || window.starkey;
            if (!provider || typeof provider.getChainId !== 'function') return null;

            const chainIdObject = await provider.getChainId();
            const cid = (chainIdObject as any).chainId || chainIdObject;
            return cid ? cid.toString().trim() : null;
        } catch (error) {
            console.error("StarKey getChainId error:", error);
            return null;
        }
    },

    /**
     * Requests a network switch
     */
    switchNetwork: async (chainId: string): Promise<boolean> => {
        if (!WalletService.isInstalled()) return false;

        try {
            const provider = window.starkey?.supra || window.starkey;
            if (!provider || typeof provider.changeNetwork !== 'function') {
                console.error("changeNetwork method missing on provider");
                return false;
            }


            // Try different formats because StarKey's internal implementation can be finicky with Ethers v6
            try {
                // Try Direct Numeric
                const numericId = parseInt(chainId);
                await provider.changeNetwork(numericId);
                return true;
            } catch (e1: any) {
                try {
                    // Try Direct String
                    await provider.changeNetwork(chainId.toString());
                    return true;
                } catch (e2: any) {
                    // Try Object format (Common in newer EIP-compatible providers)
                    await provider.changeNetwork({ chainId: chainId.toString() });
                    return true;
                }
            }
        } catch (error: any) {
            console.error("StarKey switchNetwork error:", error);
            return false;
        }
    },

    /**
     * Disconnects the wallet
     */
    disconnect: async (): Promise<void> => {
        if (!WalletService.isInstalled()) return;
        try {
            await window.starkey!.disconnect();
        } catch (error) {
            console.error("StarKey disconnect error:", error);
        }
    }
};
