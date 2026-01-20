'use client';

import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/Button';
import { useState, useEffect } from 'react';

export default function IDSNotificationPortal() {
    const { activeNotification, closeNotification } = useGameStore();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (activeNotification?.type === 'prompt') {
            setInputValue(activeNotification.inputValue || '');
        }
    }, [activeNotification]);

    if (!activeNotification) return null;

    const { type, severity, title, message } = activeNotification;

    const icons = {
        info: <Info className="text-cyan-400" size={24} />,
        success: <CheckCircle className="text-emerald-400" size={24} />,
        warning: <AlertTriangle className="text-amber-400" size={24} />,
        error: <XCircle className="text-rose-400" size={24} />,
    };

    const severityColors = {
        info: 'border-cyan-500/30 bg-slate-900/90',
        success: 'border-emerald-500/30 bg-slate-900/90',
        warning: 'border-amber-500/30 bg-slate-900/90',
        error: 'border-rose-500/30 bg-slate-900/90',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`w-full max-w-md rounded-[2rem] border-2 p-8 shadow-2xl relative overflow-hidden ${severityColors[severity]}`}
            >
                {/* Background Accent */}
                <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${severity === 'info' ? 'bg-cyan-500' :
                        severity === 'success' ? 'bg-emerald-500' :
                            severity === 'warning' ? 'bg-amber-500' :
                                'bg-rose-500'
                    }`} />

                <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl bg-slate-950/50 border border-slate-700/50`}>
                        {icons[severity]}
                    </div>
                    <div className="flex-1 space-y-2">
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">{title}</h2>
                        <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{message}</p>
                    </div>
                </div>

                {type === 'prompt' && (
                    <div className="mt-8 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Input Required</label>
                        <input
                            autoFocus
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && closeNotification(inputValue)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
                        />
                    </div>
                )}

                <div className="mt-10 flex gap-3">
                    {type === 'confirm' && (
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-slate-700 text-slate-400 hover:bg-slate-800 font-black uppercase tracking-widest text-[10px]"
                            onClick={() => closeNotification(false)}
                        >
                            Cancel
                        </Button>
                    )}

                    <Button
                        className={`flex-1 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg ${severity === 'info' ? 'bg-cyan-600 hover:bg-cyan-500' :
                                severity === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                                    severity === 'warning' ? 'bg-amber-600 hover:bg-amber-500' :
                                        'bg-rose-600 hover:bg-rose-500'
                            }`}
                        onClick={() => closeNotification(type === 'confirm' ? true : type === 'prompt' ? inputValue : null)}
                    >
                        {type === 'confirm' ? 'Confirm Action' : type === 'prompt' ? 'Submit' : 'Acknowledged'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
