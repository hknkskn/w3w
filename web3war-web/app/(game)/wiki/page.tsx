'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Dumbbell, Factory, ShoppingCart, Swords, Building2, Map, Backpack, User, Search, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// ============================================
// WIKI DATA
// ============================================

const getWikiSections = (t: any) => [
    {
        id: 'citizen',
        title: t('wiki.sections.citizen.title'),
        icon: User,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.citizen.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.citizen.core_stats')}</h4>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title={t('wiki.sections.citizen.stats.level.title')} desc={t('wiki.sections.citizen.stats.level.desc')} />
                    <StatCard title={t('wiki.sections.citizen.stats.energy.title')} desc={t('wiki.sections.citizen.stats.energy.desc')} />
                    <StatCard title={t('wiki.sections.citizen.stats.strength.title')} desc={t('wiki.sections.citizen.stats.strength.desc')} />
                    <StatCard title={t('wiki.sections.citizen.stats.influence.title')} desc={t('wiki.sections.citizen.stats.influence.desc')} />
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.citizen.exp_leveling')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.citizen.table.level'), t('wiki.sections.citizen.table.xp_required'), t('wiki.sections.citizen.table.max_health')]}
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
        title: t('wiki.sections.training.title'),
        icon: Dumbbell,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.training.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.training.regimens')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.training.table.regimen'), t('wiki.sections.training.table.formula'), t('wiki.sections.training.table.energy'), t('wiki.sections.training.table.cost')]}
                    rows={[
                        [`⛺ ${t('wiki.sections.training.table.basic')}`, 'Quality × 5', '5 + Level', 'FREE'],
                        [`🏫 ${t('wiki.sections.training.table.academy')}`, 'Quality × 2', '1', '0.19'],
                        [`🏰 ${t('wiki.sections.training.table.special')}`, 'Quality × 5', '1', '0.89'],
                        [`💎 ${t('wiki.sections.training.table.secret')}`, 'Quality × 10', '1', '1.79'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.training.gains_by_quality')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.training.table.regimen'), 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']}
                    rows={[
                        [t('wiki.sections.training.table.basic'), '+5', '+10', '+15', '+20', '+25'],
                        [t('wiki.sections.training.table.academy'), '+2', '+4', '+6', '+8', '+10'],
                        [t('wiki.sections.training.table.special'), '+5', '+10', '+15', '+20', '+25'],
                        [t('wiki.sections.training.table.secret'), '+10', '+20', '+30', '+40', '+50'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.training.upgrade_costs')}</h4>
                <WikiTable
                    headers={['Upgrade', 'Cost']}
                    rows={[
                        ['Q1 → Q2', '2,500 SUPRA'],
                        ['Q2 → Q3', '5,000 SUPRA'],
                        ['Q3 → Q4', '10,000 SUPRA'],
                        ['Q4 → Q5', '20,000 SUPRA'],
                    ]}
                />
                <p className="text-slate-500 text-sm">💡 {t('wiki.sections.training.tip')}</p>
            </div>
        )
    },
    {
        id: 'economy',
        title: t('wiki.sections.economy.title'),
        icon: Factory,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.economy.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.economy.raw_materials')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.economy.table.id'), t('wiki.sections.economy.table.item'), t('wiki.sections.economy.table.usage')]}
                    rows={[
                        ['101', `🌾 ${t('wiki.sections.economy.table.grain')}`, 'Food production'],
                        ['102', `⚒️ ${t('wiki.sections.economy.table.iron')}`, 'Weapon manufacturing'],
                        ['103', `🛢️ ${t('wiki.sections.economy.table.oil')}`, 'Transport & Energy'],
                        ['104', `💎 ${t('wiki.sections.economy.table.aluminum')}`, 'Missile production'],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.economy.finished_products')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.economy.table.id'), t('wiki.sections.economy.table.item'), 'Category', t('wiki.sections.economy.product_table.effect')]}
                    rows={[
                        ['201', `🍞 ${t('wiki.sections.economy.product_table.food')}`, '1', t('wiki.sections.economy.product_table.food_desc')],
                        ['202', `⚔️ ${t('wiki.sections.economy.product_table.weapon')}`, '2', t('wiki.sections.economy.product_table.weapon_desc')],
                        ['203', `🎫 ${t('wiki.sections.economy.product_table.ticket')}`, '4', t('wiki.sections.economy.product_table.ticket_desc')],
                        ['204', `🚀 ${t('wiki.sections.economy.product_table.missile')}`, '2', t('wiki.sections.economy.product_table.missile_desc')],
                    ]}
                />

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.economy.company_types')}</h4>
                <div className="grid grid-cols-2 gap-2">
                    <StatCard title={t('wiki.sections.economy.companies.food.title')} desc={t('wiki.sections.economy.companies.food.desc')} />
                    <StatCard title={t('wiki.sections.economy.companies.weapon.title')} desc={t('wiki.sections.economy.companies.weapon.desc')} />
                    <StatCard title={t('wiki.sections.economy.companies.raw.title')} desc={t('wiki.sections.economy.companies.raw.desc')} />
                    <StatCard title={t('wiki.sections.economy.companies.housing.title')} desc={t('wiki.sections.economy.companies.housing.desc')} />
                </div>
            </div>
        )
    },
    {
        id: 'market',
        title: t('wiki.sections.market.title'),
        icon: ShoppingCart,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.market.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.market.mechanics')}</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                    <li><span className="text-amber-400">{t('wiki.sections.market.items.sell.title')}</span> {t('wiki.sections.market.items.sell.desc')}</li>
                    <li><span className="text-emerald-400">{t('wiki.sections.market.items.buy.title')}</span> {t('wiki.sections.market.items.buy.desc')}</li>
                    <li><span className="text-red-400">{t('wiki.sections.market.items.cancel.title')}</span> {t('wiki.sections.market.items.cancel.desc')}</li>
                </ul>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.market.currency')}</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <img src="/icons/money.png" className="w-8 h-8" alt="CRED" />
                        <div>
                            <div className="text-white font-bold">CRED</div>
                            <div className="text-slate-400 text-sm">{t('wiki.sections.market.cred_desc')}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'battles',
        title: t('wiki.sections.battles.title'),
        icon: Swords,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.battles.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.battles.war_types')}</h4>
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-red-500/30">
                        <div className="text-red-400 font-bold">⚔️ {t('wiki.sections.battles.types.direct.title')}</div>
                        <div className="text-slate-400 text-sm">{t('wiki.sections.battles.types.direct.desc')}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-amber-500/30">
                        <div className="text-amber-400 font-bold">🔥 {t('wiki.sections.battles.types.resistance.title')}</div>
                        <div className="text-slate-400 text-sm">{t('wiki.sections.battles.types.resistance.desc')}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-cyan-500/30">
                        <div className="text-cyan-400 font-bold">🤝 {t('wiki.sections.battles.types.mpp.title')}</div>
                        <div className="text-slate-400 text-sm">{t('wiki.sections.battles.types.mpp.desc')}</div>
                    </div>
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.battles.formula')}</h4>
                <div className="bg-slate-900 p-4 rounded-lg border border-cyan-500/30 font-mono text-center text-xs">
                    <span className="text-cyan-400">{t('wiki.sections.battles.damage')}</span> = <span className="text-emerald-400">{t('wiki.sections.battles.influence')}</span> × <span className="text-amber-400">{t('wiki.sections.battles.weapon_quality')}</span> × <span className="text-pink-400">{t('wiki.sections.battles.strength')}</span>
                </div>
            </div>
        )
    },
    {
        id: 'politics',
        title: t('wiki.sections.politics.title'),
        icon: Building2,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.politics.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.politics.structure')}</h4>
                <div className="grid grid-cols-2 gap-3">
                    <StatCard title={`🏛️ ${t('wiki.sections.politics.roles.president.title')}`} desc={t('wiki.sections.politics.roles.president.desc')} />
                    <StatCard title={`📜 ${t('wiki.sections.politics.roles.congress.title')}`} desc={t('wiki.sections.politics.roles.congress.desc')} />
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.politics.proposal_types')}</h4>
                <WikiTable
                    headers={['Type', 'Description']}
                    rows={[
                        [t('wiki.sections.politics.proposals.tax.title'), t('wiki.sections.politics.proposals.tax.desc')],
                        [t('wiki.sections.politics.proposals.wage.title'), t('wiki.sections.politics.proposals.wage.desc')],
                        [t('wiki.sections.politics.proposals.mpp.title'), t('wiki.sections.politics.proposals.mpp.desc')],
                        [t('wiki.sections.politics.proposals.war.title'), t('wiki.sections.politics.proposals.war.desc')],
                    ]}
                />
            </div>
        )
    },
    {
        id: 'map',
        title: t('wiki.sections.map.title'),
        icon: Map,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.map.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.map.available_countries')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    {['🇳🇬 Nigeria', '🇺🇦 Ukraine', '🇹🇷 Turkey', '🇺🇸 USA', '🇬🇧 UK', '🇩🇪 Germany'].map(c => (
                        <div key={c} className="bg-slate-800/50 p-2 rounded text-center text-slate-300 text-sm">{c}</div>
                    ))}
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.map.region_bonuses')}</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>{t('wiki.sections.map.bonuses.coastal')}</li>
                    <li>{t('wiki.sections.map.bonuses.mountain')}</li>
                    <li>{t('wiki.sections.map.bonuses.resource')}</li>
                </ul>
            </div>
        )
    },
    {
        id: 'inventory',
        title: t('wiki.sections.inventory.title'),
        icon: Backpack,
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">{t('wiki.sections.inventory.content')}</p>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.inventory.quality_tiers')}</h4>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(q => (
                        <div key={q} className="flex-1 bg-slate-800/50 p-2 rounded text-center">
                            <div className="text-amber-400 font-bold">Q{q}</div>
                            <div className="text-slate-500 text-[10px]">{t('wiki.sections.inventory.efficiency', { percent: q * 20 })}</div>
                        </div>
                    ))}
                </div>

                <h4 className="text-cyan-400 font-bold mt-4">{t('wiki.sections.inventory.item_effects')}</h4>
                <WikiTable
                    headers={[t('wiki.sections.inventory.table.item'), t('wiki.sections.inventory.table.q1'), t('wiki.sections.inventory.table.q5')]}
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

type WikiSectionData = ReturnType<typeof getWikiSections>[0];

function WikiSection({ section, isOpen, onToggle }: {
    section: WikiSectionData,
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
    const { t } = useTranslation();
    const [openSections, setOpenSections] = useState<Set<string>>(new Set(['training']));
    const [searchQuery, setSearchQuery] = useState('');

    const WIKI_SECTIONS = getWikiSections(t);

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
                        {t('wiki.page_header').split(' ')[0]} <span className="text-cyan-400">{t('wiki.page_header').split(' ')[1]}</span>
                    </h1>
                </div>
                <p className="text-slate-400">{t('wiki.page_subtitle')}</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder={t('wiki.search_placeholder')}
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
                <p>{t('wiki.last_updated', { date: new Date().toLocaleDateString() })}</p>
                <p className="mt-1">{t('wiki.contract_note')}</p>
            </div>
        </div>
    );
}
