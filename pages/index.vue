<script setup lang="ts">
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import { ref, reactive, onMounted } from 'vue'
import { Rocket, Wand2, Layers3, Share2, BookOpen } from 'lucide-vue-next'
import FormCreateCollection from '~/feature/layout/components/form/collection/FormCreateCollection.vue'
import { useDocSidebar } from '~/feature/layout/stores/sidebar'

const showBadge = ref(true)
const breadcrumbs = useBreadcrumbs()

const docSidebar = useDocSidebar()

onMounted(() => {
    breadcrumbs.set([{ label: 'Home', to: '/' }, { label: 'Introduction' }])
})

const vReveal = {
    mounted(el: HTMLElement) {
        el.classList.add('reveal-init')
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('reveal-in')
                        observer.unobserve(el)
                    }
                })
            },
            { threshold: 0.12 },
        )
        observer.observe(el)
    },
}

const quick = reactive({ open: false })

const startQuickCreate = () => {
    quick.open = true
}

const onCollectionSubmitted = async () => {
    await docSidebar.refreshCollections()
    quick.open = false
}
</script>

<template>
    <DocumentLayout>
        <div class="!min-h-[calc(100vh-107px)] overflow-y-auto">
            <header class="relative overflow-hidden min-h-[calc(100vh-107px)] flex items-center">
                <div
                    class="pointer-events-none absolute inset-0 aurora bg-[radial-gradient(1200px_400px_at_10%_-10%,theme(colors.primary/10),transparent),radial-gradient(800px_300px_at_80%_-20%,theme(colors.blue.500/10),transparent)] dark:bg-[radial-gradient(1200px_400px_at_10%_-10%,theme(colors.primary/20),transparent),radial-gradient(800px_300px_at_80%_-20%,theme(colors.blue.400/15),transparent)]"
                />
                <div class="relative px-6 sm:px-10 lg:px-16 py-12 sm:py-16 w-full">
                    <div class="max-w-6xl mx-auto text-center">
                        <div class="flex items-center justify-center gap-2 mb-3">
                            <Rocket class="h-5 w-5 text-primary" />
                            <span
                                v-if="showBadge"
                                class="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                            >
                                New • Getting started
                            </span>
                        </div>

                        <h1
                            v-reveal
                            style="--d: 0ms"
                            class="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
                        >
                            Build and publish your knowledge base
                        </h1>
                        <p
                            v-reveal
                            style="--d: 80ms"
                            class="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
                        >
                            Draft with confidence, organize by team or topic, and flip documents
                            live with a single click.
                        </p>

                        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <NuxtLink
                                v-reveal
                                style="--d: 120ms"
                                to="/guides"
                                class="inline-flex items-center gap-2 rounded-md bg-primary text-white px-5 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                aria-label="Open the guides"
                            >
                                <BookOpen class="h-4 w-4" />
                                Open the guides
                            </NuxtLink>
                            <button
                                v-reveal
                                style="--d: 160ms"
                                type="button"
                                class="inline-flex items-center gap-2 rounded-md border-2 border-primary text-primary bg-background-primary px-5 py-2 text-sm font-medium shadow-sm hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                                @click="startQuickCreate"
                            >
                                Create collection
                            </button>
                        </div>

                        <div class="mt-12 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
                            <div
                                v-reveal
                                style="--d: 140ms"
                                class="rounded-md border border-navy-20 bg-background-secondary p-5 flex gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    class="shrink-0 h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mx-auto"
                                >
                                    <Wand2 class="h-5 w-5 text-primary" />
                                </div>
                                <div class="text-center">
                                    <p class="font-medium">Write without friction</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">
                                        Block-based editing, auto-growing paragraphs, and auto-save
                                        keep you in the flow.
                                    </p>
                                </div>
                            </div>

                            <div
                                v-reveal
                                style="--d: 200ms"
                                class="rounded-md border border-navy-20 bg-background-secondary p-5 flex gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    class="shrink-0 h-10 w-10 rounded-md bg-sky-500/10 flex items-center justify-center mx-auto"
                                >
                                    <Layers3 class="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div class="text-center">
                                    <p class="font-medium">Organize by group</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">
                                        Collections frame the big picture, while groups keep related
                                        docs side by side for quick discovery.
                                    </p>
                                </div>
                            </div>

                            <div
                                v-reveal
                                style="--d: 260ms"
                                class="rounded-md border border-navy-20 bg-background-secondary p-5 flex gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    class="shrink-0 h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center mx-auto"
                                >
                                    <Share2
                                        class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                                    />
                                </div>
                                <div class="text-center">
                                    <p class="font-medium">Publish when ready</p>
                                    <p class="text-sm text-slate-600 dark:text-slate-400">
                                        Mark docs complete, flip visibility, and share a focused
                                        preview with your readers instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <DocAlertDialog v-model:open="quick.open">
                <DocAlertDialogContent class="z-[70]">
                    <FormCreateCollection
                        @submitted="onCollectionSubmitted"
                        @cancel="quick.open = false"
                        @updated="
                            async () => {
                                await docSidebar.refreshCollections()
                            }
                        "
                    />
                </DocAlertDialogContent>
            </DocAlertDialog>
        </div>
    </DocumentLayout>
</template>

<style scoped lang="scss">
$aurora-duration: 18s;
$reveal-distance: 8px;
$reveal-duration: 0.5s;
$reveal-ease: ease;

.aurora {
    background-position:
        0% 0%,
        100% 0%;
    animation: auroraMove $aurora-duration ease-in-out infinite;
}

@keyframes auroraMove {
    0% {
        background-position:
            0% 0%,
            100% 0%;
    }
    50% {
        background-position:
            22% 8%,
            78% 4%;
    }
    100% {
        background-position:
            0% 0%,
            100% 0%;
    }
}

.reveal-init {
    opacity: 0;
    transform: translateY($reveal-distance);
}
.reveal-in {
    opacity: 1;
    transform: translateY(0);
    transition:
        opacity $reveal-duration $reveal-ease,
        transform $reveal-duration $reveal-ease;
    transition-delay: var(--d, 0ms);
}

@media (prefers-reduced-motion: reduce) {
    .aurora {
        animation: none;
    }
    .reveal-in {
        transition: none;
    }
}
</style>
