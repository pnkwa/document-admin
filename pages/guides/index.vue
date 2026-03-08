<script setup lang="ts">
import { PencilRuler, ChevronRight, FileText, Boxes, Rocket, PanelLeft } from 'lucide-vue-next'
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'

const breadcrumbs = useBreadcrumbs()

onMounted(() => {
    breadcrumbs.set([{ label: 'Home', to: '/' }, { label: 'Guides' }])
})

const guides = [
    {
        title: 'Product Overview',
        description:
            'Understand collections, groups, and documents so your workspace mirrors how your team thinks.',
        icon: Boxes,
        to: '/guides/overview',
    },
    {
        title: 'Sidebar & Navigation',
        description:
            'Learn how to navigate, add groups, reorder documents, and use quick actions from the left rail.',
        icon: PanelLeft,
        to: '/guides/sidebar',
    },
    {
        title: 'Publishing & Statuses',
        description:
            'Learn how draft, complete, and publish states work together to keep everyone in sync.',
        icon: FileText,
        to: '/guides/publishing',
    },
    {
        title: 'Editor Tools',
        description:
            'Get quick tips on headings, embeds, columns, and shortcuts that speed up writing.',
        icon: PencilRuler,
        to: '/guides/toolsEditor',
    },
]
</script>

<template>
    <DocumentLayout>
        <div class="!min-h-[calc(100vh-107px)] overflow-y-auto">
            <header class="relative overflow-hidden border-b border-navy-20 bg-background-primary">
                <div
                    class="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_15%_-5%,theme(colors.primary/10),transparent),radial-gradient(600px_240px_at_85%_-15%,theme(colors.sky.500/12),transparent)] dark:bg-[radial-gradient(900px_320px_at_15%_-5%,theme(colors.primary/20),transparent),radial-gradient(600px_240px_at_85%_-15%,theme(colors.sky.400/18),transparent)]"
                />
                <div class="relative px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
                    <div class="mx-auto flex max-w-4xl flex-col gap-4">
                        <div
                            class="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary"
                        >
                            <Rocket class="h-4 w-4" />
                            Start here
                        </div>
                        <div class="space-y-3">
                            <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
                                Master the docs workflow in minutes
                            </h1>
                            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                                These short guides show how to structure content, mark documents as
                                ready, and publish them for your team.
                            </p>
                        </div>
                        <NuxtLink
                            to="/"
                            class="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                        >
                            Back to Introduction
                            <ChevronRight class="h-4 w-4" />
                        </NuxtLink>
                    </div>
                </div>
            </header>

            <div class="px-6 sm:px-10 lg:px-16 py-10">
                <div class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
                    <NuxtLink
                        v-for="guide in guides"
                        :key="guide.to"
                        :to="guide.to"
                        class="group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-background-secondary p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md dark:border-white/50"
                    >
                        <div class="flex items-start gap-3">
                            <div
                                class="shrink-0 rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/20"
                            >
                                <component :is="guide.icon" class="h-5 w-5" />
                            </div>
                            <div class="space-y-1">
                                <h2 class="text-base font-semibold">{{ guide.title }}</h2>
                                <p class="text-sm text-slate-600 dark:text-slate-400">
                                    {{ guide.description }}
                                </p>
                            </div>
                        </div>
                        <span
                            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
                        >
                            Read guide
                            <ChevronRight class="h-4 w-4" />
                        </span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </DocumentLayout>
</template>
