import { h, type Component } from 'vue'
import { isAxiosError } from 'axios'
import { toast } from 'vue-sonner'
import { CircleCheck, CircleAlert, Info } from 'lucide-vue-next'

type Variant = 'success' | 'error' | 'info'
export type Action = 'create' | 'update' | 'delete' | 'load'

type TitleMap = Record<Action, string>
export const TITLES: TitleMap = {
    create: 'Create failed',
    update: 'Update failed',
    delete: 'Delete failed',
    load: 'Error loading',
}

interface VariantStyle {
    box: string
    icon: string
    Icon: Component
}

const VARIANT_STYLES: Record<Variant, VariantStyle> = {
    success: {
        box:
            'bg-emerald-50 border border-emerald-200 text-emerald-900 ' +
            'dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-100',
        icon: 'text-emerald-600 dark:text-emerald-400',
        Icon: CircleCheck,
    },
    error: {
        box:
            'bg-rose-50 border border-rose-200 text-rose-900 ' +
            'dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-100',
        icon: 'text-rose-600 dark:text-rose-400',
        Icon: CircleAlert,
    },
    info: {
        box:
            'bg-sky-50 border border-sky-200 text-sky-900 ' +
            'dark:bg-sky-950/60 dark:border-sky-900 dark:text-sky-100',
        icon: 'text-sky-600 dark:text-sky-400',
        Icon: Info,
    },
}

const getVariantIconNode = (variant: Variant) => {
    const { Icon, icon } = VARIANT_STYLES[variant]
    return h(Icon, { class: `h-5 w-5 ${icon}` })
}

const getVariantBoxClasses = (variant: Variant) => {
    return VARIANT_STYLES[variant].box
}

export const toastActionError = (action: Action, subject: string, error: unknown) => {
    const title = action === 'load' ? `${TITLES[action]} ${subject}` : TITLES[action]
    let description = `Unable to ${action} ${subject}.`

    if (error instanceof ValidationToError) {
        description = error.message
    } else if (isAxiosError(error)) {
        if (!error.response) {
            description = 'Network error. Please check your connection.'
        } else {
            const { status, statusText, data } = error.response

            const unhandledMsg = `Request failed (${status}${statusText ? ` ${statusText}` : ''}).`
            description = data?.error?.message
                ? `${unhandledMsg}\n${data?.error?.message}`
                : unhandledMsg
        }
    } else if (error instanceof Error && error.message) {
        description = error.message
    }

    toast(title, {
        description,
        icon: getVariantIconNode('error'),
        class: getVariantBoxClasses('error'),
    })
}

const capitalize = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const toastActionSuccess = (action: Action, subject: string) => {
    const map: Record<Action, { title: string; desc: string }> = {
        create: { title: 'Created', desc: `${capitalize(subject)} added.` },
        update: { title: 'Updated', desc: `${capitalize(subject)} saved.` },
        delete: { title: 'Deleted', desc: `${capitalize(subject)} removed.` },
        load: { title: 'Loaded', desc: `${capitalize(subject)} ready.` },
    }
    const { title, desc } = map[action]

    toast(title, {
        description: desc,
        icon: getVariantIconNode('success'),
        class: getVariantBoxClasses('success'),
    })
}
