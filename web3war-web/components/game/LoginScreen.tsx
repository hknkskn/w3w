'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';
import { Shield, Wallet, MapPin, User, ChevronRight, Download, RefreshCw, ArrowRight, Coins } from 'lucide-react';
import { WalletService } from '@/lib/wallet';

const COUNTRIES: { id: CountryId; name: string }[] = [
    { id: 'NG', name: 'Nigeria' },
    { id: 'UA', name: 'Ukraine' },
    { id: 'RU', name: 'Russia' },
    { id: 'US', name: 'United States' },
    { id: 'TR', name: 'Turkey' },
    { id: 'IN', name: 'India' },
    { id: 'ES', name: 'Spain' },
    { id: 'PL', name: 'Poland' },
    { id: 'BR', name: 'Brazil' },
    { id: 'FR', name: 'France' },
];

export default function LoginScreen() {
    const login = useGameStore(state => state.login);

    // UI State
    const [step, setStep] = useState<'CONNECT' | 'REGISTER' | 'SYNC'>('CONNECT');
    const [username, setUsername] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<CountryId>('TR');

    // Wallet State
    const [isWalletInstalled, setIsWalletInstalled] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        // Initial check
        if (WalletService.isInstalled()) {
            setIsWalletInstalled(true);
        }

        // Poll for 5 seconds to detect late injection
        const interval = setInterval(() => {
            if (WalletService.isInstalled()) {
                setIsWalletInstalled(true);
                clearInterval(interval);
            }
        }, 500); // Check every 500ms

        return () => clearInterval(interval);
    }, []);

    // Country String to ID Mapping (Must match contract/logic)
    const COUNTRY_IDS: Record<CountryId, number> = {
        'NG': 1, 'UA': 2, 'RU': 3, 'US': 4, 'TR': 5,
        'IN': 6, 'ES': 7, 'PL': 8, 'BR': 9, 'FR': 10
    };

    const handleConnect = async () => {
        if (!isWalletInstalled) {
            window.open('https://starkey.app/', '_blank');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const address = await WalletService.connect();
            if (!address) {
                setError('Failed to get account address.');
                setIsConnecting(false);
                return;
            }

            setWalletAddress(address);

            // Check Registration
            const { ContractService } = await import('@/lib/contract-service');
            let isRegistered = await ContractService.checkRegistration(address);

            if (isRegistered) {
                const profile = await ContractService.getProfile(address);
                const hasCoin = await ContractService.hasCoinRegister(address);

                if (!hasCoin) {
                    setStep('SYNC');
                    setIsConnecting(false);
                } else if (profile) {
                    login(profile.username, selectedCountry, address);
                } else {
                    login("Unknown Soldier", 'TR', address);
                }
            } else {
                setStep('REGISTER');
                setIsConnecting(false);
            }

        } catch (err: any) {
            console.error(err);
            if (err.code === 4001) {
                setError('Connection rejected by user.');
            } else {
                setError('Failed to connect or interact with wallet.');
            }
            setIsConnecting(false);
        }
    };

    const handleRegister = async () => {
        if (!username.trim() || !walletAddress) return;

        setIsConnecting(true);
        setError(null);

        try {
            const { ContractService } = await import('@/lib/contract-service');
            const countryCode = COUNTRY_IDS[selectedCountry] || 1;

            setError('Sending registration transaction...');
            const txHash = await ContractService.registerCitizen(username, countryCode);
            console.log("Registration TX:", txHash);

            setError('Waiting for network confirmation...');
            await new Promise(r => setTimeout(r, 4000));

            // Check if coin needs registration
            const hasCoin = await ContractService.hasCoinRegister(walletAddress);
            if (!hasCoin) {
                setStep('SYNC');
                setIsConnecting(false);
            } else {
                login(username, selectedCountry, walletAddress);
            }

        } catch (txError: any) {
            console.error("Registration failed:", txError);
            setError(`Registration failed: ${txError?.message || 'Check wallet/network'}`);
            setIsConnecting(false);
        }
    };

    const handleSyncCoin = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const { ContractService } = await import('@/lib/contract-service');
            setError('Sending coin registration transaction...');
            await ContractService.registerCoin();

            setError('Transaction sent. Monitoring network (Max 10m)...');

            // Smart Polling: Check every 5 seconds for up to 10 minutes (120 attempts)
            let attempts = 0;
            const maxAttempts = 120; // 10 minutes

            const pollInterval = setInterval(async () => {
                attempts++;
                try {
                    const hasCoin = await ContractService.hasCoinRegister(walletAddress!);
                    if (hasCoin) {
                        clearInterval(pollInterval);
                        const profile = await ContractService.getProfile(walletAddress!);
                        login(profile?.username || username || "Soldier", selectedCountry, walletAddress!);
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        setError('Sync timed out after 10 minutes. Please try "Check Status".');
                        setIsConnecting(false);
                    }
                } catch (e) {
                    console.warn("Polling error:", e);
                }
            }, 5000);

        } catch (e: any) {
            console.error("Coin sync failed:", e);
            if (e?.message?.includes('SEQUENCE_NUMBER_TOO_OLD')) {
                setError('Sequence Number error. Your previous transaction might still be pending. Please wait a moment and click "Check Status".');
            } else {
                setError('Sync failed. If you already approved in your wallet, try "Check Status".');
            }
            setIsConnecting(false);
        }
    };

    const handleCheckSync = async () => {
        setIsConnecting(true);
        try {
            const { ContractService } = await import('@/lib/contract-service');
            const hasCoin = await ContractService.hasCoinRegister(walletAddress!);
            if (hasCoin) {
                const profile = await ContractService.getProfile(walletAddress!);
                login(profile?.username || username || "Soldier", selectedCountry, walletAddress!);
            } else {
                setError('Still not registered on-chain. Please wait or try again.');
            }
        } catch (e) {
            setError('Failed to verify status.');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/image/registerbg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            </div>

            <div className="relative w-full max-w-md p-8">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl">
                        <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        WEB3<span className="text-cyan-400">WAR</span>
                    </h1>
                    <p className="text-slate-400">Join the decentralized battlefield.</p>
                </div>

                {/* Main Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl transition-all">

                    {step === 'CONNECT' ? (
                        <div className="space-y-6 text-center">
                            <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 mb-6">
                                <p className="text-sm text-cyan-200">
                                    Connect your wallet to enter the war zone.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className={`w-full text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${isWalletInstalled
                                    ? 'bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20'
                                    : 'bg-amber-600 hover:bg-amber-500'
                                    }`}
                            >
                                {isConnecting ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        <span>Connecting...</span>
                                    </>
                                ) : isWalletInstalled ? (
                                    <>
                                        <Wallet size={20} />
                                        <span>Connect StarKey Wallet</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        <span>Install StarKey Wallet</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : step === 'REGISTER' ? (
                        <div className="space-y-5">
                            <div className="text-center mb-4">
                                <h3 className="text-lg font-bold text-white">Create Your Identity</h3>
                                <p className="text-xs text-slate-400">New wallet detected. Register to proceed.</p>
                            </div>

                            {/* Username Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Callsign</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Country Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wider">Citizenship</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COUNTRIES.map((country) => (
                                        <button
                                            key={country.id}
                                            onClick={() => setSelectedCountry(country.id)}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${selectedCountry === country.id
                                                ? 'bg-cyan-600/20 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)] text-white'
                                                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="w-6 h-4 flex-shrink-0 overflow-hidden rounded-sm shadow-sm border border-white/5">
                                                <img
                                                    src={COUNTRY_CONFIG[country.id].flag}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            </div>
                                            <span className="text-xs font-bold truncate pr-1">{country.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                onClick={handleRegister}
                                disabled={!username || isConnecting}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                            >
                                {isConnecting ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield size={18} />
                                        <span>Confirm Registration</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setStep('CONNECT')}
                                className="w-full text-xs text-slate-500 hover:text-white mt-2"
                            >
                                Cancel & Return
                            </button>
                        </div>
                    ) : (
                        /* SYNC STEP - Gamified */
                        <div className="space-y-6 text-center">
                            <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/20 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                                <Wallet className="w-10 h-10 text-amber-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Tactical Wallet Sync</h3>
                                <p className="text-sm text-slate-400">
                                    Your military identity is ready. Now, authorize your tactical wallet to receive combat pay (CRED) and access the national bank.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl space-y-3">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Shield size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                                        <p className="text-xs text-emerald-400 font-bold">Identity Verified</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-left opacity-50">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                                        <Coins size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">National Bank</p>
                                        <p className="text-xs text-amber-500 font-bold italic">Connection Required</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleSyncCoin}
                                    disabled={isConnecting}
                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-3 group"
                                >
                                    {isConnecting ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span>Authorize Tactical Wallet</span>
                                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCheckSync}
                                        disabled={isConnecting}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl border border-slate-700 transition-all"
                                    >
                                        Check Status
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("If you're already registered, you can proceed. If not, game features may fail. Proceed?")) {
                                                login(username || "Soldier", selectedCountry, walletAddress!);
                                            }
                                        }}
                                        className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-slate-500 text-[10px] font-bold py-3 rounded-xl border border-slate-700/50 transition-all"
                                    >
                                        Skip & Enter
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-500 font-medium italic">
                                * This one-time authorization is required by the Supra Network Protocol. If you already registered, use "Check Status".
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-slate-500">
                        {isWalletInstalled ? "Supra Network Testnet" : "StarKey wallet required for Web3 access"}
                    </p>
                </div>
            </div>
        </div>
    );
}
