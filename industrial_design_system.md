# Industrial Design System (IDS) - High-Density (HD) Edition

This document serves as the official UI/UX reference for the "Industrial Center" aesthetic. All modules must adhere to these tokens to ensure a professional, high-density, and cohesive experience.

## 🎨 Color Palette

### Core Neutrals
| Role | Tailwind Class | Usage |
| :--- | :--- | :--- |
| **Backdrop** | `bg-[#0a0f1d]` or `bg-slate-950` | Main application background |
| **Surface (Low)** | `bg-slate-900/40` | Secondary containers, tab bars |
| **Surface (Mid)** | `bg-slate-900/80` | Primary cards, headers (Solid focus) |
| **Surface (High)** | `bg-slate-800` | Active states, emphasized buttons |
| **Border (Subtle)** | `border-slate-800` | Default component borders |
| **Border (Focus)** | `border-cyan-500/30` | Active/Selected component borders |

### Functional Accents
- **Primary (Operations)**: `text-cyan-400` / `bg-cyan-500/20`
- **Success (Capital)**: `text-emerald-400` / `bg-emerald-600`
- **Warning (Resources)**: `text-amber-400` / `bg-amber-500/10`
- **Danger (Military)**: `text-white` / `bg-red-600` (Solid execution)

---

## 🏗️ Layout & Grids

### Standard HD Container
- **Max Width**: `max-w-6xl` (1152px)
- **Outer Spacing**: `space-y-4`
- **Responsive Padding**: `px-4 md:px-6`
- **Card Padding**: `p-4` or `p-5` (Never p-8)

### Sidebar Patterns (4:8 Split)
- **Left (4 cols)**: Registry/Object list - Compact rows (`h-14`)
- **Right (8 cols)**: Detailed workstation - Organized, tight data grids.

---

## 🔡 Typography (HD Rules)

- **Headers**: `text-2xl` to `text-3xl` max. `font-black`, `uppercase`, `tracking-tighter`.
- **Labels**: `text-[9px]` or `text-[10px]`. `font-black`, `uppercase`, `tracking-[0.2em]`, `text-slate-500`.
- **Data**: `font-mono`, `font-bold`, `tabular-nums`. `text-xl` for primary stats, `text-sm` for secondary.
- **Main Text**: `font-bold`, `text-slate-400`, `text-[11px]`.

---

## 💎 Component Patterns

### Minimalist Industrial Header
```tsx
<div className="flex justify-between items-center bg-slate-900/60 rounded-xl p-4 border border-slate-800">
    <h1 className="text-2xl font-black text-white flex items-center gap-2">
        <Icon size={24} className="text-red-500" /> TITLE
    </h1>
    <div className="text-right">
        <div className="text-[9px] text-slate-500 font-black tracking-widest">SUB-LABEL</div>
        <div className="text-lg font-black text-white">VALUE</div>
    </div>
</div>
```

### Table Rows (Professional Dense)
- **Height**: `h-16` to `h-18`
- **Icon Box**: `w-10 h-10` or `w-12 h-12` max. Solid background.
- **Header Labels**: `text-[9px]` font-black, wide tracking, low opacity (`opacity-40`).

---

## 💡 Best Practices (HD)
1. **Saturation Control**: Avoid bright glowing gradients. Use solid block colors (Solid Red, Solid Cyan).
2. **Space Efficiency**: If it can be smaller without losing readability, make it smaller.
3. **Professional Edge**: Use sharp `rounded-lg` or `rounded-xl` instead of soft `rounded-3xl`.
4. **Icons**: Small stroke weights. Emojis strictly in `w-10` boxes.
