<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Component } from 'vue'
import type { DocumentStatus } from '~/types/status'
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import {
    EllipsisVertical,
    SquarePen,
    Link2,
    Trash2,
    CalendarDays,
    CircleUser,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    ChevronDown,
    Check,
} from 'lucide-vue-next'
import { useRoute, useRouter } from '#imports'
import { usePostStore } from '~/core/store/post'
import { displayDate } from '@/core/utils/date'
import { toast } from 'vue-sonner'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'
import ModalDeletePost from '@/feature/layout/components/form/post/ModalDeletePost.vue'
import { buildAbsoluteUrl } from '~/core/helper/link'
import { useDocSidebar } from '~/feature/layout/stores/sidebar'

const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()

const collectionId = computed(() => Number(route.params.collectionId))
const groupId = computed(() => Number(route.params.groupId))
const postId = computed(() => Number(route.params.postId))

const postStore = usePostStore()
const post = computed(() => postStore.getPostDetailData(postId.value))
const isLoading = computed(() => postStore.isDetailLoading(postId.value))

const { $dompurify } = useNuxtApp()
const rawHtmlBody = computed(() => post.value?.postDetail.detailFormat ?? '')
const safeHtmlBody = computed(() =>
    rawHtmlBody.value ? $dompurify.sanitize(rawHtmlBody.value) : '',
)

const detail = computed(() => post.value?.postDetail)
const canTogglePublish = computed(() => detail.value?.status === 'COMPLETE')
const isPublished = computed(() => !!detail.value?.isPublish)
const isUpdatingPublish = ref(false)

const docTitle = computed(() => detail.value?.title?.trim() || 'Untitled document')
const docWriter = computed(() => detail.value?.writer?.trim() || 'Unknown')
const lastUpdatedLabel = computed(() =>
    detail.value?.updatedAt ? displayDate(detail.value.updatedAt) : 'Not updated yet',
)

const { copyLink } = useCopyLink()
const docSidebar = useDocSidebar()

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

type StatusOption = {
    value: DocumentStatus
    label: string
    icon: Component
    badgeClass: string
}

const STATUS_OPTIONS: StatusOption[] = [
    {
        value: 'DRAFT',
        label: 'Draft',
        icon: SquarePen,
        badgeClass:
            'bg-[var(--status-yellow-bg)] text-yellow-800 dark:text-[var(--status-yellow-border)] px-2 py-0.5 text-[11px]',
    },
    {
        value: 'COMPLETE',
        label: 'Complete',
        icon: CheckCircle,
        badgeClass:
            'bg-[var(--status-green-bg)] text-green-800 dark:text-[var(--status-green-border)] px-2 py-0.5 text-[11px]',
    },
]

const currentStatus = computed<DocumentStatus>(() =>
    detail.value?.status === 'COMPLETE' ? 'COMPLETE' : 'DRAFT',
)
const statusBadgeOption = computed(
    () =>
        STATUS_OPTIONS.find((option) => option.value === currentStatus.value) ?? STATUS_OPTIONS[0],
)
const statusLabel = computed(() => statusBadgeOption.value.label)

const isUpdatingStatus = ref(false)
const visibilityLabel = computed(() => (isPublished.value ? 'Published' : 'Unpublished'))

const disablePublishToggle = computed(() => !canTogglePublish.value || isUpdatingPublish.value)

const isContentEmpty = computed(() => {
    if (isLoading.value) return false
    return rawHtmlBody.value.trim().length === 0
})

const editRoute = computed(() => ({
    name: 'collectionId-groupId-postId-edit',
    params: { collectionId: collectionId.value, groupId: groupId.value, postId: postId.value },
}))

const onTogglePublish = async (nextChecked: boolean) => {
    const id = postId.value
    if (!id) return
    if (!canTogglePublish.value) return

    const prevChecked = isPublished.value
    if (prevChecked === nextChecked) return

    try {
        isUpdatingPublish.value = true
        await postStore.setPublish(id, nextChecked)
        toast.success(nextChecked ? 'Published' : 'Unpublished')
    } catch (err) {
        await postStore.refreshPostDetail(id)
        toastActionError('update', 'Publish status', err)
    } finally {
        isUpdatingPublish.value = false
    }
}

