import { ReactNode } from 'react';
import Link from 'next/link';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            {/* Absolute Header for transparency effect */}
            <header className="fixed top-0 left-0 right-0 z-50 py-6 px-12 flex justify-between items-center backdrop-blur-sm bg-black/10">
                <Link href="/" className="text-2xl font-bold tracking-widest text-white uppercase">
                    Web3<span className="text-[var(--accent-cyan)]">War</span>
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link href="#" className="text-sm font-medium text-white/80 hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-widest">About</Link>
                    <Link href="#" className="text-sm font-medium text-white/80 hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-widest">Features</Link>
                    <Link href="#" className="text-sm font-medium text-white/80 hover:text-[var(--accent-cyan)] transition-colors uppercase tracking-widest">Roadmap</Link>
                </nav>
                <Link
                    href="/dashboard"
                    className="px-6 py-2 bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--accent-cyan)] hover:text-black transition-all"
                >
                    Play Now
                </Link>
            </header>

            {children}

            <footer className="py-12 bg-black border-t border-white/10 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-white/40 text-sm">© {new Date().getFullYear()} Web3War. On-chain Logic.</p>
                </div>
            </footer>
        </div>
    );
}
