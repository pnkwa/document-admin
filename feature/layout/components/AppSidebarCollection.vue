<script setup lang="ts">
import { ChevronRight, Folder, MoreHorizontal, Plus, Trash2, Pencil, Link2 } from 'lucide-vue-next'
import type { DropdownMenuItem } from '../types/dropdown-items'
import type { Collection, Group } from '../types/tree-sidebar'
import AppSidebarGroup from './AppSidebarGroup.vue'
import FormEditCollection from './form/collection/FormEditCollection.vue'
import ModalDeleteCollection from './form/collection/ModalDeleteCollection.vue'
import FormCreateGroup from './form/group/FormCreateGroup.vue'
import { computed, ref } from 'vue'
import { useDocSidebar } from '~/feature/layout/stores/sidebar'
import { useCopyLink } from '~/core/composables/useCopyLink'
import { buildAbsoluteUrl } from '~/core/helper/link'

const { copyLink } = useCopyLink()

const props = defineProps<{
    collection: Collection
    groups?: Group[]
}>()

const docSidebar = useDocSidebar()

const isEditDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isDialogOpen = ref(false)
const isMenuOpen = ref(false)

const actionBarOpen = computed(() => isDialogOpen.value || isMenuOpen.value)

const onCopyCollectionLink = () => {
    if (props.collection.slug) {
        const url = buildAbsoluteUrl({ kind: 'collection', slug: props.collection.slug })
        copyLink(url)
    }
}

const dropdownItems: DropdownMenuItem[] = [
    { label: 'Edit', icon: Pencil, action: () => (isEditDialogOpen.value = true) },
    { label: 'Copy Link', icon: Link2, action: onCopyCollectionLink },
    {
        label: 'Delete',
        icon: Trash2,
        destructive: true,
        action: () => (isDeleteDialogOpen.value = true),
    },
]
</script>

<template>
    <DocSidebarGroup>
        <DocSidebarGroupLabel as-child>
            <div
                class="group/collection flex items-center gap-2 py-2 px-2 w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
                <DocCollapsibleTrigger
                    class="group/trigger flex items-center gap-2 text-sm min-w-0"
                    aria-label="Toggle collection"
                >
                    <ChevronRight
                        :size="18"
                        class="shrink-0 transition-transform group-data-[state=open]/trigger:rotate-90"
                    />
                    <Folder :size="18" class="shrink-0 text-primary" />
                    <span class="truncate max-w-[110px] md:max-w-[180px]">
                        {{ collection.name }}
                    </span>
                </DocCollapsibleTrigger>

                <div class="ml-auto w-20 md:w-24 flex justify-end">
                    <div
                        :class="[
                            'flex items-center gap-1 transition-opacity duration-150',
                            actionBarOpen
                                ? 'opacity-100 pointer-events-auto'
                                : 'opacity-0 pointer-events-none',
                            'group-hover/collection:opacity-100 group-hover/collection:pointer-events-auto',
                            'group-focus-within/collection:opacity-100 group-focus-within/collection:pointer-events-auto',
                        ]"
                    >
                        <DocAlertDialog v-model:open="isDialogOpen">
                            <DocAlertDialogTrigger as-child>
                                <button
                                    type="button"
                                    class="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-muted/60"
                                    aria-label="Add group"
                                    @click.stop
                                >
                                    <Plus :size="14" />
                                </button>
                            </DocAlertDialogTrigger>

                            <DocAlertDialogContent class="z-[70]">
                                <FormCreateGroup
                                    :collection-id="collection.dayworkDocumentCollectionID"
                                    @submitted="
                                        async () => {
                                            isDialogOpen = false
                                            await docSidebar.refreshGroups(
                                                collection.dayworkDocumentCollectionID,
                                                { force: true },
                                            )
                                        }
                                    "
                                    @cancel="isDialogOpen = false"
                                />
                            </DocAlertDialogContent>
                        </DocAlertDialog>

                        <DocDropdownMenu v-model:open="isMenuOpen">
                            <DocDropdownMenuTrigger as-child>
                                <button
                                    type="button"
                                    class="inline-flex shrink-0 items-center justify-center rounded-md hover:bg-muted/60"
                                    aria-label="Collection actions"
                                    @click.stop
                                >
                                    <MoreHorizontal :size="18" :stroke-width="1.8" />
                                </button>
                            </DocDropdownMenuTrigger>

                            <DocDropdownMenuContent
                                class="z-[60] w-48 border-gray-300"
                                side="bottom"
                                align="start"
                            >
                                <template v-for="(item, i) in dropdownItems" :key="i">
                                    <DocDropdownMenuItem
                                        :class="[
                                            item.destructive
                                                ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                                                : '',
                                            'flex gap-2 items-center status-gray cursor-pointer',
                                        ]"
                                        @click="
                                            () => {
                                                isMenuOpen = false
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
        </DocSidebarGroupLabel>

        <DocAlertDialog :open="isEditDialogOpen">
            <DocAlertDialogContent>
                <FormEditCollection
                    :key="collection.dayworkDocumentCollectionID"
                    :collection="collection"
                    @updated="
                        async () => {
                            isEditDialogOpen = false
                            await docSidebar.refreshCollections()
                        }
                    "
                    @cancel="
                        () => {
                            isEditDialogOpen = false
                        }
                    "
                />
            </DocAlertDialogContent>
        </DocAlertDialog>

        <DocAlertDialog :open="isDeleteDialogOpen">
            <ModalDeleteCollection
                :key="collection.dayworkDocumentCollectionID"
                :collection="collection"
                @deleted="
                    async () => {
                        isDeleteDialogOpen = false
                        await docSidebar.refreshCollections()
                    }
                "
                @cancel="
                    () => {
                        isDeleteDialogOpen = false
                    }
                "
            />
        </DocAlertDialog>

        <DocCollapsibleContent>
            <DocSidebarGroupContent>
                <DocSidebarMenu>
                    <DocSidebarMenuItem v-for="group in groups" :key="group.dayworkDocumentGroupID">
                        <AppSidebarGroup
                            :group="group"
                            :collection-id="collection.dayworkDocumentCollectionID"
                            :collection-slug="collection.slug"
                        />
                    </DocSidebarMenuItem>
                </DocSidebarMenu>
            </DocSidebarGroupContent>
        </DocCollapsibleContent>
    </DocSidebarGroup>
</template>
