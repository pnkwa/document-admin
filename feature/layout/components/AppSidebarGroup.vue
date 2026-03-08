<script setup lang="ts">
import {
    ChevronRight,
    EyeOff,
    Eye,
    Folder,
    FileText,
    MoreHorizontal,
    Trash2,
    Pencil,
    Link2,
    GripVertical,
} from 'lucide-vue-next'
import type { DropdownMenuItem } from '../types/dropdown-items'
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Group, Post } from '../types/tree-sidebar'

import ModalDeleteGroup from './form/group/ModalDeleteGroup.vue'
import FormEditGroup from './form/group/FormEditGroup.vue'
import ModalDeletePost from './form/post/ModalDeletePost.vue'

import { usePostStore } from '@/core/store/post'
import Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'

import { getMovedItemNewSorting, reorderNewArray } from '../utils/post-order'
import { toastActionError } from '../utils/toast-helper'
import { useCopyLink } from '~/core/composables/useCopyLink'
import { buildAbsoluteUrl } from '~/core/helper/link'

const { copyLink } = useCopyLink()

const props = defineProps<{
    group: Group
    collectionId: number
    collectionSlug: string
}>()

const postStore = usePostStore()

const isEditGroupDialogOpen = ref(false)
const isDeleteGroupDialogOpen = ref(false)
const isDeletePostDialogOpen = ref(false)
const isGroupMenuOpen = ref(false)
const actionBarOpen = computed(() => isGroupMenuOpen.value)

const route = useRoute()

const activePostId = computed(() => {
    const id = Number(route.params.postId)
    return isNaN(id) ? null : id
})

const selectedPost = ref<Post | undefined>(undefined)

const dropdownGroupItems: DropdownMenuItem[] = [
    { label: 'Edit', icon: Pencil, action: () => (isEditGroupDialogOpen.value = true) },
    {
        label: 'Delete',
        icon: Trash2,
        action: () => (isDeleteGroupDialogOpen.value = true),
        destructive: true,
    },
]

const openDeletePostDialog = (post: Post) => {
    selectedPost.value = post
    isDeletePostDialogOpen.value = true
}

const postHref = (doc: Post) => {
    return {
        name: 'collectionId-groupId-postId',
        params: {
            collectionId: props.collectionId,
            groupId: props.group.dayworkDocumentGroupID,
            postId: doc.dayworkDocumentPostID,
        },
    }
}

const onCopyPostLink = (post: Post) => {
    if (props.collectionId) {
        const url = buildAbsoluteUrl({
            kind: 'post',
            collectionSlug: props.collectionSlug,
            groupSlug: props.group.slug,
            postId: post.dayworkDocumentPostID,
        })
        copyLink(url)
    }
}

const containerEl = ref<HTMLElement | null>(null)
let sortable: Sortable | null = null

const groupId = computed(() => props.group.dayworkDocumentGroupID)

const postsForGroup = computed<Post[]>({
    get() {
        return postStore.postsSidebarMap[groupId.value] || []
    },
    set(v) {
        postStore.postsSidebarMap[groupId.value] = v
    },
})

const initSortable = () => {
    if (!containerEl.value) return
    sortable?.destroy()

    sortable = new Sortable(containerEl.value, {
        group: { name: `posts-${groupId.value}`, pull: false, put: false },
        animation: 150,
        draggable: '.sortable-item',
        handle: '.drag-handle',
        filter: 'a, button, .no-drag, [data-no-drag], .DocDropdownMenuTrigger, .DocSidebarMenuAction, .DocDropdownMenuItem',
        preventOnFilter: true,
        onUpdate: async (evt: SortableEvent) => {
            const { oldIndex, newIndex } = evt
            if (oldIndex == null || newIndex == null || oldIndex === newIndex) return

            const previousPosts = [...postsForGroup.value]
            const reorderedPosts = reorderNewArray(previousPosts, oldIndex, newIndex)
            postsForGroup.value = reorderedPosts

            const moved = reorderedPosts[newIndex]
            if (!moved) {
                postsForGroup.value = previousPosts
                return
            }

            const update = getMovedItemNewSorting(reorderedPosts, moved.dayworkDocumentPostID)

            if (!update) {
                postsForGroup.value = previousPosts
                return
            }

            const refreshedPosts = await postStore.updateOrderAndRefresh(
                groupId.value,
                update.id,
                update.newSorting,
            )

            postsForGroup.value = refreshedPosts
        },
    })
}
onMounted(async () => {
    try {
        await nextTick()
        initSortable()
    } catch (error) {
        toastActionError('load', 'Failed to initialize sortable items', error)
    }
})

