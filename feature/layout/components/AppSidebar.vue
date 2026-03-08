<script setup lang="ts">
import AppSidebarCollection from './AppSidebarCollection.vue'
import { FolderPlus, RocketIcon, BookOpen } from 'lucide-vue-next'
import type { SidebarProps } from '~/core/types/components/sidebar'
import FormCreateCollection from './form/collection/FormCreateCollection.vue'
import { useDocSidebar } from '../stores/sidebar'

const props = defineProps<SidebarProps>()

const isDialogOpen = ref(false)

const docSidebar = useDocSidebar()
const handleFormSubmitted = async () => {
    isDialogOpen.value = false
    await docSidebar.refreshCollections()
}

const onExpand = (expanded: boolean, collectionId: number) => {
    if (expanded) docSidebar.refreshGroups(collectionId)
}

onMounted(() => {
    docSidebar.refreshCollections()
})
</script>

<template>
    <DocSidebar v-bind="props">
        <DocSidebarHeader>
            <h2 class="m-4">Documentation Manager</h2>
        </DocSidebarHeader>

        <DocSidebarContent class="gap-0 section-bg max-h-fit">
            <div class="border-t-1 border-gray-300 dark:border-gray-600 p-2">
                <span class="menu-heading text-xs">Introduction</span>
                <ul class="mt-2 flex flex-col gap-1">
                    <li>
                        <DocButton
                            variant="ghost"
                            class="flex items-center justify-start gap-2 px-3 py-1 w-full"
                            @click="navigateTo('/')"
                        >
                            <RocketIcon :size="16" :stroke-width="1.8" />
                            <span>Getting Started</span>
                        </DocButton>
                    </li>
                    <li>
                        <DocButton
                            variant="ghost"
                            class="flex items-center justify-start gap-2 px-3 py-1 w-full"
                            @click="navigateTo('/guides')"
                        >
                            <BookOpen :size="16" :stroke-width="1.8" />
                            <span>Guides</span>
                        </DocButton>
                    </li>
                </ul>
            </div>
        </DocSidebarContent>

        <DocSidebarContent class="gap-0 section-bg">
            <div class="p-2 section-bg border-t-1 border-gray-300 dark:border-gray-600">
                <div class="flex items-center justify-between mb-2">
                    <span class="menu-heading text-xs">Collections</span>

                    <DocAlertDialog v-model:open="isDialogOpen">
                        <DocAlertDialogTrigger>
                            <FolderPlus :size="18" :stroke-width="1.8" class="menu-heading" />
                        </DocAlertDialogTrigger>

                        <DocAlertDialogContent>
                            <FormCreateCollection
                                @submitted="handleFormSubmitted"
                                @cancel="isDialogOpen = false"
                            />
                        </DocAlertDialogContent>
                    </DocAlertDialog>
                </div>
                <DocCollapsible
                    v-for="(collectionItem, index) in docSidebar.collections"
                    :key="`collection-${index}`"
                    default-close
                    @update:open="
                        (value) => onExpand(value, collectionItem.dayworkDocumentCollectionID)
                    "
                >
                    <AppSidebarCollection
                        :collection="collectionItem"
                        :groups="
                            docSidebar.groupsMap[collectionItem.dayworkDocumentCollectionID] || []
                        "
                    />
                </DocCollapsible>
            </div>
        </DocSidebarContent>

        <SidebarRail />
    </DocSidebar>
</template>
