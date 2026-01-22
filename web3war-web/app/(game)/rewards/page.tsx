'use client';

import { ClaimCenter } from '@/components/game/ClaimCenter';
import { Trophy } from 'lucide-react';

export default function RewardsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    Reward Center
                </h1>
                <p className="text-slate-400 text-sm">Collect your hero rewards and national war spoils</p>
            </div>

            <ClaimCenter />
        </div>
    );
}
