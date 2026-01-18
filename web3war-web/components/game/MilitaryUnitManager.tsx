"use client";

import { useGameStore } from "@/lib/store";
import { useState } from "react";
import { Shield, Sword, Trophy, Users, Crosshair } from "lucide-react";
import { motion } from "framer-motion";

export default function MilitaryUnitManager() {
    const { user, createMilitaryUnit, joinMilitaryUnit, setDailyOrder } = useGameStore();
    const [name, setName] = useState("");
    const [joinId, setJoinId] = useState("");
    const [doRegion, setDoRegion] = useState("");

    if (!user) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Military Unit
            </h2>

            {!user.militaryUnitId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Section */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/20">
                        <h3 className="text-lg font-semibold mb-4">Start a New Unit</h3>
                        <p className="text-sm text-slate-400 mb-4">Lead your own elite squad. Cost: {user.isAdmin ? <span className="text-cyan-400 font-bold uppercase animate-pulse">FREE (ADMIN)</span> : '1000 CRED'}</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Unit Name"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => createMilitaryUnit(name)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>

                    {/* Join Section */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-lg font-semibold mb-4">Join an Existing Unit</h3>
                        <p className="text-sm text-slate-400 mb-4">Enter a Unit ID to join a squad.</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                placeholder="Unit ID"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => joinMilitaryUnit(Number(joinId))}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/30">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Your Unit</span>
                            <h3 className="text-xl font-bold">Elite Squad #{user.militaryUnitId}</h3>
                        </div>
                        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                            +10% INFLUENCE BONUS
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Status</h4>
                            <p className="font-bold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-400" /> Active
                            </p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Daily Order</h4>
                            <p className="font-bold flex items-center gap-2 text-orange-400">
                                <Crosshair className="w-4 h-4" /> Region #42
                            </p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="text-xs text-slate-500 uppercase mb-1">Rewards</h4>
                            <p className="font-bold">25 XP Bonus</p>
                        </div>
                    </div>

                    {/* Leader Controls - Mocked check for leader */}
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold mb-4 text-slate-300">Leader Controls</h4>
                        <div className="flex gap-2 max-w-sm">
                            <input
                                type="number"
                                value={doRegion}
                                onChange={(e) => setDoRegion(e.target.value)}
                                placeholder="Target Region ID"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => setDailyOrder(Number(doRegion))}
                                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Set Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
