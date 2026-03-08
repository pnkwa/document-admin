import { toast } from 'vue-sonner'

export const useCopyLink = () => {
    const { copy, isSupported } = useClipboard({ legacy: true })

    const copyLink = (url: string) => {
        if (!isSupported.value) {
            toast('Copy failed', {
                description: `Clipboard not supported. Please copy manually:\n${url}`,
            })
        }

        copy(url)
            .then(() => {
                toast('Copied', { description: 'Link copied to clipboard.' })
            })
            .catch(() => {
                toast('Copy failed', { description: `Please copy manually:\n${url}` })
            })
    }

    return {
        copyLink,
    }
}
