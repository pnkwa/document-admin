<script setup lang="ts">
import {
    Trash2,
    MoreHorizontal,
    FileText,
    CheckCircle,
    SquarePen,
    Eye,
    EyeOff,
    BookAlert,
    Link2,
    ChevronRight,
    Plus,
    Search,
    ArrowUpDown,
    CircleUser,
    CalendarDays,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { ref, computed, useTemplateRef } from 'vue'
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import { useIntersectionObserver, watchDebounced } from '@vueuse/core'
import type { SelectedPostStatus } from '~/types/status'
import { toastActionError } from '~/feature/layout/utils/toast-helper'
import { usePostStore } from '~/core/store/post'
import { toast } from 'vue-sonner'
import { displayDate } from '~/core/utils/date'
import { extractTotals } from '~/core/utils/post-list-totals'
import ModalDeletePost from '@/feature/layout/components/form/post/ModalDeletePost.vue'
import type { PostList } from '~/core/types/components/post'
import { useDocSidebar } from '~/feature/layout/stores/sidebar'
const { copyLink } = useCopyLink()
const docSidebar = useDocSidebar()
const postStore = usePostStore()

const PAGE_SIZE = 10

const route = useRoute()
const router = useRouter()
const groupId = computed(() => Number(route.params.groupId))
const collectionId = computed(() => Number(route.params.collectionId))

const currentPostList = computed(() => postStore.getPostListData(groupId.value))
const totals = computed(() => extractTotals(currentPostList.value))
const isLoading = computed(() => postStore.isListLoading(groupId.value))

const selectedStatus = ref<SelectedPostStatus>('ALL')
const searchText = ref('')
const sanitizedSearchText = computed(() => searchText.value.trim())
const docs = computed(() => postStore.getDocsOrdered(groupId.value) ?? [])
const isLatest = computed(() => postStore.getOrderMode(groupId.value) === 'latest')
const toggleLatest = () => {
    postStore.setOrderMode(groupId.value, isLatest.value ? 'default' : 'latest')
}
const mapStatusToFilterByID = (status: SelectedPostStatus): 1 | 2 | 3 | 4 | undefined => {
    switch (status) {
        case 'DRAFT':
            return 1
        case 'COMPLETE':
            return 2
        case 'PUBLISH':
            return 3
        case 'UNPUBLISH':
            return 4
        default:
            return undefined
    }
}
const statusCards = [
    {
        key: 'ALL',
        label: 'All',
        icon: FileText,
        color: 'status-white',
        count: () => totals.value.total,
        filterable: true,
        description: 'Every document in this group.',
    },
    {
        key: 'DRAFT',
        label: 'Draft',
        icon: SquarePen,
        color: 'status-yellow',
        count: () => totals.value.totalDraft,
        filterable: true,
        description: 'Content still being worked on.',
    },
    {
        key: 'COMPLETE',
        label: 'Complete',
        icon: CheckCircle,
        color: 'status-green',
        count: () => totals.value.totalComplete,
        filterable: true,
        description: 'Finished drafts ready for review.',
    },
    {
        key: 'PUBLISH',
        label: 'Published',
        icon: Eye,
        color: 'status-blue',
        count: () => totals.value.totalPublish,
        filterable: true,
        description: 'Visible to anyone with access.',
    },
    {
        key: 'UNPUBLISH',
        label: 'Unpublished',
        icon: EyeOff,
        color: 'status-gray',
        count: () => totals.value.totalUnpublish,
        filterable: true,
        description: 'Hidden from readers for now.',
    },
] as const satisfies ReadonlyArray<{
    key: SelectedPostStatus
    label: string
    icon: Component
    color: string
    count: () => number
    filterable: boolean
    description: string
}>

const activeStatusCard = computed(() =>
    statusCards.find((card) => card.key === selectedStatus.value),
)

const filteredTotal = computed(() => activeStatusCard.value?.count() ?? totals.value.total)

const isFiltering = computed(
    () => selectedStatus.value !== 'ALL' || searchText.value.trim().length > 0,
)

const selectStatus = (card: (typeof statusCards)[number]) => {
    if (!card.filterable) return
    const key = card.key
    selectedStatus.value = selectedStatus.value === key ? 'ALL' : key
}

const clearFilters = () => {
    selectedStatus.value = 'ALL'
    searchText.value = ''
}

const rowLoading = ref<Record<number, boolean>>({})

const setRowLoading = (id: number, v: boolean) => (rowLoading.value[id] = v)
const isRowLoading = (id: number) => !!rowLoading.value[id]

const canTogglePublishFor = (doc: PostList) => doc.status === 'COMPLETE'

const togglePublishFromMenu = async (doc: PostList) => {
    const id = doc.dayworkDocumentPostID
    if (!id) return
    if (!canTogglePublishFor(doc)) {
        toast('Only COMPLETE docs can be published.')
        return
    }
    if (isRowLoading(id)) return
    try {
        setRowLoading(id, true)
        const next = !doc.isPublish
        await postStore.setPublish(id, next)

        await postStore.refreshPostList(groupId.value)
        toast.success(next ? 'Published' : 'Unpublished')
    } catch (err) {
        toastActionError('update', 'Publish status', err)
    } finally {
        setRowLoading(id, false)
    }
}

const markAsDraft = async (doc: PostList) => {
    const id = doc.dayworkDocumentPostID
    if (!id || isRowLoading(id)) return
    try {
        setRowLoading(id, true)
        await postStore.setStatus(id, 'DRAFT')
        await postStore.refreshPostList(groupId.value)
        toast.success('Marked as draft')
    } catch (err) {
        toastActionError('update', 'Status', err)
    } finally {
        setRowLoading(id, false)
    }
}

const markAsComplete = async (doc: PostList) => {
    const id = doc.dayworkDocumentPostID
    if (!id || isRowLoading(id)) return
    try {
        setRowLoading(id, true)
        await postStore.setStatus(id, 'COMPLETE')
        await postStore.refreshPostList(groupId.value)
        toast.success('Marked as complete')
    } catch (err) {
        toastActionError('update', 'Status', err)
    } finally {
        setRowLoading(id, false)
    }
}

const collectionSlug = computed(() => {
    const id = collectionId.value
    if (!collectionId.value) return undefined
    return docSidebar.collections.find(
        (collection) => collection.dayworkDocumentCollectionID === id,
    )?.slug
})

const groupSlug = computed(() => {
    const cId = collectionId.value
    const gId = groupId.value
    if (!cId || !gId) return undefined
    const groups = docSidebar.groupsMap[cId]
    return groups?.find((group) => group.dayworkDocumentGroupID === gId)?.slug
})

const onCopyDocumentLink = async (postId: number) => {
    if (!postId) return
    const collectionSlugValue = collectionSlug.value
    const groupSlugValue = groupSlug.value
    if (!collectionSlugValue || !groupSlugValue) return

    const url = buildAbsoluteUrl({
        kind: 'post',
        collectionSlug: collectionSlugValue,
        groupSlug: groupSlugValue,
        postId: postId,
    })
    copyLink(url)
}

type ModalPost = { dayworkDocumentPostID: number; title: string }
const isDeletePostDialogOpen = ref(false)
const selectedPost = ref<ModalPost | undefined>(undefined)

const openDeleteDialogFor = (doc: PostList) => {
    selectedPost.value = {
        dayworkDocumentPostID: doc.dayworkDocumentPostID,
        title: doc.title ?? '',
    }
    isDeletePostDialogOpen.value = true
}
const closeDeleteDialog = () => {
    isDeletePostDialogOpen.value = false
    selectedPost.value = undefined
}

const isPostEmpty = computed(() => !isLoading.value && docs.value.length === 0)

const selectedStatusLabel = computed(() =>
    selectedStatus.value === 'ALL' ? '' : `${selectedStatus.value} `,
)
const target = useTemplateRef<HTMLDivElement>('target')
const scrollContainer = useTemplateRef<HTMLDivElement>('scrollContainer')
const canLoadMore = computed(() => currentPostList.value.postList.length < filteredTotal.value)
const isReloading = ref(false)
const showInitialSpinner = computed(() => isReloading.value && docs.value.length === 0)
const showLoadMoreSpinner = computed(
    () => !isReloading.value && isLoading.value && docs.value.length > 0,
)
const showStatusSpinner = computed(() => isReloading.value)
useIntersectionObserver(
    target,
    async ([entry]) => {
        if (!entry?.isIntersecting || isLoading.value || !canLoadMore.value) return
        try {
            await postStore.loadMorePosts(groupId.value)
        } catch (err) {
            toastActionError('load', 'more documents', err)
        }
    },
    { threshold: 0, root: scrollContainer, rootMargin: '0px 0px 200px 0px' },
)

const breadcrumbs = useBreadcrumbs()

const newDocLink = ref<string | undefined>(undefined)
const isCreating = ref(false)

const handleNewDocument = async () => {
    const gid = groupId.value
    const cid = collectionId.value

    try {
        isCreating.value = true

        const beforeList = postStore.getPostListData(gid).postList
        const beforeIds = new Set(beforeList.map((p) => p.dayworkDocumentPostID))
        const nextSorting = beforeList.length + 1

        await createPost({
            dayworkDocumentGroupID: gid,
            sorting: nextSorting,
        })

        await Promise.all([postStore.refreshPostList(gid), postStore.refreshPostSidebar(gid)])
        const afterList = postStore.getPostListData(gid).postList

        let newItem = afterList.find((p) => !beforeIds.has(p.dayworkDocumentPostID))
        if (!newItem) {
            newItem = [...afterList].sort(
                (a, b) => (b.dayworkDocumentPostID ?? 0) - (a.dayworkDocumentPostID ?? 0),
            )[0]
        }
        if (!newItem) {
            newItem = afterList.find((p) => p.sorting === nextSorting)
        }
        if (newItem?.dayworkDocumentPostID) {
            newDocLink.value = `/${cid}/${gid}/${newItem.dayworkDocumentPostID}/edit`
            router.push(newDocLink.value)
        } else {
            toast('Cannot find created document in the refreshed list.')
        }
    } catch (error) {
        toastActionError('create', 'document', error)
    } finally {
        isCreating.value = false
    }
}

const toDocPreview = (postId: number) => ({
    name: 'collectionId-groupId-postId',
    params: { collectionId: collectionId.value, groupId: groupId.value, postId },
})

const goToPreview = (postId: number) => {
    router.push(toDocPreview(postId))
}

const fetchFirstPage = async () => {
    isReloading.value = true
    try {
        await postStore.refreshPostList(groupId.value, {
            page: 1,
            perPage: PAGE_SIZE,
            searchText: sanitizedSearchText.value || undefined,
            filterByID: mapStatusToFilterByID(selectedStatus.value),
        })
    } finally {
        isReloading.value = false
    }
}

const highlightParts = (text: string | undefined, term: string) => {
    if (!text) return []
    if (!term.trim()) return [{ text, match: false }]

    const regExp = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text
        .split(regExp)
        .filter(Boolean)
        .map((part) => {
            regExp.lastIndex = 0
            return {
                text: part,
                match: regExp.test(part),
            }
        })
}

const resetScrollPosition = () => {
    const container = scrollContainer.value
    if (!container) return
    if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, behavior: 'auto' })
    } else {
        container.scrollTop = 0
    }
}

