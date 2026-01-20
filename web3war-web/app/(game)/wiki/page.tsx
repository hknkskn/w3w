'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Factory, ShoppingCart, Swords, Building2, Map, Backpack, User, Search, BookOpen } from 'lucide-react';

// ============================================
// WIKI DATA
// ============================================

const WIKI_SECTIONS = [
    {
        id: 'citizen',
        title: 'Citizen Basics',
        icon: User,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">Every player starts as a citizen in one of the available countries. Your citizen has core stats that determine your capabilities in the game.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Core Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Level" desc="Increases with XP. Each level grants +100 max health." />
                    <StatCard title="Energy" desc="Required for training and working. Regenerates over time or via Food." />
                    <StatCard title="Strength" desc="Increases damage in battles. Gained through training." />
                    <StatCard title="Influence" desc="Political power. Higher influence = more impact in votes." />
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">Experience & Leveling</h4>
                <WikiTable
                    headers={['Level', 'XP Required', 'Max Health']}
                    rows={[
                        ['1', '0', '100'],
                        ['2', '50', '200'],
                        ['3', '150', '300'],
                        ['4', '300', '400'],
                        ['5', '500', '500'],
                    ]}
                />
            </div>
        )
    },
    {
        id: 'training',
        title: 'Training Facilities',
        icon: Dumbbell,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">Training is how you increase your Strength stat. Each facility has different costs and strength gains. Upgrade facilities to maximize efficiency.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Training Regimens</h4>
                <WikiTable
                    headers={['Regimen', 'STR Formula', 'Energy', 'CRED Cost']}
                    rows={[
                        ['⛺ Basic Training', 'Quality × 5', '5 + Level', 'FREE'],
                        ['🏫 Military Academy', 'Quality × 2', '1', '0.19'],
                        ['🏰 Special Forces', 'Quality × 5', '1', '0.89'],
                        ['💎 Top Secret Program', 'Quality × 10', '1', '1.79'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">Strength Gains by Quality</h4>
                <WikiTable
                    headers={['Regimen', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']}
                    rows={[
                        ['Basic Training', '+5', '+10', '+15', '+20', '+25'],
                        ['Military Academy', '+2', '+4', '+6', '+8', '+10'],
                        ['Special Forces', '+5', '+10', '+15', '+20', '+25'],
                        ['Top Secret', '+10', '+20', '+30', '+40', '+50'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">Upgrade Costs (SUPRA)</h4>
                <WikiTable
                    headers={['Upgrade', 'Cost']}
                    rows={[
                        ['Q1 → Q2', '2,500 SUPRA'],
                        ['Q2 → Q3', '5,000 SUPRA'],
                        ['Q3 → Q4', '10,000 SUPRA'],
                        ['Q4 → Q5', '20,000 SUPRA'],
                    ]}
                />
                <p className="text-slate-500 text-sm">💡 Tip: Upgrading a facility increases STR gain for ALL future training sessions!</p>
            </div>
        )
    },
    {
        id: 'economy',
        title: 'Economy & Industry',
        icon: Factory,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">The economy is driven by companies that produce goods. Workers earn wages, owners earn profits from production.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Raw Materials (Category 3)</h4>
                <WikiTable
                    headers={['ID', 'Item', 'Usage']}
                    rows={[
                        ['101', '🌾 Grain', 'Food production'],
                        ['102', '⚒️ Iron', 'Weapon manufacturing'],
                        ['103', '🛢️ Oil', 'Transport & Energy'],
                        ['104', '💎 Aluminum', 'Missile production'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">Finished Products</h4>
                <WikiTable
                    headers={['ID', 'Item', 'Category', 'Effect']}
                    rows={[
                        ['201', '🍞 Food', '1', 'Restores Energy (Q × 20)'],
                        ['202', '⚔️ Weapon', '2', 'Increases battle damage'],
                        ['203', '🎫 Ticket', '4', 'Required for travel'],
                        ['204', '🚀 Missile', '2', 'High-impact tactical weapon'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">Company Types</h4>
                <div className="grid grid-cols-2 gap-2">
                    <StatCard title="Food Company" desc="Converts Grain into Food products" />
                    <StatCard title="Weapon Factory" desc="Converts Iron into Weapons" />
                    <StatCard title="Raw Extractor" desc="Produces raw materials" />
                    <StatCard title="Housing" desc="Provides citizen housing" />
                </div>
            </div>
        )
    },
    {
        id: 'market',
        title: 'Marketplace',
        icon: ShoppingCart,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">The marketplace allows citizens to buy and sell items using CRED currency.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Trading Mechanics</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li><span className="text-amber-400">Sell:</span> List items from your inventory at a price per unit</li>
                    <li><span className="text-emerald-400">Buy:</span> Purchase listed items instantly</li>
                    <li><span className="text-red-400">Cancel:</span> Remove your listing (items returned)</li>
                </ul>

                <h4 className="text-cyan-400 font-bold mt-4">Currency</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <img src="/icons/money.png" className="w-8 h-8" alt="CRED" />
                        <div>
                            <div className="text-white font-bold">CRED</div>
                            <div className="text-slate-400 text-sm">In-game currency with 2 decimal places</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'battles',
        title: 'Battles & Wars',
        icon: Swords,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">Wars are the core conflict mechanic. Fight for your country to gain territory and resources.</p>

                <h4 className="text-cyan-400 font-bold mt-4">War Types</h4>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-red-500/30">
                        <div className="text-red-400 font-bold">⚔️ Direct War</div>
                        <div className="text-slate-400 text-sm">Country declares war on another for territory</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-amber-500/30">
                        <div className="text-amber-400 font-bold">🔥 Resistance War</div>
                        <div className="text-slate-400 text-sm">Occupied citizens fight to liberate their homeland</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-cyan-500/30">
                        <div className="text-cyan-400 font-bold">🤝 MPP (Mutual Protection Pact)</div>
                        <div className="text-slate-400 text-sm">Allied countries can join each other's battles</div>
                    </div>
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">Battle Formula</h4>
                <div className="bg-slate-900 p-4 rounded-lg border border-cyan-500/30 font-mono text-center">
                    <span className="text-cyan-400">Damage</span> = <span className="text-emerald-400">Influence</span> × <span className="text-amber-400">Weapon Quality</span> × <span className="text-pink-400">Strength</span>
                </div>
            </div>
        )
    },
    {
        id: 'politics',
        title: 'Politics & Governance',
        icon: Building2,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">Each country has a government structure with elections, congress, and policy making.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Government Structure</h4>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard title="🏛️ President" desc="Elected leader, can declare wars and sign treaties" />
                    <StatCard title="📜 Congress" desc="Elected representatives who vote on laws" />
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">Proposal Types</h4>
                <WikiTable
                    headers={['Type', 'Description']}
                    rows={[
                        ['Tax Rate', 'Adjust income and import taxes'],
                        ['Minimum Wage', 'Set minimum salary for workers'],
                        ['MPP', 'Propose alliance with another country'],
                        ['War Declaration', 'Vote to declare war'],
                    ]}
                />
            </div>
        )
    },
    {
        id: 'map',
        title: 'World Map & Regions',
        icon: Map,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">The world is divided into countries and regions. Each region has unique resources and strategic value.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Available Countries</h4>
                <div className="grid grid-cols-3 gap-2">
                    {['🇳🇬 Nigeria', '🇺🇦 Ukraine', '🇹🇷 Turkey', '🇺🇸 USA', '🇬🇧 UK', '🇩🇪 Germany'].map(c => (
                        <div key={c} className="bg-slate-800/50 p-2 rounded text-center text-slate-300 text-sm">{c}</div>
                    ))}
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">Region Bonuses</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Coastal regions: Trade bonuses</li>
                    <li>Mountain regions: Defense bonuses</li>
                    <li>Resource regions: Production bonuses</li>
                </ul>
            </div>
        )
    },
    {
        id: 'inventory',
        title: 'Inventory & Items',
        icon: Backpack,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">Your inventory stores all items you own. Items have different categories and quality levels.</p>

                <h4 className="text-cyan-400 font-bold mt-4">Quality Tiers</h4>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(q => (
                        <div key={q} className="flex-1 bg-slate-800/50 p-2 rounded text-center">
                            <div className="text-amber-400 font-bold">Q{q}</div>
                            <div className="text-slate-500 text-xs">{q * 20}% efficiency</div>
                        </div>
                    ))}
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">Item Effects</h4>
                <WikiTable
                    headers={['Item', 'Q1 Effect', 'Q5 Effect']}
                    rows={[
                        ['🍞 Food', '+20 Energy', '+100 Energy'],
                        ['⚔️ Weapon', '1x Damage', '5x Damage'],
                        ['🚀 Missile', 'Tactical Strike', 'Devastating Strike'],
                    ]}
                />
            </div>
        )
    },
];

// ============================================
// COMPONENTS
// ============================================

function WikiSection({ section, isOpen, onToggle }: {
    section: typeof WIKI_SECTIONS[0],
    isOpen: boolean,
    onToggle: () => void
}) {
    const Icon = section.icon;
    return (
        <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/50 transition-colors"
            >
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Icon size={20} className="text-cyan-400" />
                </div>
                <span className="flex-1 font-bold text-white text-lg">{section.title}</span>
                {isOpen ? (
                    <ChevronDown size={20} className="text-slate-500" />
                ) : (
                    <ChevronRight size={20} className="text-slate-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-6 pt-0 border-t border-slate-700/50">
                    {section.content}
                </div>
            )}
        </div>
    );
}

function WikiTable({ headers, rows }: { headers: string[], rows: string[][] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-700">
                        {headers.map((h, i) => (
                            <th key={i} className="text-left p-2 text-cyan-400 font-bold">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                            {row.map((cell, j) => (
                                <td key={j} className="p-2 text-slate-300">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="text-amber-400 font-bold text-sm">{title}</div>
            <div className="text-slate-400 text-xs mt-1">{desc}</div>
        </div>
    );
}

// ============================================
// MAIN PAGE
// ============================================

export default function WikiPage() {
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['training']));
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const filteredSections = WIKI_SECTIONS.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen size={32} className="text-cyan-400" />
                    <h1 className="text-3xl font-black text-white">
                        GAME <span className="text-cyan-400">WIKI</span>
                    </h1>
                </div>
                <p className="text-slate-400">Everything you need to know about Web3War mechanics, values, and strategies.</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
            </div>

            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
                {WIKI_SECTIONS.map(s => {
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.id}
                            onClick={() => {
                                setOpenSections(new Set([s.id]));
                                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors text-sm"
                        >
                            <Icon size={14} />
                            {s.title}
                        </button>
                    );
                })}
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {filteredSections.map(section => (
                    <div key={section.id} id={section.id}>
                        <WikiSection
                            section={section}
                            isOpen={openSections.has(section.id)}
                            onToggle={() => toggleSection(section.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-slate-500 text-sm">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p className="mt-1">Values are based on current contract configuration</p>
            </div>
        </div>
    );
}
