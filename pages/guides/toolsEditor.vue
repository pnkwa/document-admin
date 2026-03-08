<script setup lang="ts">
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import { Blocks, Columns3, Image as ImageIcon, Link2, Table, Share2 } from 'lucide-vue-next'

const breadcrumbs = useBreadcrumbs()

onMounted(() => {
    breadcrumbs.set([
        { label: 'Home', to: '/' },
        { label: 'Guides', to: '/guides' },
        { label: 'Editor Tools' },
    ])
})

const tools = [
    {
        icon: Blocks,
        title: 'Rich blocks',
        description:
            'Use headings, paragraphs, quotes, lists, code, and embeds to build structured documents in seconds.',
    },
    {
        icon: Columns3,
        title: 'Columns layout',
        description:
            'Break a page into two or three columns to compare content or surface callouts side-by-side.',
    },
    {
        icon: ImageIcon,
        title: 'Images with uploads',
        description:
            'Upload images from your device or link from a URL. Images support captions and automatic resizing.',
    },
    {
        icon: Link2,
        title: 'Link cards',
        description:
            'Paste a URL and the editor fetches metadata, giving you a clean card with title, description, and link.',
    },
    {
        icon: Table,
        title: 'Tables',
        description:
            'Insert tables to track specs, comparisons, or schedules. Header rows are highlighted automatically.',
    },
    {
        icon: Share2,
        title: 'Embeds & rich media',
        description:
            'Drop in Loom, Figma, or YouTube links to embed interactive content with automatic sizing and captions.',
    },
]
</script>

<template>
    <DocumentLayout>
        <div class="!min-h-[calc(100vh-107px)] overflow-y-auto">
            <header class="border-b border-navy-20 bg-background-primary px-6 py-10 sm:px-10">
                <div class="mx-auto flex max-w-4xl flex-col gap-4">
                    <div
                        class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary"
                    >
                        Editor tools
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
                        Blocks and shortcuts that speed up writing
                    </h1>
                    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        The editor supports a flexible block toolkit—here’s what ships out of the
                        box and how to get the most out of it.
                    </p>
                </div>
            </header>

            <div class="px-6 py-10 sm:px-10 lg:px-16">
                <div class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
                    <div
                        v-for="tool in tools"
                        :key="tool.title"
                        class="flex h-full flex-col gap-3 rounded-xl border border-slate-200/50 bg-background-secondary p-4"
                    >
                        <div
                            class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        >
                            <component :is="tool.icon" class="h-5 w-5" />
                        </div>
                        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {{ tool.title }}
                        </h2>
                        <p class="text-sm text-slate-600 dark:text-slate-300">
                            {{ tool.description }}
                        </p>
                    </div>
                </div>

                <section class="mx-auto mt-10 max-w-4xl space-y-4">
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Helpful tips
                    </h2>
                    <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <li>
                            Press “/” in an empty paragraph to open the command menu and search for
                            any block.
                        </li>
                        <li>
                            Drag the handle to the left of any block to reorder it or convert it to
                            a different type.
                        </li>
                        <li>
                            Use column blocks sparingly—two columns are great for comparisons, while
                            three columns work best for small snippets.
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </DocumentLayout>
</template>
