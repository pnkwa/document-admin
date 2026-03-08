import { ref } from 'vue'
import type { Collection, Group } from '../types/tree-sidebar'
import { getCollectionList } from '~/core/services/collection'
import { getGroupList } from '~/core/services/group'
import { toastActionError } from '../utils/toast-helper'

export const useDocSidebar = defineStore('docSidebar', () => {
    const collections = ref<Collection[]>([])
    const groupsMap = ref<Record<number, Group[]>>({})

    const refreshCollections = async () => {
        try {
            const res = await getCollectionList()
            if (res.data.error || !res.data.data?.items) return
            collections.value = res.data.data.items
        } catch (error) {
            toastActionError('load', 'collection', error)
        }
    }

    const refreshGroups = async (collectionId: number, options?: { force?: boolean }) => {
        const { force } = options ?? {}
        try {
            if (!force && groupsMap.value[collectionId]) return
            const res = await getGroupList(collectionId)
            if (res.data.error || !res.data.data?.items) return
            groupsMap.value[collectionId] = res.data.data.items
        } catch (error) {
            toastActionError('load', 'group', error)
        }
    }

    return {
        collections,
        groupsMap,
        refreshCollections,
        refreshGroups,
    }
})
