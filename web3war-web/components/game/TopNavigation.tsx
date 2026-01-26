'use client';

import Link from 'next/link';
import {
    Flag,
    Home,
    Map,
    ShoppingBag,
    Swords,
    Users,
    Gem,
    Backpack,
    UserCircle,
    FileText,
    Target,
    Building2,
    Factory,
    Newspaper,
    Briefcase,
    Landmark,
    Trophy,
    Vote
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { TacticalDropdown } from './TacticalDropdown';
import { useGameStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

export function TopNavigation() {
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <nav className="flex items-center gap-1 bg-slate-800/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-1.5 overflow-visible">
            {/* 1. Dashboard / Home */}
            <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/dashboard'
                    ? 'bg-slate-700 text-cyan-400 border border-slate-600 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
            >
                <img src="/icons/dashboard.webp" className="w-5 h-5 object-contain" alt="" />
                <span>{t('nav.dashboard')}</span>
            </Link>

            <div className="h-8 w-px bg-slate-700/50 mx-1" />

            {/* 2. My Places Dropdown */}
            <TacticalDropdown
                label={t('nav.my_places')}
                icon={Building2}
                active={pathname === '/training' || pathname === '/industrial' || pathname === '/companies' || pathname === '/newspaper'}
                items={[
                    { label: t('nav.training_grounds'), href: '/training', customIcon: "/icons/Training.webp", description: 'STRENGTH DRILLS', badge: 1, color: 'text-amber-400' },
                    { label: t('nav.industrial_center'), href: '/industrial', customIcon: "/icons/industrial.webp", description: 'RESOURCE PRODUCTION' },
                    { label: t('nav.companies'), href: '/companies', icon: Briefcase, description: 'BUSINESS HUB' },
                    { label: t('nav.newspaper'), href: '/newspaper', icon: Newspaper, description: 'DAILY INTEL' },
                ]}
            />

            {/* 3. Wars Dropdown */}
            <TacticalDropdown
                label={t('nav.wars')}
                icon={Swords}
                active={pathname === '/wars' || pathname === '/map' || pathname === '/rewards'}
                items={[
                    { label: t('nav.wars_campaigns'), href: '/wars', icon: Swords, description: 'ACTIVE FRONTS' },
                    { label: t('nav.world_map'), href: '/map', customIcon: "/icons/Worldmap.webp", description: 'GLOBAL OPERATIONS' },
                    { label: t('nav.reward_center'), href: '/rewards', icon: Trophy, description: 'MILITARY BONUSES' },
                ]}
            />

            {/* 4. Marketplace Dropdown */}
            <TacticalDropdown
                label={t('nav.marketplace')}
                icon={ShoppingBag}
                active={pathname === '/market' || pathname === '/inventory'}
                items={[
                    { label: t('nav.global_market'), href: '/market', icon: ShoppingBag, description: 'TRADE GOODS' },
                    { label: t('nav.my_inventory'), href: '/inventory', customIcon: "/icons/inventory.webp", description: 'YOUR ARSENAL' },
                ]}
            />

            {/* 5. Community Dropdown */}
            <TacticalDropdown
                label={t('nav.community')}
                icon={Users}
                active={pathname === '/politics' || pathname === '/country' || pathname === '/profile' || pathname === '/election-hub'}
                items={[
                    { label: t('nav.national_hub'), href: '/country', icon: Landmark, description: 'NATIONAL AFFAIRS' },
                    { label: t('nav.politics'), href: '/politics', icon: Flag, description: 'GOVERNMENT & VOTING' },
                    { label: t('nav.election_hub'), href: '/election-hub', icon: Vote, description: 'LIVE VOTING & CANDIDACY' },
                    { label: t('nav.citizen_profile'), href: '/profile', icon: UserCircle, description: 'YOUR IDENTITY' },
                ]}
            />


            {/* Premium Button */}
            <Link
                href="#"
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-600/20 text-amber-500 border border-amber-500/50 hover:bg-amber-600/30 transition-all whitespace-nowrap"
            >
                <Gem size={18} />
                <span className="hidden md:inline">{t('nav.premium')}</span>
            </Link>
        </nav>
    );
}
