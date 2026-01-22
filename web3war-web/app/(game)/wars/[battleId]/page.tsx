import { BattleDetailClient } from '@/components/game/wars/BattleDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    // For static export, we generate a few default/placeholder paths
    // In production, these would be fetched from the contract or a list
    return [{ battleId: '1' }, { battleId: 'training' }];
}

export default function BattleDetailPage() {
    return <BattleDetailClient />;
}
