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
    Briefcase
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
                icon={Flag}
                badge={1}
                items={[
                    { label: 'Residence', href: '/profile', icon: UserCircle, description: 'Personal status' },
                    { label: 'Training Center', href: '/training', customIcon: "/icons/Training.webp", description: 'Strength drills', badge: 1, color: 'text-amber-400' },
                    { label: 'Industrial Complex', href: '/industrial', customIcon: "/icons/industrial.webp", description: 'Manufacturing & Workforce' },
                    { label: 'Newspaper', href: '/newspaper', icon: Newspaper, description: 'Media hub' },
                ]}
            />

            {/* 3. Wars Dropdown */}
            <TacticalDropdown
                label="Wars"
                icon={Swords}
                active={pathname === '/battles' || pathname === '/map'}
                items={[
                    { label: 'Battlefields', href: '/battles', icon: Swords, description: 'Active conflicts' },
                    { label: 'World Map', href: '/map', customIcon: "/icons/Worldmap.webp", description: 'Global operations' },
                    { label: 'Military Units', href: '/battles', icon: Briefcase, description: 'Squadron data' },
                ]}
            />

            {/* 4. Marketplace Dropdown */}
            <TacticalDropdown
                label="Marketplace"
                icon={ShoppingBag}
                active={pathname === '/market'}
                items={[
                    { label: 'Market', href: '/market', icon: ShoppingBag, description: 'Buy & Sell items' },
                    { label: 'Inventory', customIcon: "/icons/inventory.webp", href: '/inventory', description: 'Your equipment' },
                    { label: 'Job Market', icon: Users, href: '/companies', description: 'Personnel hiring' },
                ]}
            />

            {/* 5. Community Dropdown */}
            <TacticalDropdown
                label="Community"
                icon={Users}
                active={pathname === '/politics' || pathname === '/profile'}
                items={[
                    { label: 'Politics', href: '/politics', icon: Flag, description: 'National affairs' },
                    { label: 'Profile', href: '/profile', icon: UserCircle, description: 'Public citizen data' },
                    { label: 'Voter Hub', href: '#', icon: FileText, description: 'Active elections' },
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
