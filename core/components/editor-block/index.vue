<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import EditorJS, { type OutputData } from '@editorjs/editorjs'

import edjsParser from 'editorjs-html'
import { getEmbedMeta, PROVIDERS } from '@/core/types/components/embed-meta'
import EditorColumns from './helper/column-plugin'
import { toastActionError } from '~/feature/layout/utils/toast-helper'
import { linkifyRender } from '~/core/utils/linkify'

type SaveEvent = { output: OutputData; html: string }

const editorOutputData = defineModel<OutputData | undefined>('editorOutputData', {
    default: undefined,
})
const isChangeModel = defineModel<boolean>('isChange', { default: false })

const props = defineProps<{
    holderId?: string
    autofocus?: boolean
    imageUploadByFileUrl?: string
    imageUploadByUrl?: string
    dayworkDocumentGroupId: number
}>()

const emit = defineEmits<{
    (e: 'ready'): void
    (e: 'save', payload: SaveEvent): void
}>()

const holderId = computed(() => props.holderId ?? 'editorjs-container')
const editor = ref<EditorJS | null>(null)

onBeforeUnmount(() => {
    editor.value?.destroy()
    editor.value = null
})

const loadTools = async () => {
    const [
        { default: Header },
        { default: CodeTool },
        { default: Delimiter },
        { default: InlineCode },
        { default: Table },
        { default: Embed },
        { default: NestedList },
        { default: ImageTool },
    ] = await Promise.all([
        import('@editorjs/header'),
        import('@editorjs/code'),
        import('@editorjs/delimiter'),
        import('@editorjs/inline-code'),
        import('@editorjs/table'),
        // @ts-expect-error: module has no types
        import('@editorjs/embed'),
        import('@editorjs/nested-list'),
        import('@editorjs/image'),
    ])

    const tools: EditorJS.EditorConfig['tools'] = {
        header: {
            // @ts-expect-error: module has no types
            class: Header,
            config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3],
                defaultLevel: 2,
            },
        },

        code: CodeTool,
        delimiter: Delimiter,
        inlineCode: InlineCode,
        table: Table,
        embed: {
            class: Embed,
            config: {
                services: PROVIDERS,
            },
        },

        list: NestedList,
        columns: {
            // @ts-expect-error: module has no types
            class: EditorColumns,
            config: {
                EditorJsLibrary: EditorJS,
                tools: {
                    header: Header,
                    delimiter: Delimiter,
                    table: Table,
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: (file: File) => {
                                    return uploadImageByFile({
                                        file,
                                        dayworkDocumentGroupID: props.dayworkDocumentGroupId,
                                    })
                                },
                                uploadByUrl: (url: string) => {
                                    return uploadImageByUrl({
                                        url,
                                        dayworkDocumentGroupID: props.dayworkDocumentGroupId,
                                    })
                                },
                            },
                        },
                    },
                },
            },
        },
        image: {
            class: ImageTool,
            config: {
                uploader: {
                    uploadByFile: (file: File) => {
                        return uploadImageByFile({
                            file,
                            dayworkDocumentGroupID: props.dayworkDocumentGroupId,
                        })
                    },
                    uploadByUrl: (url: string) => {
                        return uploadImageByUrl({
                            url,
                            dayworkDocumentGroupID: props.dayworkDocumentGroupId,
                        })
                    },
                },
            },
        },
    }

    return tools
}

type NestedItem = string | { content?: string; items?: NestedItem[] }

