/**
 * IDS Style Tokens
 * Extracted from the "Gold Standard" Dashboard aesthetic.
 */

export const IDS_THEME = {
    colors: {
        card: {
            bg: 'bg-slate-950/60',
            backdrop: 'backdrop-blur-sm',
            border: 'border-slate-800/50',
            shadow: 'shadow-2xl',
            radius: 'rounded-xl',
        },
        label: {
            dim: 'text-slate-500',
            bright: 'text-white',
            accent: 'text-cyan-400',
            danger: 'text-red-500',
            success: 'text-emerald-500',
        },
        brand: {
            primary: 'cyan',
            secondary: 'slate',
            accent: 'red',
        }
    },
    typography: {
        label: {
            base: 'text-[10px] font-black uppercase tracking-widest',
            sm: 'text-[8px] font-black uppercase tracking-[0.2em]',
        }
    },
    animation: {
        transition: 'transition-all duration-200',
        hoverScale: 'hover:scale-[1.02] active:scale-[0.98]',
    }
} as const;

// Combined Tailwind Classes for common patterns
export const IDS_CLASSES = {
    CARD_BASE: `${IDS_THEME.colors.card.bg} ${IDS_THEME.colors.card.backdrop} ${IDS_THEME.colors.card.radius} border-2 ${IDS_THEME.colors.card.border} ${IDS_THEME.colors.card.shadow}`,
    LABEL_BASE: `${IDS_THEME.typography.label.base}`,
};
