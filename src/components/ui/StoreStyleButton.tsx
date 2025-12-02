import React from 'react'
import { cn } from '../../lib/utils'

interface StoreStyleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode
    label: string
    subLabel: string
    href?: string
}

export const StoreStyleButton = React.forwardRef<HTMLButtonElement, StoreStyleButtonProps>(
    ({ className, icon, label, subLabel, href, onClick, ...props }, ref) => {
        const Content = () => (
            <>
                <div className="w-6 h-6 flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-4 flex flex-col items-start leading-none">
                    <span className="mb-1 text-xs opacity-90">{subLabel}</span>
                    <span className="font-semibold text-base">{label}</span>
                </div>
            </>
        )

        const baseStyles = cn(
            "inline-flex items-center justify-center border-2 rounded-full px-6 py-2.5 text-center transition-all duration-200 outline-none decoration-0",
            "bg-black border-black text-white hover:bg-transparent hover:text-black",
            className
        )

        if (href) {
            return (
                <a href={href} className={baseStyles}>
                    <Content />
                </a>
            )
        }

        return (
            <button
                ref={ref}
                onClick={onClick}
                className={baseStyles}
                {...props}
            >
                <Content />
            </button>
        )
    }
)

StoreStyleButton.displayName = 'StoreStyleButton'
