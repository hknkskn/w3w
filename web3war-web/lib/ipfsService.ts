/**
 * IPFS Service for Web3War
 * Blueprint from Glorpy Architecture
 */

const IPFS_GATEWAY = "https://ipfs.glorpy.io/ipfs";
const IPFS_API = "https://ipfs.glorpy.io/api/v0";

/**
 * Uploads a file to the IPFS node on the VPS.
 * @param file The image file to upload
 * @returns The IPFS CID (Hash)
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${IPFS_API}/add`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`IPFS Upload Failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.Hash; // This is the CID (e.g., Qm...)
    } catch (error) {
        console.error("IPFS Service Error:", error);
        throw error;
    }
};

/**
 * Converts a CID or ipfs:// URI to a public gateway URL.
 * @param cidOrUri The CID or ipfs:// string
 * @returns A full HTTP URL
 */
export const getIPFSUrl = (cidOrUri: string | null | undefined): string => {
    if (!cidOrUri) return '/assets/nopp.png'; // Fallback

    // If it's already a full URL, return it
    if (cidOrUri.startsWith('http')) return cidOrUri;

    // Clean the CID (remove ipfs:// prefix if exists)
    const cleanCid = cidOrUri.replace('ipfs://', '');

    return `${IPFS_GATEWAY}/${cleanCid}`;
};
