import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({
    children,
    variant = 'primary',
    className,
    ...props
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        outline: 'px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all transform active:scale-95',
    };

    return (
        <button
            className={twMerge(
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
