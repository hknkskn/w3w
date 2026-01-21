# Web3War UI Design Kit

Industrial-themed design system for consistent, professional UI across all game pages.

---

## 🎨 Color Palette

### Backgrounds
| Token | Class | Usage |
|-------|-------|-------|
| Primary | `bg-slate-900` | Main page background |
| Secondary | `bg-slate-800` | Elevated surfaces |
| Card | `bg-slate-900/70` | Card default |
| Overlay | `bg-black/80` | Modal backdrop |

### Text Colors
| Token | Class | Usage |
|-------|-------|-------|
| Primary | `text-white` | Headlines |
| Secondary | `text-slate-300` | Body text |
| Muted | `text-slate-500` | Labels, hints |
| Cyan | `text-cyan-400` | Accent, links |
| Emerald | `text-emerald-400` | Success, positive |
| Amber | `text-amber-500` | Warning, RAW |
| Red | `text-red-400` | Error, danger |

### Borders
| Token | Class |
|-------|-------|
| Default | `border-slate-700/50` |
| Subtle | `border-slate-800` |
| Active | `border-cyan-500/50` |

---

## 📝 Typography

### Headlines
```
H1: text-2xl font-black text-white uppercase tracking-tighter
H2: text-lg font-black text-white uppercase tracking-tighter
H3: text-sm font-black text-white uppercase tracking-tight
H4: text-xs font-black text-white uppercase
```

### Labels
```
Base:  text-[10px] font-black text-slate-500 uppercase tracking-widest
Small: text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]
Tiny:  text-[8px] font-black text-slate-600 uppercase tracking-widest
```

### Mono (Numbers)
```
Large: text-2xl font-mono font-black tabular-nums
Base:  text-lg font-mono font-bold tabular-nums
Small: text-xs font-mono font-bold
```

---

## 📦 Components

### Card
```tsx
// Default card
<div className="bg-slate-900/70 border border-slate-700/50 rounded-2xl p-5">

// Elevated (hoverable)
<div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 transition-colors">

// Empty state (dashed)
<div className="bg-slate-900/40 border-2 border-dashed border-slate-700/50 rounded-2xl p-10">
```

### Panel (Full Height)
```tsx
<div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
    {/* Header */}
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/20">...</div>
    
    {/* Tab Bar */}
    <div className="flex bg-slate-900/50 border-b border-slate-800">...</div>
    
    {/* Content */}
    <div className="p-8 overflow-y-auto flex-1 bg-slate-900">...</div>
</div>
```

### Tab Bar (Pills)
```tsx
<div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50">
    <button className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm bg-slate-700 text-white">
        Active Tab
    </button>
    <button className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-300">
        Inactive Tab
    </button>
</div>
```

### Tab Bar (Underline)
```tsx
<button className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 text-cyan-400 border-cyan-500 bg-cyan-500/5">
    Active
</button>
<button className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 text-slate-500 border-transparent">
    Inactive
</button>
```

### List Item (Selectable)
```tsx
// Selected
<div className="p-5 rounded-xl border bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.05)]">

// Default
<div className="p-5 rounded-xl border bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600">
```

### Stat Card
```tsx
<div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
    <div className="text-slate-500 mb-3">{icon}</div>
    <div className="text-2xl font-mono font-black text-white">{value}</div>
    <div className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{label}</div>
</div>
```

### Action Button
```tsx
<button className="w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-[10px] bg-slate-800/80 border-slate-600/50 text-slate-200 hover:bg-slate-700">
    <div className="flex items-center gap-2">
        {icon}
        <span className="font-black uppercase tracking-widest">{label}</span>
    </div>
    <ChevronRight size={12} className="opacity-50" />
</button>
```

### Badge
```tsx
// Default
<span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border bg-slate-700 border-slate-600 text-white">

// Cyan (Active)
<span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">

// Amber (Warning)
<span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border bg-amber-500/10 border-amber-500/20 text-amber-500">
```

### Input
```tsx
<input className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-cyan-500/50 transition-all" />
```

### Modal
```tsx
{/* Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    {/* Content */}
    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        ...
    </div>
</div>
```

---

## 📐 Spacing & Sizing

### Border Radius
| Size | Class |
|------|-------|
| SM | `rounded-lg` |
| MD | `rounded-xl` |
| LG | `rounded-2xl` |
| XL | `rounded-3xl` |

### Common Heights
| Element | Height |
|---------|--------|
| Button | `h-10` |
| Button LG | `h-12` |
| Input | `h-12` |

### Grid Layout
```tsx
// Two-panel layout (list + detail)
<div className="grid grid-cols-12 gap-6">
    <div className="col-span-12 lg:col-span-4">List</div>
    <div className="col-span-12 lg:col-span-8">Detail Panel</div>
</div>
```

---

## 🎬 Animations

### Framer Motion Variants
```tsx
// Fade In
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

// Scale In
initial={{ opacity: 0, scale: 0.98 }}
animate={{ opacity: 1, scale: 1 }}

// Slide Up
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
```

### CSS Transitions
```
transition-all duration-150  // Fast
transition-all duration-200  // Base
transition-all duration-300  // Slow
```

---

## 📁 File Reference

```
lib/ui-kit.tsx       - Component library + tokens
docs/UI-KIT.md       - This documentation
```

Import from ui-kit:
```tsx
import { Card, Panel, TabBar, ActionButton, COLORS, TYPOGRAPHY } from '@/lib/ui-kit';
```
