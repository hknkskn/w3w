'use client';

import { ClaimCenter } from '@/components/game/ClaimCenter';
import { Trophy } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function RewardsPage() {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    {t('rewards.title')}
                </h1>
                <p className="text-slate-400 text-sm">{t('rewards.subtitle')}</p>
            </div>

            <ClaimCenter />
        </div>
    );
}
