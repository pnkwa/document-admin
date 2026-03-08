import DOMPurify from 'dompurify'

export default defineNuxtPlugin(() => {
    const purifier = DOMPurify

    purifier.setConfig({
        ALLOWED_TAGS: [
            'a',
            'b',
            'strong',
            'i',
            'em',
            'u',
            'p',
            'br',
            'ul',
            'ol',
            'li',
            'blockquote',
            'code',
            'pre',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
            'span',
            'img',
            'iframe',
            'figure',
            'figcaption',
            'div',
            'section',
        ],
        ALLOWED_ATTR: [
            'href',
            'title',
            'alt',
            'src',
            'target',
            'rel',
            'allow',
            'allowfullscreen',
            'loading',
            'referrerpolicy',
            'frameborder',
            'class',
        ],
    })

    return {
        provide: {
            dompurify: purifier,
        },
    }
})
