import { cva, type VariantProps } from 'class-variance-authority'

export const inputVariants = cva(
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-(--color-primary)/50 focus-visible:ring-[1px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-(--color-danger) hover:border-(--color-primary) duration-400',
    {
        variants: {
            variant: {
                default: 'border-(--color-navy-40) focus-visible:border-(--color-primary)',
                error: 'border-danger focus-visible:border-danger',
                success: 'border-success focus-visible:border-success',
            },
            size: {
                sm: 'h-8 text-xs',
                md: 'h-10 text-sm',
                lg: 'h-12 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    },
)

export type InputVariants = VariantProps<typeof inputVariants>