const handlePublishToggle = (next: boolean) => {
    if (disablePublishToggle.value) return
    if (isPublished.value === next) return
    onTogglePublish(next)
}

const neighbors = computed(() => postStore.getPostNeighborsByGroup(groupId.value, postId.value))
const prevPostId = computed(() => neighbors.value.prevId)
const nextPostId = computed(() => neighbors.value.nextId)

const getNeighborTitle = (id: number | null) => {
    if (!id) return ''
    return postStore.getPostDetailData(id)?.postDetail.title ?? ''
}

const prevPostTitle = computed(() => getNeighborTitle(prevPostId.value))
const nextPostTitle = computed(() => getNeighborTitle(nextPostId.value))

type ModalPost = { dayworkDocumentPostID: number; title: string }
const isDeletePostDialogOpen = ref(false)
const selectedPost = ref<ModalPost | undefined>(undefined)
const makeModalPost = (): ModalPost | undefined => {
    const p = post.value?.postDetail
    if (!p?.dayworkDocumentPostID) return
    return { dayworkDocumentPostID: p.dayworkDocumentPostID, title: p.title ?? '' }
}
const openDeleteDialog = () => {
    selectedPost.value = makeModalPost()
    if (selectedPost.value) isDeletePostDialogOpen.value = true
}
const closeDeleteDialog = () => {
    isDeletePostDialogOpen.value = false
    selectedPost.value = undefined
}

const computeRedirectTarget = () => {
    const { prevId, nextId } = postStore.getPostNeighborsByGroup(groupId.value, postId.value)
    return nextId ?? prevId ?? null
}
const redirectAfterDelete = async () => {
    const target = computeRedirectTarget()
    await Promise.all([
        postStore.refreshPostSidebar(groupId.value),
        postStore.refreshPostList(groupId.value),
        postStore.preparePostOrder(groupId.value),
    ])
    if (target) {
        router.push({
            name: 'collectionId-groupId-postId',
            params: { collectionId: collectionId.value, groupId: groupId.value, postId: target },
        })
    } else {
        router.push({
            name: 'collectionId-groupId',
            params: { collectionId: collectionId.value, groupId: groupId.value },
        })
    }
}

const changeStatus = async (nextStatus: DocumentStatus) => {
    const id = postId.value
    if (!id) return
    if (currentStatus.value === nextStatus) return
    if (isUpdatingStatus.value) return

    try {
        isUpdatingStatus.value = true
        await postStore.setStatus(id, nextStatus)
        if (nextStatus === 'DRAFT') {
            toastActionSuccess('update', 'Marked as draft')
        } else {
            toast.success('Marked as complete')
        }
    } catch (err) {
        toastActionError('update', 'Status', err)
    } finally {
        isUpdatingStatus.value = false
    }
}

const onCopyDocumentLink = async () => {
    const id = postId.value
    if (!id) return
    const collectionSlugValue = collectionSlug.value
    const groupSlugValue = groupSlug.value
    if (!collectionSlugValue || !groupSlugValue) return

    const url = buildAbsoluteUrl({
        kind: 'post',
        collectionSlug: collectionSlugValue,
        groupSlug: groupSlugValue,
        postId: id,
    })
    copyLink(url)
}

onMounted(async () => {
    try {
        await breadcrumbs.setFromRoute(route)
        await Promise.all([
            postStore.isPostDetail(postId.value),
            postStore.preparePostOrder(groupId.value),
        ])
    } catch (error) {
        toastActionError('load', 'document detail', error)
    }
})
</script>