watch(
    () => postStore.postsSidebarMap[groupId.value],
    async () => {
        await nextTick()
        initSortable()
    },
    { deep: true },
)

onBeforeUnmount(() => {
    sortable?.destroy()
    sortable = null
})

const onExpand = (isExpanded: boolean, id: number) => {
    if (isExpanded) {
        postStore.refreshPostSidebar(id)
    }
}
</script>

<template>
    <DocCollapsible
        :title="props.group.name"
        default-close
        class="group/folder"
        @update:open="(value) => onExpand(value, props.group.dayworkDocumentGroupID)"
    >
        <DocSidebarGroup>
            <div
                class="flex items-center gap-2 px-2 w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
                <DocSidebarGroupLabel as-child>
                    <div class="flex items-center gap-2 min-w-0">
                        <DocCollapsibleTrigger
                            class="inline-flex items-center"
                            aria-label="Toggle group"
                        >
                            <ChevronRight
                                :size="18"
                                class="transition-transform group-data-[state=open]/folder:rotate-90"
                            />
                        </DocCollapsibleTrigger>

                        <NuxtLink
                            :to="{
                                name: 'collectionId-groupId',
                                params: {
                                    collectionId: collectionId,
                                    groupId: group.dayworkDocumentGroupID,
                                },
                            }"
                        >
                            <div class="flex items-center gap-2 text-sm">
                                <Folder :size="18" />
                                <span class="truncate max-w-[140px] md:max-w-[220px]">
                                    {{ props.group.name }}
                                </span>
                            </div>
                        </NuxtLink>
                    </div>
                </DocSidebarGroupLabel>

                <div class="ml-auto w-20 md:w-24 flex justify-end">
                    <div
                        :class="[
                            'flex items-center gap-1 transition-opacity duration-150',
                            actionBarOpen
                                ? 'opacity-100 pointer-events-auto'
                                : 'opacity-0 pointer-events-none',
                            'group-hover/folder:opacity-100 group-hover/folder:pointer-events-auto',
                            'group-focus-within/folder:opacity-100 group-focus-within/folder:pointer-events-auto',
                        ]"
                    >
                        <DocDropdownMenu v-model:open="isGroupMenuOpen">
                            <DocDropdownMenuTrigger as-child>
                                <div
                                    class="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-muted/60"
                                    aria-label="Group actions"
                                    @click.stop
                                >
                                    <MoreHorizontal :size="18" :stroke-width="1.8" />
                                </div>
                            </DocDropdownMenuTrigger>

                            <DocDropdownMenuContent
                                class="z-[60] w-48 border-gray-300"
                                side="bottom"
                                align="start"
                            >
                                <template v-for="(item, i) in dropdownGroupItems" :key="i">
                                    <DocDropdownMenuItem
                                        :class="[
                                            item.destructive
                                                ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                                                : '',
                                            'flex gap-2 items-center status-gray cursor-pointer',
                                        ]"
                                        @click="
                                            () => {
                                                isGroupMenuOpen = false
                                                item.action()
                                            }
                                        "
                                    >
                                        <component
                                            :is="item.icon"
                                            :class="
                                                item.destructive
                                                    ? 'text-red-500'
                                                    : 'text-muted-foreground'
                                            "
                                        />
                                        <span>{{ item.label }}</span>
                                    </DocDropdownMenuItem>
                                </template>
                            </DocDropdownMenuContent>
                        </DocDropdownMenu>
                    </div>
                </div>
            </div>

            <DocAlertDialog :open="isEditGroupDialogOpen">
                <DocAlertDialogContent>
                    <FormEditGroup
                        :key="group.dayworkDocumentGroupID"
                        :group="group"
                        @updated="
                            () => {
                                isEditGroupDialogOpen = false
                            }
                        "
                        @cancel="
                            () => {
                                isEditGroupDialogOpen = false
                            }
                        "
                    />
                </DocAlertDialogContent>
            </DocAlertDialog>

            <DocAlertDialog :open="isDeleteGroupDialogOpen">
                <ModalDeleteGroup
                    :key="group.dayworkDocumentGroupID"
                    :group="group"
                    @deleted="
                        () => {
                            isDeleteGroupDialogOpen = false
                        }
                    "
                    @cancel="
                        () => {
                            isDeleteGroupDialogOpen = false
                        }
                    "
                />
            </DocAlertDialog>

            <DocCollapsibleContent>
                <DocSidebarGroupContent>
                    <DocSidebarMenu>
                        <div ref="containerEl" :data-group-id="groupId">
                            <DocSidebarMenuItem
                                v-for="doc in postsForGroup"
                                :key="doc.dayworkDocumentPostID"
                                class="sortable-item"
                                :data-id="doc.dayworkDocumentPostID"
                            >
                                <DocSidebarMenuButton as-child>
                                    <div
                                        class="flex justify-between items-center group/document relative hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition"
                                        :class="{
                                            'bg-primary/10 text-primary':
                                                activePostId === doc.dayworkDocumentPostID,
                                        }"
                                    >
                                        <div
                                            class="pl-2 drag-handle ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/70 transition opacity-0 pointer-events-none group-hover/document:opacity-100 group-hover/document:pointer-events-auto group-focus-within/document:opacity-100 group-focus-within/document:pointer-events-auto hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 cursor-grab active:cursor-grabbing"
                                            aria-label="Drag to reorder"
                                            @mousedown.stop
                                            @touchstart.stop
                                        >
                                            <GripVertical :size="16" class="text-navy-60" />
                                        </div>

                                        <NuxtLink
                                            :to="postHref(doc)"
                                            class="flex text-xs items-center w-full"
                                        >
                                            <div class="flex gap-2 items-center w-full">
                                                <FileText :size="18" :stroke-width="1.8" />
                                                <span class="truncate w-[120px] text-start">
                                                    {{ doc.title }}
                                                </span>
                                            </div>
                                        </NuxtLink>

                                        <div class="flex items-center gap-1 shrink-0">
                                            <component
                                                :is="doc.isPublish ? Eye : EyeOff"
                                                :size="13"
                                                :stroke-width="2"
                                                :class="
                                                    doc.isPublish
                                                        ? 'text-blue-500 dark:text-blue-300'
                                                        : 'text-navy-40'
                                                "
                                            />
                                            <DocDropdownMenu>
                                                <DocDropdownMenuTrigger as-child>
                                                    <DocSidebarMenuAction
                                                        class="no-drag peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-hover/document:opacity-100 data-[state=open]:opacity-100 md:opacity-0"
                                                    >
                                                        <MoreHorizontal
                                                            :size="18"
                                                            :stroke-width="1.8"
                                                        />
                                                    </DocSidebarMenuAction>
                                                </DocDropdownMenuTrigger>
                                                <DocDropdownMenuContent
                                                    class="z-[60] w-48 border-gray-300"
                                                    side="bottom"
                                                    align="start"
                                                >
                                                    <DocDropdownMenuItem
                                                        class="flex gap-2 items-center status-gray cursor-pointer"
                                                        @click="() => onCopyPostLink(doc)"
                                                    >
                                                        <Link2 />
                                                        <span>Copy Link</span>
                                                    </DocDropdownMenuItem>
                                                    <DocDropdownMenuItem
                                                        class="flex gap-2 items-center status-gray cursor-pointer text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                                                        @click="() => openDeletePostDialog(doc)"
                                                    >
                                                        <Trash2 class="text-red-500" />
                                                        <span>Delete</span>
                                                    </DocDropdownMenuItem>
                                                </DocDropdownMenuContent>
                                            </DocDropdownMenu>
                                        </div>
                                    </div>
                                </DocSidebarMenuButton>
                            </DocSidebarMenuItem>
                        </div>
                    </DocSidebarMenu>
                </DocSidebarGroupContent>
            </DocCollapsibleContent>

            <DocAlertDialog :open="isDeletePostDialogOpen">
                <ModalDeletePost
                    v-if="selectedPost"
                    :post="selectedPost"
                    :require-title-confirm="false"
                    @deleted="
                        async () => {
                            isDeletePostDialogOpen = false
                            selectedPost = undefined
                            await postStore.refreshPostSidebar(group.dayworkDocumentGroupID)
                            await postStore.refreshPostList(group.dayworkDocumentGroupID)
                        }
                    "
                    @cancel="
                        () => {
                            isDeletePostDialogOpen = false
                            selectedPost = undefined
                        }
                    "
                />
            </DocAlertDialog>
        </DocSidebarGroup>
    </DocCollapsible>
</template>
