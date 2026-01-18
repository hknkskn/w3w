import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PanelProps {
    children: ReactNode
    className?: string
    title?: string
    action?: ReactNode
}

export function Panel({ children, className, title, action }: PanelProps) {
    return (
        <div className={cn("bg-white border border-slate-300 rounded-sm shadow-sm overflow-hidden", className)}>
            {(title || action) && (
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    {title && <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    )
}
