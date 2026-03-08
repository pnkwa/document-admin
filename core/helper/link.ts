type CollectionLinkTarget = { kind: 'collection'; slug: string }
type PostLinkTarget = {
    kind: 'post'
    collectionSlug: string
    groupSlug: string
    postId: number
}

export type LinkTarget = CollectionLinkTarget | PostLinkTarget
export type LinkInput = LinkTarget | string

const {
    public: { clientBaseUrl },
} = useRuntimeConfig()

const encodeSegment = (value: string | number) => encodeURIComponent(String(value))
const prefix = `${clientBaseUrl}/docs`
export const buildPath = (target: LinkTarget): string => {
    switch (target.kind) {
        case 'collection':
            return `${prefix}/${encodeSegment(target.slug)}`
        case 'post':
            return `${prefix}/${encodeSegment(target.collectionSlug)}/${encodeSegment(target.groupSlug)}/${encodeSegment(target.postId)}`
    }
}

const resolvePath = (target: LinkInput): string => {
    if (typeof target === 'string') return target
    return buildPath(target)
}

export const buildAbsoluteUrl = (target: LinkInput): string => {
    const path = resolvePath(target)
    if (typeof window === 'undefined') return path
    return new URL(path, window.location.origin).toString()
}