<template>
    <DocumentLayout class="flex flex-col">
        <section
            class="border-b border-gray-200 bg-gradient-to-br from-primary/8 via-transparent to-transparent px-4 py-4 dark:border-gray-700 sm:px-6 sm:py-5 lg:px-8"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div class="min-w-0 space-y-2">
                        <div
                            class="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                        >
                            <span class="text-text-main">Document preview</span>
                        </div>

                        <h1 class="text-xl font-semibold text-primary sm:text-2xl">
                            {{ docTitle }}
                        </h1>

                        <div
                            class="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm"
                        >
                            <span class="flex items-center gap-2">
                                <CircleUser class="size-4" />
                                <span>{{ docWriter }}</span>
                            </span>
                            <span class="flex items-center gap-2">
                                <CalendarDays class="size-4" />
                                <span>{{ lastUpdatedLabel }}</span>
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col items-end gap-3">
                        <div class="flex flex-wrap items-center justify-end gap-2">
                            <DocButton
                                variant="default"
                                size="sm"
                                :as-child="true"
                                class="gap-2"
                                :disabled="isLoading"
                            >
                                <NuxtLink :to="editRoute">
                                    <SquarePen class="size-4" />
                                    <span>Edit document</span>
                                </NuxtLink>
                            </DocButton>

                            <DocDropdownMenu>
                                <DocDropdownMenuTrigger as-child>
                                    <DocButton
                                        variant="ghost"
                                        size="icon"
                                        aria-label="More actions"
                                    >
                                        <EllipsisVertical :size="18" />
                                    </DocButton>
                                </DocDropdownMenuTrigger>
                                <DocDropdownMenuContent
                                    class="z-[60] w-64 border-gray-300"
                                    side="bottom"
                                    align="end"
                                >
                                    <DocDropdownMenuItem
                                        class="flex cursor-pointer items-center gap-2 status-gray"
                                        @click="onCopyDocumentLink"
                                    >
                                        <Link2 />
                                        <span>Copy link</span>
                                    </DocDropdownMenuItem>

                                    <DocDropdownMenuSeparator />

                                    <DocDropdownMenuItem
                                        class="flex cursor-pointer items-center gap-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                                        @click="openDeleteDialog"
                                    >
                                        <Trash2 class="text-red-500" />
                                        <span>Delete</span>
                                    </DocDropdownMenuItem>
                                </DocDropdownMenuContent>
                            </DocDropdownMenu>
                        </div>

                        <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <DocDropdownMenu>
                                <DocDropdownMenuTrigger as-child>
                                    <button
                                        type="button"
                                        class="focus:outline-none"
                                        :class="
                                            isUpdatingStatus
                                                ? 'cursor-wait opacity-80'
                                                : 'cursor-pointer'
                                        "
                                    >
                                        <DocBadge
                                            :class="[
                                                statusBadgeOption.badgeClass,
                                                'flex items-center gap-1 transition-colors',
                                            ]"
                                        >
                                            <component
                                                :is="statusBadgeOption.icon"
                                                class="size-3"
                                            />
                                            <span>{{ statusLabel }}</span>
                                            <ChevronDown class="size-3" />
                                        </DocBadge>
                                    </button>
                                </DocDropdownMenuTrigger>
                                <DocDropdownMenuContent
                                    class="z-[65] w-40 border-gray-300"
                                    side="bottom"
                                    align="start"
                                >
                                    <DocDropdownMenuItem
                                        v-for="option in STATUS_OPTIONS"
                                        :key="option.value"
                                        :class="[
                                            'flex w-full items-center gap-2 status-gray text-xs',
                                            option.value === currentStatus ? 'text-primary' : '',
                                            isUpdatingStatus
                                                ? 'pointer-events-none opacity-60'
                                                : 'cursor-pointer',
                                        ]"
                                        @click="
                                            () => !isUpdatingStatus && changeStatus(option.value)
                                        "
                                    >
                                        <component :is="option.icon" class="size-3" />
                                        <span class="flex-1">{{ option.label }}</span>
                                        <Check
                                            v-if="option.value === currentStatus"
                                            class="size-3"
                                        />
                                    </DocDropdownMenuItem>
                                </DocDropdownMenuContent>
                            </DocDropdownMenu>
                            <DocSwitch
                                :model-value="isPublished"
                                :disabled="disablePublishToggle"
                                class="h-4 w-9 cursor-pointer"
                                thumb-class="h-2 w-3"
                                aria-label="Toggle publish status"
                                @update:model-value="handlePublishToggle"
                            />
                            <span>{{ visibilityLabel }}</span>
                            <span
                                v-if="disablePublishToggle"
                                class="text-[10px] font-medium text-amber-600"
                            >
                                Complete to publish
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <div v-if="isLoading" class="flex justify-center py-16">
                    <DocSpinner />
                </div>
                <div
                    v-else-if="isContentEmpty"
                    class="flex flex-col items-center justify-center gap-5 rounded-md border border-dashed border-gray-300 bg-section-bg px-6 py-16 text-center dark:border-gray-700"
                >
                    <div
                        class="flex h-16 w-16 items-center justify-center rounded-md bg-primary/10 text-primary"
                    >
                        <FileText class="h-8 w-8" />
                    </div>
                    <div class="space-y-2">
                        <h2 class="text-lg font-semibold">No content yet</h2>
                        <p class="max-w-md text-sm text-muted-foreground">
                            Start editing to add content to this document. Once saved, the preview
                            will appear here.
                        </p>
                    </div>
                    <DocButton :as-child="true" class="gap-2">
                        <NuxtLink :to="editRoute">
                            <SquarePen class="size-4" />
                            <span>Open editor</span>
                        </NuxtLink>
                    </DocButton>
                </div>
                <div
                    v-else
                    class="rounded-md bg-background-primary shadow-sm ring-1 ring-gray-200/60 p-6"
                >
                    <article
                        class="prose prose-sm max-w-none sm:prose-base lg:prose-lg"
                        v-html="safeHtmlBody"
                    />
                </div>
            </div>
        </div>

        <footer
            class="border-t border-gray-200 bg-section-bg px-4 py-4 dark:border-gray-700 sm:px-6 lg:px-10"
        >
            <div class="flex flex-wrap items-center justify-between gap-3">
                <template v-if="prevPostId">
                    <DocButton
                        variant="ghost"
                        size="sm"
                        :as-child="true"
                        class="gap-2 text-muted-foreground hover:text-primary"
                    >
                        <NuxtLink
                            :to="{
                                name: 'collectionId-groupId-postId',
                                params: { collectionId, groupId, postId: prevPostId },
                            }"
                        >
                            <ChevronLeft class="size-4" />
                            <span class="max-w-[220px] truncate text-left">
                                {{ prevPostTitle || 'Previous document' }}
                            </span>
                        </NuxtLink>
                    </DocButton>
                </template>
                <span v-else class="text-sm text-muted-foreground">No previous document</span>

                <template v-if="nextPostId">
                    <DocButton
                        variant="ghost"
                        size="sm"
                        :as-child="true"
                        class="gap-2 text-muted-foreground hover:text-primary"
                    >
                        <NuxtLink
                            :to="{
                                name: 'collectionId-groupId-postId',
                                params: { collectionId, groupId, postId: nextPostId },
                            }"
                        >
                            <span class="max-w-[220px] truncate text-right">
                                {{ nextPostTitle || 'Next document' }}
                            </span>
                            <ChevronRight class="size-4" />
                        </NuxtLink>
                    </DocButton>
                </template>
                <span v-else class="text-sm text-muted-foreground">No next document</span>
            </div>
        </footer>

        <DocAlertDialog :open="isDeletePostDialogOpen">
            <ModalDeletePost
                v-if="selectedPost"
                :post="selectedPost"
                :require-title-confirm="false"
                @deleted="
                    async () => {
                        closeDeleteDialog()
                        await redirectAfterDelete()
                    }
                "
                @cancel="closeDeleteDialog"
            />
        </DocAlertDialog>
    </DocumentLayout>
</template>
