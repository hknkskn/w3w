/**
 * ============================================================
 *  WEB3WAR DESIGN KIT - Industrial UI System
 *  Version: 1.0 (January 2026)
 * ============================================================
 * 
 * This file contains all design tokens, reusable components,
 * and styling patterns for the Web3War game interface.
 * 
 * Usage: Import components and tokens from this file to maintain
 * consistent styling across all game pages.
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

// ============================================================
//  1. COLOR TOKENS
// ============================================================

export const COLORS = {
    // Background Colors
    bg: {
        primary: 'bg-slate-900',           // Main page background
        secondary: 'bg-slate-800',          // Card hover, elevated surfaces
        tertiary: 'bg-slate-950',           // Deepest backgrounds, inputs
        card: 'bg-slate-900/70',            // Card default
        cardHover: 'bg-slate-800/40',       // Card hover state
        overlay: 'bg-black/80',             // Modal overlays
    },

    // Border Colors
    border: {
        default: 'border-slate-700/50',     // Standard borders
        subtle: 'border-slate-800',         // Subtle borders
        strong: 'border-slate-600',         // Emphasized borders
        dashed: 'border-dashed border-slate-700/50', // Empty states
        cyan: 'border-cyan-500/50',         // Active/selected
        emerald: 'border-emerald-500/20',   // Success states
    },

    // Text Colors
    text: {
        primary: 'text-white',              // Headlines, important text
        secondary: 'text-slate-300',        // Body text
        tertiary: 'text-slate-400',         // Labels, descriptions
        muted: 'text-slate-500',            // Placeholder, hints
        dim: 'text-slate-600',              // Disabled, very subtle

        // Semantic Colors
        cyan: 'text-cyan-400',              // Primary accent, links
        emerald: 'text-emerald-400',        // Success, positive values
        amber: 'text-amber-500',            // Warning, RAW materials
        red: 'text-red-400',                // Error, negative values
    },

    // Button Colors
    button: {
        default: 'bg-slate-800 hover:bg-slate-700',
        primary: 'bg-cyan-500 hover:bg-cyan-400',
        success: 'bg-emerald-600 hover:bg-emerald-500',
        danger: 'bg-red-600 hover:bg-red-500',
        ghost: 'bg-transparent hover:bg-slate-800/50',
    },

    // State Colors
    state: {
        active: 'bg-cyan-500/10 border-cyan-500/50',
        selected: 'bg-cyan-500/20',
        hover: 'hover:bg-slate-700/30',
        disabled: 'opacity-50 cursor-not-allowed',
    },
} as const;

// ============================================================
//  2. TYPOGRAPHY TOKENS
// ============================================================

export const TYPOGRAPHY = {
    // Headlines
    h1: 'text-2xl font-black text-white uppercase tracking-tighter',
    h2: 'text-lg font-black text-white uppercase tracking-tighter',
    h3: 'text-sm font-black text-white uppercase tracking-tight',
    h4: 'text-xs font-black text-white uppercase',

    // Labels
    label: {
        base: 'text-[10px] font-black text-slate-500 uppercase tracking-widest',
        small: 'text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]',
        tiny: 'text-[8px] font-black text-slate-600 uppercase tracking-widest',
    },

    // Body
    body: {
        base: 'text-sm text-slate-300',
        small: 'text-xs text-slate-400',
        tiny: 'text-[11px] text-slate-500 font-bold leading-relaxed',
    },

    // Mono (Numbers, Codes)
    mono: {
        large: 'text-2xl font-mono font-black tabular-nums',
        base: 'text-lg font-mono font-bold tabular-nums',
        small: 'text-xs font-mono font-bold',
    },
} as const;

// ============================================================
//  3. SPACING & SIZING TOKENS
// ============================================================

export const SPACING = {
    // Padding
    card: 'p-5',        // Standard card padding
    cardLarge: 'p-6',   // Large card padding
    cardXL: 'p-8',      // Extra large padding
    button: 'px-6 py-3', // Button padding
    buttonSm: 'px-4 py-2', // Small button

    // Gaps
    gap: {
        xs: 'gap-2',
        sm: 'gap-3',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
    },

    // Margins
    section: 'space-y-6',   // Between major sections
    items: 'space-y-3',     // Between list items
} as const;

export const SIZING = {
    // Border Radius
    radius: {
        sm: 'rounded-lg',       // Buttons, small elements
        md: 'rounded-xl',       // Cards
        lg: 'rounded-2xl',      // Large cards
        xl: 'rounded-3xl',      // Panels
        full: 'rounded-full',   // Pills, avatars
    },

    // Icon Sizes
    icon: {
        xs: 12,
        sm: 14,
        md: 18,
        lg: 24,
        xl: 32,
    },

    // Avatar Sizes
    avatar: {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    },

    // Heights
    height: {
        button: 'h-10',
        buttonLg: 'h-12',
        input: 'h-12',
    },
} as const;

// ============================================================
//  4. ANIMATION TOKENS
// ============================================================

export const ANIMATIONS = {
    // Framer Motion Variants
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
    },

    slideUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },

    scaleIn: {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
    },

    // CSS Transitions
    transition: {
        fast: 'transition-all duration-150',
        base: 'transition-all duration-200',
        slow: 'transition-all duration-300',
    },
} as const;

// ============================================================
//  5. REUSABLE COMPONENTS
// ============================================================

/**
 * Card - Base container component
 */
interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'outline' | 'dashed';
    padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({
    children,
    className = '',
    variant = 'default',
    padding = 'md'
}: CardProps) {
    const variants = {
        default: 'bg-slate-900/70 border border-slate-700/50',
        elevated: 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors',
        outline: 'bg-transparent border border-slate-700/50',
        dashed: 'bg-slate-900/40 border-2 border-dashed border-slate-700/50',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
    };

    return (
        <div className={`${SIZING.radius.lg} ${variants[variant]} ${paddings[padding]} ${className}`}>
            {children}
        </div>
    );
}

/**
 * Panel - Full-height management panel (like CompanyManager)
 */
interface PanelProps {
    children: ReactNode;
    className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
    return (
        <div className={`bg-slate-900 border border-slate-800 ${SIZING.radius.xl} overflow-hidden shadow-2xl flex flex-col h-[700px] ${className}`}>
            {children}
        </div>
    );
}

export function PanelHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`px-6 py-4 border-b border-slate-800 bg-slate-800/20 ${className}`}>
            {children}
        </div>
    );
}

export function PanelContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`p-8 overflow-y-auto flex-1 bg-slate-900 ${className}`}>
            {children}
        </div>
    );
}

/**
 * Label - Section/field label
 */
export function Label({ children, size = 'base' }: { children: ReactNode; size?: 'base' | 'small' | 'tiny' }) {
    return (
        <span className={TYPOGRAPHY.label[size]}>
            {children}
        </span>
    );
}

/**
 * StatCard - Display a single stat with icon
 */
interface StatCardProps {
    icon?: ReactNode;
    label: string;
    value: string | number;
    unit?: string;
    className?: string;
}

export function StatCard({ icon, label, value, unit, className = '' }: StatCardProps) {
    return (
        <Card variant="elevated" className={className}>
            {icon && <div className="text-slate-500 mb-3">{icon}</div>}
            <div className={`${TYPOGRAPHY.mono.large} text-white leading-none mb-1`}>{value}</div>
            <div className={TYPOGRAPHY.label.tiny}>{unit || label}</div>
        </Card>
    );
}

/**
 * ActionButton - Styled action button with icon
 */
interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    label: string;
    sublabel?: string;
    variant?: 'default' | 'primary' | 'success' | 'danger';
    size?: 'sm' | 'md';
}

export function ActionButton({
    icon,
    label,
    sublabel,
    variant = 'default',
    size = 'md',
    className = '',
    disabled,
    ...props
}: ActionButtonProps) {
    const variants = {
        default: 'bg-slate-800/80 border-slate-600/50 text-slate-200 hover:bg-slate-700 hover:text-white',
        primary: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25',
        success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25',
        danger: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
    };

    const sizes = {
        sm: 'px-3 py-2 text-[9px]',
        md: 'px-4 py-2.5 text-[10px]',
    };

    return (
        <button
            className={`w-full flex items-center justify-between ${SIZING.radius.sm} border ${ANIMATIONS.transition.base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-black uppercase tracking-widest">{label}</span>
            </div>
            {sublabel ? (
                <span className="text-[9px] text-slate-400 font-mono">{sublabel}</span>
            ) : (
                <ChevronRight size={12} className="opacity-50" />
            )}
        </button>
    );
}

/**
 * TabBar - Horizontal tab navigation
 */
interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface TabBarProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (id: string) => void;
    variant?: 'pills' | 'underline';
}

export function TabBar({ tabs, activeTab, onTabChange, variant = 'pills' }: TabBarProps) {
    if (variant === 'underline') {
        return (
            <div className="flex bg-slate-900/50 border-b border-slate-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex-1 py-4 ${TYPOGRAPHY.label.small} flex items-center justify-center gap-2 border-b-2 ${ANIMATIONS.transition.base} ${activeTab === tab.id
                                ? 'text-cyan-400 border-cyan-500 bg-cyan-500/5'
                                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 ${SIZING.radius.md} font-bold text-sm ${ANIMATIONS.transition.base} whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

/**
 * ListItem - Selectable list item (like company list)
 */
interface ListItemProps {
    children: ReactNode;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function ListItem({ children, selected, onClick, className = '' }: ListItemProps) {
    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer p-5 ${SIZING.radius.md} border ${ANIMATIONS.transition.base} ${selected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600'
                } ${className}`}
        >
            {children}
        </div>
    );
}

