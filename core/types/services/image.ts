export type CdnFile = {
    url: string
    filename?: string
    mime?: string
    size?: number
    width?: number
    height?: number
}

export const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
export const MAX_SIZE_BYTES = 5 * 1024 * 1024
