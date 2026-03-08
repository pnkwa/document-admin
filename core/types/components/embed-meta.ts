type ProviderConfig = {
    regex: RegExp
    embedUrl: string
    html: string
    height: number
    width: number
    id: (groups: Array<string | undefined>) => string
}

export const PROVIDERS: Record<string, ProviderConfig> = {
    tiktok: {
        // eslint-disable-next-line no-useless-escape
        regex: /^(?:https?:\/\/)?(?:(?:www|m)\.)?tiktok\.com\/(?:@[^\/?#]+\/video\/(\d+)|player\/v1\/(\d+)|share\/video\/(\d+)|.*?[?&](?:item_id|video_id)=(\d+))(?:[^\s]*)?$/i,
        embedUrl: 'https://www.tiktok.com/player/v1/<%= remote_id %>',
        html:
            "<iframe class='w-full max-w-[720px] h-[560px] md:h-[640px] lg:h-[1280px] border-0 block mx-auto rounded-xl bg-black' " +
            "title='TikTok video' " +
            "allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' " +
            "referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
        height: 1280,
        width: 720,
        id: (groups) => groups.find(Boolean) ?? '',
    },
}

export type Kind =
    | 'vertical'
    | 'instagram'
    | 'twitter'
    | 'facebook'
    | 'twitch'
    | 'codepen'
    | 'gist'
    | 'pinterest'
    | 'spotify'
    | 'soundcloud'
    | 'maps'
    | 'figma'
    | 'miro'
    | 'gdrive'
    | 'landscape'

export type EmbedMeta = { maxW: string; h: string }

const PRESETS: Record<Kind, EmbedMeta> = {
    vertical: { maxW: 'max-w-[400px]', h: 'h-[560px] md:h-[640px] lg:h-[720px]' },
    instagram: { maxW: 'max-w-md', h: 'h-[380px] md:h-[420px] lg:h-[460px]' },
    twitter: { maxW: 'max-w-2xl', h: 'h-[420px] md:h-[500px] lg:h-[560px]' },
    facebook: { maxW: 'max-w-3xl', h: 'h-[320px] md:h-[420px] lg:h-[500px]' },
    twitch: { maxW: 'max-w-4xl', h: 'h-[366px] md:h-[480px] lg:h-[540px]' },
    codepen: { maxW: 'max-w-4xl', h: 'h-[300px] md:h-[360px] lg:h-[420px]' },
    gist: { maxW: 'max-w-4xl', h: 'h-[350px] md:h-[420px] lg:h-[480px]' },
    pinterest: { maxW: 'max-w-2xl', h: 'h-[400px] md:h-[600px] lg:h-[800px]' },
    spotify: { maxW: 'max-w-xl', h: 'h-[152px] md:h-[200px] lg:h-[232px]' },
    soundcloud: { maxW: 'max-w-2xl', h: 'h-[166px] md:h-[200px] lg:h-[232px]' },
    maps: { maxW: 'max-w-4xl', h: 'h-[380px] md:h-[480px] lg:h-[560px]' },
    figma: { maxW: 'max-w-5xl', h: 'h-[450px] md:h-[600px] lg:h-[800px]' },
    miro: { maxW: 'max-w-5xl', h: 'h-[500px] md:h-[600px] lg:h-[720px]' },
    gdrive: { maxW: 'max-w-4xl', h: 'h-[360px] md:h-[480px] lg:h-[600px]' },
    landscape: { maxW: 'max-w-4xl', h: 'h-[315px] md:h-[420px] lg:h-[540px]' },
}

const safeUrl = (url?: string): URL | null => {
    try {
        return url ? new URL(url) : null
    } catch {
        return null
    }
}

type ParsedUrl = {
    service: string
    host: string
    path: string
}

const parseUrlInfo = (service?: string, url?: string): ParsedUrl => {
    const u = safeUrl(url)
    return {
        service: (service || '').toLowerCase(),
        host: (u?.host || '').toLowerCase(),
        path: (u?.pathname || '').toLowerCase(),
    }
}

const contains = (str: string, values: string[]) => values.some((v) => str.includes(v))

const pathContains = (path: string, values: string[]) => contains(path, values)

const RULES: Array<{ kind: Kind; match: (info: ParsedUrl) => boolean }> = [
    {
        kind: 'vertical',
        match: (i) =>
            contains(i.service + i.host, ['tiktok']) ||
            (contains(i.service + i.host, ['youtube', 'youtu.be']) &&
                pathContains(i.path, ['/shorts/'])) ||
            (contains(i.service + i.host, ['instagram']) && pathContains(i.path, ['/reel/'])),
    },
    { kind: 'instagram', match: (i) => contains(i.service + i.host, ['instagram']) },
    { kind: 'twitter', match: (i) => contains(i.service + i.host, ['twitter', 'x.com']) },
    { kind: 'facebook', match: (i) => contains(i.service + i.host, ['facebook', 'fb.watch']) },
    { kind: 'twitch', match: (i) => contains(i.service + i.host, ['twitch']) },
    { kind: 'codepen', match: (i) => contains(i.service + i.host, ['codepen']) },
    {
        kind: 'gist',
        match: (i) => i.host.includes('gist.github') || pathContains(i.path, ['/gist/']),
    },
    { kind: 'pinterest', match: (i) => contains(i.service + i.host, ['pinterest']) },
    { kind: 'spotify', match: (i) => contains(i.service + i.host, ['spotify']) },
    { kind: 'soundcloud', match: (i) => contains(i.service + i.host, ['soundcloud']) },
    {
        kind: 'maps',
        match: (i) =>
            i.host.startsWith('maps.') ||
            (contains(i.service + i.host, ['google']) && pathContains(i.path, ['/maps'])),
    },
    { kind: 'figma', match: (i) => contains(i.service + i.host, ['figma']) },
    { kind: 'miro', match: (i) => contains(i.service + i.host, ['miro']) },
    { kind: 'gdrive', match: (i) => contains(i.host, ['drive.google', 'docs.google']) },
]

export const detectKind = (service?: string, url?: string): Kind => {
    const info = parseUrlInfo(service, url)
    const rule = RULES.find((r) => r.match(info))
    return rule ? rule.kind : 'landscape'
}

export const getEmbedMeta = (service?: string, url?: string): EmbedMeta => {
    return PRESETS[detectKind(service, url)]
}