/**
 * Modal - Full-screen modal with backdrop
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    {...ANIMATIONS.fadeIn}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-slate-900 border border-slate-700 p-8 ${SIZING.radius.lg} w-full max-w-md shadow-2xl`}
                    >
                        {title && (
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={TYPOGRAPHY.h1}>{title}</h2>
                                <button onClick={onClose} className="text-slate-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * EmptyState - Placeholder for empty sections
 */
interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Card variant="dashed" className="py-20 text-center">
            {icon && <div className="mb-6 opacity-20">{icon}</div>}
            <p className={TYPOGRAPHY.h3}>{title}</p>
            {description && (
                <p className={`${TYPOGRAPHY.label.small} mt-2 max-w-sm mx-auto`}>
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </Card>
    );
}

/**
 * Badge - Small status/quality badge
 */
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'cyan' | 'amber' | 'emerald';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
    const variants = {
        default: 'bg-slate-700 border-slate-600 text-white',
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    };

    return (
        <span className={`px-2 py-0.5 ${SIZING.radius.sm} text-[8px] font-black uppercase border ${variants[variant]}`}>
            {children}
        </span>
    );
}

/**
 * Input - Styled input field
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-2">
            {label && <label className={TYPOGRAPHY.label.small}>{label}</label>}
            <input
                className={`w-full bg-slate-900 border border-slate-800 ${SIZING.radius.md} p-3 text-white font-mono text-sm outline-none focus:border-cyan-500/50 ${ANIMATIONS.transition.base} ${className}`}
                {...props}
            />
        </div>
    );
}

// ============================================================
//  6. UTILITY CLASSES (Copy-paste ready)
// ============================================================

export const UTILITY_CLASSES = {
    // Common Card Styles
    card: 'bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5',
    cardElevated: 'bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 transition-colors',

    // Button Styles
    buttonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-xl px-6 py-3 transition-all',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl px-6 py-3 transition-all',
    buttonGhost: 'bg-transparent border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-black uppercase text-[10px] tracking-widest rounded-xl px-6 py-3 transition-all',

    // Text Styles
    headline: 'text-lg font-black text-white uppercase tracking-tighter',
    label: 'text-[10px] font-black text-slate-500 uppercase tracking-widest',
    mono: 'font-mono font-bold tabular-nums',

    // Layout
    gridBase: 'grid grid-cols-12 gap-6',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
};

// ============================================================
//  7. EXAMPLE USAGE
// ============================================================

/*
import { 
    Card, 
    Panel, 
    PanelHeader, 
    PanelContent,
    Label, 
    StatCard, 
    ActionButton, 
    TabBar, 
    ListItem,
    Modal,
    EmptyState,
    Badge,
    Input,
    COLORS,
    TYPOGRAPHY,
    SPACING,
    SIZING,
    ANIMATIONS
} from '@/lib/ui-kit';

// Example Card
<Card variant="elevated">
    <Label>Section Title</Label>
    <p className={TYPOGRAPHY.body.small}>Content here</p>
</Card>

// Example Button
<ActionButton 
    icon={<Settings size={14} />}
    label="Settings"
    variant="primary"
/>

// Example Tab Bar
<TabBar 
    tabs={[
        { id: 'overview', label: 'Overview', icon: <LineChart size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ]}
    activeTab="overview"
    onTabChange={setActiveTab}
/>

// Example List Item
<ListItem selected={selectedId === item.id} onClick={() => setSelectedId(item.id)}>
    <div className={UTILITY_CLASSES.flexBetween}>
        <span className={TYPOGRAPHY.h4}>{item.name}</span>
        <Badge variant="cyan">Active</Badge>
    </div>
</ListItem>
*/
