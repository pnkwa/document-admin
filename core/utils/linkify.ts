export const URL_PATTERN =
    /\b((?:https?:\/\/|www\.)[^\s<>"')]+(?:\([\w\d\-._~:/?#[\]@!$&'()*+,;=%]*\))?)/gi

export const isUrl = (text: string) => {
    return URL_PATTERN.test(text)
}

export const toHref = (s: string) => (s.startsWith('http') ? s : `https://${s}`)

const anchorStyle = 'text-primary underline break-words cursor-pointer hover:text-primary-hover'

export const linkifyRender = (rawText: string) => {
    if (!rawText) return ''

    if (!isUrl(rawText)) {
        return rawText
    }

    return rawText.replace(URL_PATTERN, (m) => {
        const href = toHref(m)
        return `<a href="${href}" class="${anchorStyle}">${m}</a>`
    })
}
