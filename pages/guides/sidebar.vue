<script setup lang="ts">
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import {
    PanelLeft,
    Folder,
    FolderPlus,
    ChevronRight,
    Plus,
    MoreHorizontal,
    GripVertical,
    Eye,
    Link2,
} from 'lucide-vue-next'

const breadcrumbs = useBreadcrumbs()

onMounted(() => {
    breadcrumbs.set([
        { label: 'Home', to: '/' },
        { label: 'Guides', to: '/guides' },
        { label: 'Sidebar' },
    ])
})

const features = [
    {
        icon: PanelLeft,
        title: 'Collections overview',
        description:
            'The sidebar lists your Collections. Expand a collection to load its Groups and navigate quickly.',
    },
    {
        icon: FolderPlus,
        title: 'Add a collection',
        description:
            'Use the folder-plus button in the Collections header to create a new collection.',
    },
    {
        icon: Folder,
        title: 'Groups inside collections',
        description:
            'Groups keep related documents together. Click a group name to open its page and see all posts.',
    },
    {
        icon: Plus,
        title: 'Add a new group',
        description:
            'Use the + button on a collection row to create a group directly within that collection.',
    },
    {
        icon: ChevronRight,
        title: 'Expand groups to show documents',
        description:
            'Click the arrow next to a group. It rotates and points down to reveal the documents inside.',
    },
    {
        icon: GripVertical,
        title: 'Reorder documents',
        description:
            'Drag by the handle next to a document to reorder within its group. Changes save automatically.',
    },
    {
        icon: Eye,
        title: 'Publish status at a glance',
        description:
            'Documents show an eye icon when published and a crossed eye when not visible to readers.',
    },
    {
        icon: MoreHorizontal,
        title: 'Quick actions & links',
        description:
            'Use the ••• menu to edit or delete, and choose Copy Link to share a direct URL.',
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
                        Sidebar
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
                        Navigate, organize, and act from the sidebar
                    </h1>
                    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        Learn how collections, groups, and documents appear in the left rail, and
                        how to add, reorder, and manage items without leaving your flow.
                    </p>
                </div>
            </header>

            <div class="px-6 py-10 sm:px-10 lg:px-16">
                <div class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
                    <div
                        v-for="f in features"
                        :key="f.title"
                        class="flex h-full flex-col gap-3 rounded-xl border border-slate-200/50 bg-background-secondary p-4"
                    >
                        <div
                            class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        >
                            <component :is="f.icon" class="h-5 w-5" />
                        </div>
                        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {{ f.title }}
                        </h2>
                        <p class="text-sm text-slate-600 dark:text-slate-300">
                            {{ f.description }}
                        </p>
                    </div>
                </div>

                <section class="mx-auto mt-10 max-w-4xl space-y-4">
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Practical tips
                    </h2>
                    <div class="rounded-xl border border-slate-200/50 bg-background-secondary p-5">
                        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <li>
                                To add a collection, click the folder‑plus button in the Collections
                                header.
                            </li>
                            <li>
                                To add a group, click the + button on the desired collection row.
                            </li>
                            <li>
                                Click the chevron arrow next to a group to expand it; when open it
                                points down and shows the group’s documents.
                            </li>
                            <li>
                                Click a group name to navigate to its overview page listing all
                                documents in that group.
                            </li>
                            <li>
                                Reorder documents by grabbing the dotted handle, not the title link.
                            </li>
                            <li>
                                Use the ••• menu on collections, groups, or documents to edit,
                                delete, or copy a direct link.
                            </li>
                            <li>
                                Published docs show an eye icon; use the Preview page to change
                                visibility when ready.
                            </li>
                        </ul>
                        <div class="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
                            <Link2 class="h-4 w-4" />
                            Pro tip: copy links from the menu to share precise destinations.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </DocumentLayout>
</template>