onMounted(async () => {
    try {
        await Promise.all([fetchFirstPage(), postStore.refreshPostSidebar(groupId.value)])
        await breadcrumbs.setFromRoute(route)
    } catch (error) {
        toastActionError('load', 'documents', error)
    }
})

watchDebounced(
    () => [selectedStatus.value, sanitizedSearchText.value],
    async () => {
        resetScrollPosition()
        await fetchFirstPage()
    },
    { debounce: 400, maxWait: 1500 },
)
</script>

<template>
    <DocumentLayout class="flex flex-col">
        <section
            class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary/5 via-transparent to-transparent px-4 sm:px-6 lg:px-10 py-6 sm:py-8"
        >
            <div class="flex flex-col gap-6">
                <div
                    class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                    <div class="space-y-1.5">
                        <p
                            class="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
                        >
                            Snapshot
                        </p>
                        <h3 class="text-xl sm:text-2xl font-semibold text-primary">
                            Document overview
                        </h3>
                        <p class="max-w-2xl text-sm text-muted-foreground">
                            Spot the state of this group at a glance and jump straight to what needs
                            attention.
                        </p>
                    </div>
                    <DocButton
                        class="self-start sm:self-auto"
                        :loading="isCreating"
                        @click="handleNewDocument"
                    >
                        <Plus class="size-4" />
                        <span>{{ isCreating ? 'Creating…' : 'New document' }}</span>
                    </DocButton>
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <button
                        v-for="card in statusCards"
                        :key="card.key"
                        type="button"
                        class="status-card group relative overflow-hidden rounded-md border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        :class="[
                            card.color,
                            selectedStatus === card.key
                                ? 'status-card--active ring-2 ring-primary/40 shadow-md shadow-primary/10'
                                : 'hover:shadow-sm',
                            card.filterable ? 'cursor-pointer' : 'cursor-default opacity-80',
                        ]"
                        :aria-pressed="selectedStatus === card.key"
                        :aria-label="`Show ${card.label.toLowerCase()} documents`"
                        @click="selectStatus(card)"
                        @keydown.enter.prevent="selectStatus(card)"
                        @keydown.space.prevent="selectStatus(card)"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="status-icon rounded-md text-white ring-1 ring-white/10 shadow-sm"
                                >
                                    <component :is="card.icon" class="size-4 text-navy-60" />
                                </div>
                                <div>
                                    <p
                                        class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        {{ card.label }}
                                    </p>
                                    <p class="text-2xl font-semibold text-text-main">
                                        <span
                                            class="relative inline-flex min-w-[3ch] justify-center"
                                        >
                                            <span
                                                :class="
                                                    showStatusSpinner ? 'opacity-0' : 'opacity-100'
                                                "
                                            >
                                                {{ card.count() }}
                                            </span>
                                            <DocSpinner
                                                v-if="showStatusSpinner"
                                                class="absolute inset-0 m-auto h-4 w-4 text-primary"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                class="size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:opacity-60"
                            />
                        </div>
                        <p class="mt-3 text-xs leading-relaxed text-muted-foreground">
                            {{ card.description }}
                        </p>
                    </button>
                </div>
            </div>
        </section>

        <section
            class="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10"
        >
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <h3 class="text-primary font-medium">Documents</h3>
                <DocBadge variant="secondary" class="text-xs">{{ totals.total }} total</DocBadge>
                <DocBadge
                    v-if="selectedStatus !== 'ALL'"
                    class="flex items-center gap-1 text-xs bg-primary/10 text-primary dark:bg-primary/20"
                >
                    <component
                        :is="activeStatusCard ? activeStatusCard.icon : FileText"
                        class="size-3"
                    />
                    <span>
                        {{ activeStatusCard ? activeStatusCard.label : 'All' }}
                        • {{ activeStatusCard ? activeStatusCard.count() : totals.total }}
                    </span>
                </DocBadge>
                <DocBadge
                    v-if="searchText"
                    class="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                >
                    "{{ searchText }}"
                </DocBadge>
            </div>
            <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <div class="relative w-full sm:w-64">
                    <Search
                        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        v-model="searchText"
                        type="search"
                        placeholder="Search by title…"
                        class="w-full rounded-md border border-navy-20 bg-background-secondary py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-900/60"
                        aria-label="Search documents"
                    />
                </div>
                <DocButton
                    variant="outline"
                    size="sm"
                    :class="isLatest ? 'border-primary text-primary ring-2 ring-primary/30' : ''"
                    @click="toggleLatest"
                >
                    <ArrowUpDown class="size-4" />
                    <span>{{ isLatest ? 'Sorted: Latest update' : 'Sort by latest update' }}</span>
                </DocButton>
                <DocButton
                    v-if="isFiltering"
                    variant="ghost"
                    size="sm"
                    class="text-muted-foreground hover:text-primary"
                    @click="clearFilters"
                >
                    Clear filters
                </DocButton>
            </div>
        </section>

        <div ref="scrollContainer" class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
            <div v-if="showInitialSpinner" class="flex items-center justify-center py-10">
                <DocSpinner />
            </div>
            <template v-else>
                <div
                    v-if="isPostEmpty"
                    class="flex flex-col items-center justify-center gap-5 rounded-md border border-dashed border-gray-300 bg-section-bg px-6 py-16 text-center dark:border-gray-700"
                >
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-sm dark:from-primary/20 dark:to-primary/5"
                    >
                        <BookAlert class="h-8 w-8" />
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold">No {{ selectedStatusLabel }}documents</h4>
                        <p class="max-w-md text-sm text-muted-foreground">
                            {{
                                selectedStatus === 'ALL'
                                    ? 'Looks a bit empty here. Start by creating your first document.'
                                    : 'No results for this filter. Try clearing it or adjusting your criteria.'
                            }}
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center justify-center gap-2">
                        <DocButton
                            v-if="selectedStatus !== 'ALL' || searchText"
                            variant="outline"
                            @click="clearFilters"
                        >
                            Clear filters
                        </DocButton>
                        <DocButton :disabled="isCreating" @click="handleNewDocument">
                            <Plus class="size-4" />
                            <span>{{ isCreating ? 'Creating…' : 'New document' }}</span>
                        </DocButton>
                    </div>
                </div>
                <div v-else class="space-y-6">
                    <div
                        class="flex flex-wrap items-center justify-between text-xs text-muted-foreground"
                    >
                        <span>Showing {{ docs.length }} of {{ filteredTotal }} documents</span>
                        <span v-if="isFiltering">Active filters applied</span>
                    </div>
                    <ul class="space-y-3">
                        <li
                            v-for="doc in docs"
                            :key="doc.dayworkDocumentPostID"
                            role="button"
                            tabindex="0"
                            class="group/card relative rounded-md border border-navy-20 bg-background-primary p-5 transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                            @click="goToPreview(doc.dayworkDocumentPostID)"
                            @keydown.enter.prevent="goToPreview(doc.dayworkDocumentPostID)"
                            @keydown.space.prevent="goToPreview(doc.dayworkDocumentPostID)"
                        >
                            <div
                                class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
                            >
                                <div class="space-y-3">
                                    <h4
                                        class="text-lg font-semibold text-text-main transition-colors group-hover/card:text-primary"
                                    >
                                        <template
                                            v-for="(part, i) in highlightParts(
                                                doc.title || 'Untitled',
                                                searchText,
                                            )"
                                            :key="i"
                                        >
                                            <mark
                                                v-if="part.match"
                                                class="rounded bg-amber-100 px-1 py-0.5 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100"
                                            >
                                                {{ part.text }}
                                            </mark>
                                            <span v-else>{{ part.text }}</span>
                                        </template>
                                    </h4>

                                    <div
                                        class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm"
                                    >
                                        <span class="flex items-center gap-1">
                                            <CircleUser class="size-4" />
                                            <span>{{ doc.writer || 'Unknown' }}</span>
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <CalendarDays class="size-4" />
                                            <span>{{ displayDate(doc.updatedAt) }}</span>
                                        </span>
                                    </div>
                                </div>

                                <div class="flex flex-wrap items-center gap-2">
                                    <DocBadge
                                        class="flex items-center gap-1 px-2 py-0.5 text-xs"
                                        :class="[
                                            doc.status === 'COMPLETE'
                                                ? 'bg-[var(--status-green-bg)] text-green-800 dark:text-[var(--status-green-border)]'
                                                : 'bg-[var(--status-yellow-bg)] text-yellow-800 dark:text-[var(--status-yellow-border)]',
                                        ]"
                                        @click.stop
                                    >
                                        <component
                                            :is="
                                                doc.status === 'COMPLETE' ? CheckCircle : SquarePen
                                            "
                                            class="size-3"
                                        />
                                        <span>{{ doc.status }}</span>
                                    </DocBadge>

                                    <DocBadge
                                        v-if="doc.status === 'COMPLETE'"
                                        class="flex items-center gap-1 px-2 py-0.5 text-xs"
                                        :class="[
                                            doc.isPublish
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                                        ]"
                                        @click.stop
                                    >
                                        <component
                                            :is="doc.isPublish ? Eye : EyeOff"
                                            class="size-3"
                                        />
                                        <span>
                                            {{ doc.isPublish ? 'Published' : 'Unpublished' }}
                                        </span>
                                    </DocBadge>

                                    <DocDropdownMenu>
                                        <DocDropdownMenuTrigger as-child>
                                            <DocButton
                                                variant="ghost"
                                                size="icon"
                                                :disabled="isRowLoading(doc.dayworkDocumentPostID)"
                                                @click.stop
                                            >
                                                <MoreHorizontal :size="18" />
                                            </DocButton>
                                        </DocDropdownMenuTrigger>

                                        <DocDropdownMenuContent
                                            class="w-56 rounded-md"
                                            side="bottom"
                                            align="end"
                                            @click.stop
                                        >
                                            <DocDropdownMenuItem
                                                class="flex cursor-pointer items-center gap-2"
                                                :class="[
                                                    !canTogglePublishFor(doc) ||
                                                    isRowLoading(doc.dayworkDocumentPostID)
                                                        ? 'pointer-events-none opacity-60'
                                                        : '',
                                                ]"
                                                @click="togglePublishFromMenu(doc)"
                                            >
                                                <Eye v-if="!doc.isPublish" />
                                                <EyeOff v-else />
                                                <span>
                                                    {{ doc.isPublish ? 'Unpublish' : 'Publish' }}
                                                </span>
                                            </DocDropdownMenuItem>

                                            <DocDropdownMenuItem
                                                v-if="doc.status !== 'DRAFT'"
                                                class="flex cursor-pointer items-center gap-2 status-gray"
                                                :class="
                                                    isRowLoading(doc.dayworkDocumentPostID)
                                                        ? 'pointer-events-none opacity-60'
                                                        : ''
                                                "
                                                @click="markAsDraft(doc)"
                                            >
                                                <SquarePen />
                                                <span>Mark as draft</span>
                                            </DocDropdownMenuItem>

                                            <DocDropdownMenuItem
                                                v-else
                                                class="flex cursor-pointer items-center gap-2 status-gray"
                                                :class="
                                                    isRowLoading(doc.dayworkDocumentPostID)
                                                        ? 'pointer-events-none opacity-60'
                                                        : ''
                                                "
                                                @click="markAsComplete(doc)"
                                            >
                                                <CheckCircle />
                                                <span>Mark as complete</span>
                                            </DocDropdownMenuItem>

                                            <DocDropdownMenuItem
                                                class="flex cursor-pointer items-center gap-2 status-gray"
                                                @click="
                                                    onCopyDocumentLink(doc.dayworkDocumentPostID)
                                                "
                                            >
                                                <Link2 />
                                                <span>Copy link</span>
                                            </DocDropdownMenuItem>

                                            <DocDropdownMenuItem
                                                class="flex cursor-pointer items-center gap-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                                                @click="openDeleteDialogFor(doc)"
                                            >
                                                <Trash2 class="text-red-500" />
                                                <span>Delete</span>
                                            </DocDropdownMenuItem>
                                        </DocDropdownMenuContent>
                                    </DocDropdownMenu>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div v-if="showLoadMoreSpinner" class="flex items-center justify-center py-10">
                        <DocSpinner />
                    </div>
                    <div ref="target" class="h-4" />
                </div>
            </template>
        </div>
        <DocAlertDialog :open="isDeletePostDialogOpen">
            <ModalDeletePost
                v-if="selectedPost"
                :post="selectedPost"
                :require-title-confirm="false"
                @deleted="
                    async () => {
                        closeDeleteDialog()
                    }
                "
                @cancel="closeDeleteDialog"
            />
        </DocAlertDialog>
    </DocumentLayout>
</template>
