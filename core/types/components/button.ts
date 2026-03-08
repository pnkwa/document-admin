import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 aria-invalid:border-danger duration-400",
    {
        variants: {
            variant: {
                default: 'bg-(--color-primary) text-white shadow-xs hover:bg-(--color-primary)/60',
                destructive:
                    'bg-destructive text-(--color-danger) shadow-xs hover:bg-(--color-danger)/40 focus-visible:ring-(--color-danger)/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs text-(--color-primary) transition-all duration-200 ease-in-out hover:bg-(--color-primary)/20 active:text-(--color-primary) active:translate-y-0 active:bg-(--color-primary)/20 dark:text-(--color-primary) dark:hover:text-(--color-primary)-clicked dark:hover:bg-(--color-primary)/20 dark:active:text-(--color-primary) dark:active:bg-(--color-primary)/20',
                secondary:
                    'bg-(--color-navy-10) hover:bg-(--color-navy-20) text-secondary-foreground shadow-xs ',
                ghost: 'cursor-pointer hover:bg-primary/10 hover:text-primary dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9 p-1',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
