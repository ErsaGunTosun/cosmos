export default function Button({ children, variant = 'default', className = '', ...props }) {
    const base = 'px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer';

    const variants = {
        default: 'bg-white text-black hover:bg-gray-50 border border-[var(--border)]',
        primary: 'bg-black text-white hover:bg-gray-900',
        ghost: 'text-[var(--muted)] hover:text-black hover:bg-gray-50',
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
