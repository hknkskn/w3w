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
    Trophy
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { TacticalDropdown } from './TacticalDropdown';
import { useGameStore } from '@/lib/store';

export function TopNavigation() {
    const pathname = usePathname();

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
                <span>Dashboard</span>
            </Link>

            <div className="h-8 w-px bg-slate-700/50 mx-1" />

            {/* 2. My Places Dropdown */}
            <TacticalDropdown
                label="My Places"
                icon={Building2}
                active={pathname === '/training' || pathname === '/industrial' || pathname === '/companies' || pathname === '/newspaper'}
                items={[
                    { label: 'Training Grounds', href: '/training', customIcon: "/icons/Training.webp", description: 'STRENGTH DRILLS', badge: 1, color: 'text-amber-400' },
                    { label: 'Industrial Center', href: '/industrial', customIcon: "/icons/industrial.webp", description: 'RESOURCE PRODUCTION' },
                    { label: 'Companies', href: '/companies', icon: Briefcase, description: 'BUSINESS HUB' },
                    { label: 'Newspaper', href: '/newspaper', icon: Newspaper, description: 'DAILY INTEL' },
                ]}
            />

            {/* 3. Wars Dropdown */}
            <TacticalDropdown
                label="Wars"
                icon={Swords}
                active={pathname === '/wars' || pathname === '/map' || pathname === '/rewards'}
                items={[
                    { label: 'Wars & Campaigns', href: '/wars', icon: Swords, description: 'ACTIVE FRONTS' },
                    { label: 'World Map', href: '/map', customIcon: "/icons/Worldmap.webp", description: 'GLOBAL OPERATIONS' },
                    { label: 'Reward Center', href: '/rewards', icon: Trophy, description: 'MILITARY BONUSES' },
                ]}
            />

            {/* 4. Marketplace Dropdown */}
            <TacticalDropdown
                label="Marketplace"
                icon={ShoppingBag}
                active={pathname === '/market' || pathname === '/inventory'}
                items={[
                    { label: 'Global Market', href: '/market', icon: ShoppingBag, description: 'TRADE GOODS' },
                    { label: 'My Inventory', href: '/inventory', customIcon: "/icons/inventory.webp", description: 'YOUR ARSENAL' },
                ]}
            />

            {/* 5. Community Dropdown */}
            <TacticalDropdown
                label="Community"
                icon={Users}
                active={pathname === '/politics' || pathname === '/country' || pathname === '/profile'}
                items={[
                    { label: 'National Hub', href: '/country', icon: Landmark, description: 'NATIONAL AFFAIRS' },
                    { label: 'Politics', href: '/politics', icon: Flag, description: 'GOVERNMENT & VOTING' },
                    { label: 'Citizen Profile', href: '/profile', icon: UserCircle, description: 'YOUR IDENTITY' },
                ]}
            />


            {/* Premium Button */}
            <Link
                href="#"
                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-600/20 text-amber-500 border border-amber-500/50 hover:bg-amber-600/30 transition-all whitespace-nowrap"
            >
                <Gem size={18} />
                <span className="hidden md:inline">Premium</span>
            </Link>
        </nav>
    );
}