const parser = edjsParser({
    paragraph: (block) => {
        const text = block?.data?.text ?? ''
        return `<div class="my-3 leading-7 text-navy-100">${linkifyRender(text)}</div>`
    },
    header: (block) => {
        const L = Math.min(Math.max(Number(block?.data?.level ?? 2), 1), 6)
        return `<h${L}>${linkifyRender(block?.data?.text ?? '')}</h${L}>`
    },
    table: (block) => {
        const [head, ...rows] = block.data.content

        const thead = `<thead class="bg-navy-10 text-left">
            <tr>
                ${head
                    .map(
                        (cell: string) =>
                            `<th class="border border-gray-300 px-4 py-2 font-medium text-navy-100">${linkifyRender(cell)}</th>`,
                    )

                    .join('')}
            </tr>
        </thead>`

        const tbody = `<tbody>${rows
            .map(
                (row: string[]) =>
                    `<tr>${row.map((cell) => `<td class="border border-gray-300 px-4 py-2 text-navy-80">${linkifyRender(cell)}</td>`).join('')}</tr>`,
            )
            .join('')}</tbody>`

        return `<table class="table-auto border border-gray-300 w-auto my-4 overflow-hidden">${thead}${tbody}</table>`
    },
    embed: (block) => {
        const { service, embed, caption } = block.data ?? {}
        const { maxW, h } = getEmbedMeta(service, embed)
        return `
    <figure class="my-4 w-full ${maxW} mx-auto text-center">
      <div class="overflow-hidden rounded-md bg-black">
        <iframe class="w-full ${h} border-0" src="${embed}" title="Embedded media" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
      ${caption ? `<figcaption class="mt-2 text-sm text-gray-500 dark:text-gray-400">${caption}</figcaption>` : ''}
    </figure>`
    },
    list: (block) => {
        const isOrdered = block?.data?.style === 'ordered'
        const rootTag = isOrdered ? 'ol' : 'ul'
        const rootClass = isOrdered
            ? 'list-decimal list-inside space-y-1'
            : 'list-disc list-inside space-y-1'

        const renderItem = (item: NestedItem): string => {
            if (item && typeof item === 'object') {
                const content = linkifyRender(item.content ?? '')
                const hasChildren = Array.isArray(item.items) && item.items.length > 0
                const childTag = isOrdered ? 'ol' : 'ul'
                const childClass = isOrdered
                    ? 'list-decimal list-inside ml-6 space-y-1'
                    : 'list-disc list-inside ml-6 space-y-1'

                const childrenHtml = hasChildren
                    ? `<${childTag} class="${childClass}">${item.items!.map(renderItem).join('')}</${childTag}>`
                    : ''

                return `<li class="my-1 text-gray-800 dark:text-gray-200">${content}${childrenHtml}</li>`
            }

            return `<li class="my-1 text-gray-800 dark:text-gray-200">${linkifyRender(String(item ?? ''))}</li>`
        }

        const itemsHtml = (block?.data?.items ?? []).map(renderItem).join('')
        return `<${rootTag} class="${rootClass}">${itemsHtml}</${rootTag}>`
    },
    code: (block) => {
        const raw = block?.data?.code ?? ''
        const langRaw = (block?.data?.language ?? '').toString().toLowerCase()
        const lang = langRaw && langRaw !== 'plaintext' ? langRaw : 'text'
        const languageClass = `language-${lang}`

        return `
  <figure class="code-frame my-4 rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden">
    <pre class="m-0 p-4 overflow-x-auto bg-navy-10 text-navy-100"><code class="${languageClass}">${raw}</code></pre>
  </figure>`
    },

    columns: (block) => {
        const raw = block?.data ?? {}

        const candidates = (() => {
            if (Array.isArray(raw.cols)) {
                return raw.cols
            } else if (Array.isArray(raw.columns)) {
                return raw.columns
            } else if (Array.isArray(raw.content)) {
                return raw.content
            } else {
                return [raw.col1, raw.col2, raw.col3].filter(Boolean)
            }
        })()

        if (!Array.isArray(candidates) || candidates.length === 0) return ''

        const colsHtml = candidates
            .map((col) => {
                let outputData

                if (col && Array.isArray(col.blocks)) {
                    outputData = col
                } else if (Array.isArray(col)) {
                    outputData = { blocks: col }
                } else {
                    outputData = { blocks: [] }
                }

                const parts = parser.parse(outputData)
                const html = Array.isArray(parts) ? parts.join('') : String(parts ?? '')

                return `<div>${html}</div>`
            })
            .join('')

        const count = candidates.length
        const gridClass =
            count >= 3 ? 'md:grid-cols-3' : count === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'

        return `<section class="grid gap-6 ${gridClass}">${colsHtml}</section>`
    },
})

const jsonToHtml = (data: OutputData) => {
    const parts = parser.parse(data)

    return Array.isArray(parts) ? parts.join('') : String(parts ?? '')
}

const mountEditor = async (data?: OutputData) => {
    const tools = await loadTools()
    return new Promise<EditorJS>((resolve) => {
        const instance = new EditorJS({
            holder: holderId.value,
            autofocus: props.autofocus ?? true,
            data,
            tools,
            onChange: () => {
                isChangeModel.value = true
            },
            onReady: () => {
                emit('ready')
                resolve(instance)
            },
        })
        editor.value = instance
    })
}

onMounted(async () => {
    try {
        await mountEditor(editorOutputData.value)
    } catch (err) {
        toastActionError('load', 'Failed to mount editor instance', err)
    }

    const root = document.getElementById(holderId.value)
    if (!root) return
})

const getValue = async () => {
    if (!editor.value) return

    const output = await editor.value.save()
    const html = jsonToHtml(output)
    return { output, html }
}

defineExpose({ getValue })
</script>

<template>
    <div :id="holderId" class="editor-id" />
</template>

<style lang="scss" scoped>
.editor-id {
    :deep(.ce-toolbar__content),
    :deep(.ce-block__content) {
        margin: 0;
        max-width: 100%;
        blockquote,
        .cdx-quote {
            margin: 1em 0;
            padding: 0.75em 1em;
            border-left: 4px solid #e5e7eb;
            background: #fafafa;
            color: #374151;

            .cdx-quote__caption {
                display: block;
                margin-top: 0.25em;
                font-size: 0.875rem;
                color: #6b7280;
            }
        }

        .ce-delimiter,
        hr {
            margin: 1.25em 0;
            height: 1px;
            border: 0;
            background: #e5e7eb;
        }

        .embed-tool,
        .cdx-embed {
            margin: 1em 0;

            .embed-tool__content,
            iframe {
                inset: 0;
                width: 100%;
                height: 100%;
                border: 0;
            }
        }

        .embed-tool__content,
        .cdx-embed {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
        }
    }
    :deep(.tc-table .tc-row:first-child .tc-cell) {
        font-weight: 600;
        background: var(--color-navy-10);
    }

    :deep(.tc-table .tc-cell) {
        border: 1px solid var(--color-navy-20);
        padding: 0.5rem 0.75rem;
    }

    :deep(.ce-editorjsColumns) {
        display: grid;
        gap: 1.5rem;
        margin: 1.5rem 0;

        &.cols-2 {
            grid-template-columns: repeat(2, 1fr);
        }
        &.cols-3 {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    :deep(.ce-editorjsColumns) {
        display: grid;
        gap: 1.5rem;
        margin: 1.5rem 0;
    }

    :deep(.ce-editorjsColumns_col) {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        min-width: 0;
    }

    @media (min-width: 768px) {
        :deep(.ce-editorjsColumns.cols-2) {
            grid-template-columns: 1fr 1fr;
        }
        :deep(.ce-editorjsColumns.cols-3) {
            grid-template-columns: 1fr 1fr 1fr;
        }
    }

    :deep(.dark .ce-editorjsColumns_col) {
        background: #111827;
        border-color: #374151;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }
}
</style>
