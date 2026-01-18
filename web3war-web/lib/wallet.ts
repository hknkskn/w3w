export interface StarKeyProvider {
    isStarKey: boolean;
    connect: () => Promise<string[]>;
    account: () => Promise<string[]>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: any) => void;
    off: (event: string, callback: any) => void;
    supra?: any; // Add optional property for potential multi-provider structure
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

        // Debugging: Log available providers
        console.log("Window Starkey:", window.starkey);
        if (window.starkey) {
            console.log("Starkey Keys:", Object.keys(window.starkey));
        }

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
