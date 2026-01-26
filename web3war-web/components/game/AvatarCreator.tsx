'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Shield, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadToIPFS } from '@/lib/ipfsService';

interface AvatarCreatorProps {
    onSeedUpdate: (seed: string) => void;
}

export function AvatarCreator({ onSeedUpdate }: AvatarCreatorProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) return;

        // Show local preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to IPFS using Glorpy infrastructure
        setIsUploading(true);
        try {
            const cid = await uploadToIPFS(file);
            console.log("IPFS Identity Locked:", cid);
            onSeedUpdate(cid); // Pass CID instead of base64
        } catch (error) {
            console.error("Uplink Failure:", error);
            // Handle error UI if needed
        } finally {
            setIsUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setPreview(null);
        onSeedUpdate("");
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto p-1">
            {/* Tactical Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-cyan-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Profile Identity</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[8px] font-bold text-cyan-400 uppercase">Secure Uplink</span>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`relative group h-64 w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden bg-slate-950/50 ${isDragging
                    ? 'border-cyan-500 bg-cyan-500/5'
                    : preview
                        ? 'border-slate-700'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
            >
                <AnimatePresence mode="wait">
                    {preview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full h-full flex items-center justify-center p-4"
                        >
                            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:scale-105 transition-transform duration-500">
                                <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">Click to change</span>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                disabled={isUploading}
                                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-90 disabled:opacity-50"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4 cursor-pointer"
                            onClick={handleButtonClick}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all duration-300">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-white uppercase tracking-tight">Select Asset</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Drag & Drop or Click to Browse</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                    accept="image/*"
                    disabled={isUploading}
                />

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-1 bg-repeat-y animate-pulse pointer-events-none opacity-20" />
            </div>

            {/* Technical Footer Info */}
            <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${preview ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                        {preview ? <Check size={16} /> : <ImageIcon size={16} />}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">
                            {preview ? 'Asset Optimized' : 'Waiting for Input'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 leading-tight uppercase">
                            {preview ? 'High-fidelity visual ready for uplink' : 'Standard PNG, JPG or WEBP supported'}
                        </p>
                    </div>
                </div>

                {isUploading ? (
                    <div className="w-full py-3 bg-cyan-600 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Syncing with IPFS...
                    </div>
                ) : (
                    <div className="text-[9px] font-bold text-slate-600 uppercase text-center italic">
                        * Your image will be permanently stored on IPFS & Blockchain
                    </div>
                )}
            </div>
        </div>
    );
}

