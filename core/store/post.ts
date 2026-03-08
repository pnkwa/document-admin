import { ref } from 'vue'
import type { OutputData } from '@editorjs/editorjs'

import type { DocumentStatus } from '~/types/status'

import { toast } from 'vue-sonner'
import {
    getSidebarPostList,
    getPostList,
    getPostDetail,
    updatePost,
    type PostUpdateBody,
    updatePublishStatus,
    updatePostStatus,
    updatePostOrder,
} from '~/core/services/post'

import axios from 'axios'

import {
    type OrderMode,
    type PostOrder,
    buildPostOrderBy,
    getPostNeighbors,
} from '~/feature/layout/utils/post-order'
import { toastActionError } from '~/feature/layout/utils/toast-helper'
import type { Post, PostDetailResponse, PostList, PostListItems } from '../types/components/post'

const isOutputData = (data: unknown): data is OutputData => {
    return !!data && typeof data === 'object' && 'blocks' in data && Array.isArray(data.blocks)
}

const safeParseEditorJs = (detail?: string): OutputData => {
    if (!detail) return { blocks: [] }
    try {
        const parsed = JSON.parse(detail)
        return isOutputData(parsed) ? parsed : { blocks: [] }
    } catch {
        return { blocks: [] }
    }
}

export const usePostStore = defineStore('post', () => {
    const postsSidebarMap = ref<Record<number, Post[]>>({})
    const isLoadingPostsSidebarMap = ref<Record<number, boolean>>({})

    const EMPTY_LIST: PostListItems = {
        total: 0,
        totalComplete: 0,
        totalDraft: 0,
        totalPublish: 0,
        totalUnpublish: 0,
        postList: [],
    }
    const postList = ref<Record<number, PostListItems>>({})
    const isLoadingPostList = ref<Record<number, boolean>>({})
    const lastQueryByGroup = ref<Record<number, PostListQuery>>({})
    const getPostListData = (groupId: number): PostListItems =>
        postList.value[groupId] ?? EMPTY_LIST

    const isCreatingPost = ref(false)
    const isSaving = ref<Record<number, boolean>>({})
    const isDeleting = ref<Record<number, boolean>>({})

    const getPostSidebar = (groupId: number): Post[] => postsSidebarMap.value[groupId] ?? []

    const isSidebarLoading = (groupId: number) => !!isLoadingPostsSidebarMap.value[groupId]
    const isListLoading = (groupId: number) => !!isLoadingPostList.value[groupId]

    const refreshPostSidebar = async (groupId: number) => {
        try {
            isLoadingPostsSidebarMap.value[groupId] = true
            const res = await getSidebarPostList(groupId)
            if (res.data.error || !res.data.data?.items) return []
            postsSidebarMap.value[groupId] = res.data.data.items

            return res.data.data.items
        } catch (err) {
            toastActionError('load', 'post (sidebar)', err)
            return []
        } finally {
            isLoadingPostsSidebarMap.value[groupId] = false
        }
    }

    const listAbortByGroup = ref<Record<number, AbortController | null>>({})
    const startListRequest = (groupId: number): AbortController => {
        listAbortByGroup.value[groupId]?.abort()
        const controller = new AbortController()
        listAbortByGroup.value[groupId] = controller
        return controller
    }
    const endListRequest = (groupId: number, controller: AbortController) => {
        if (listAbortByGroup.value[groupId] === controller) {
            listAbortByGroup.value[groupId] = null
        }
    }
    const refreshPostList = async (groupId: number, overrides?: Partial<PostListQuery>) => {
        const base: PostListQuery = {
            dayworkDocumentGroupID: groupId,
            page: 1,
            perPage: overrides?.perPage ?? 10,
            searchText: overrides?.searchText,
            filterByID: overrides?.filterByID,
            updateFrom: overrides?.updateFrom,
            updateTo: overrides?.updateTo,
        }

        lastQueryByGroup.value[groupId] = base
        isLoadingPostList.value[groupId] = true

        const controller = startListRequest(groupId)

        try {
            const res = await getPostList(base, { signal: controller.signal })
            const item = res.data?.data?.item
            const list = item ?? EMPTY_LIST
            postList.value[groupId] = list
            rebuildOrder(groupId)
            return list
        } catch (err) {
            if (axios.isCancel(err)) return
        } finally {
            endListRequest(groupId, controller)
            isLoadingPostList.value[groupId] = false
        }
    }
    const loadMorePosts = async (groupId: number) => {
        const last = lastQueryByGroup.value[groupId]
        if (!last) return

        const nextQuery: PostListQuery = { ...last, page: (last.page ?? 1) + 1 }
        lastQueryByGroup.value[groupId] = nextQuery
        isLoadingPostList.value[groupId] = true
        try {
            const res = await getPostList(nextQuery)
            const item = res.data?.data?.item
            if (!item) return

            const current = getPostListData(groupId)
            postList.value[groupId] = {
                ...current,
                total: item.total ?? current.total,
                totalComplete: item.totalComplete ?? current.totalComplete,
                totalDraft: item.totalDraft ?? current.totalDraft,
                totalPublish: item.totalPublish ?? current.totalPublish,
                totalUnpublish: item.totalUnpublish ?? current.totalUnpublish,
                postList: [...(current.postList ?? []), ...(item.postList ?? [])],
            }
            rebuildOrder(groupId)
        } finally {
            isLoadingPostList.value[groupId] = false
        }
    }
    const postDetailMap = ref<Record<number, PostDetailResponse | undefined>>({})
    const isLoadingPostDetail = ref<Record<number, boolean>>({})
    const editorOutputMap = ref<Record<number, OutputData>>({})

    const getPostDetailData = (postId: number) => postDetailMap.value[postId]
    const getEditorOutput = (postId: number) => editorOutputMap.value[postId] ?? { blocks: [] }
    const isDetailLoading = (postId: number) => !!isLoadingPostDetail.value[postId]

    const refreshPostDetail = async (postId: number) => {
        try {
            isLoadingPostDetail.value[postId] = true
            const res = await getPostDetail(postId)
            const item = res.data?.data?.item as PostDetailResponse | undefined
            if (!item) {
                toast('Not found', { description: 'Cannot load document detail.' })
                postDetailMap.value[postId] = undefined
                editorOutputMap.value[postId] = { blocks: [] }
                return undefined
            }
            postDetailMap.value[postId] = item
            editorOutputMap.value[postId] = safeParseEditorJs(item.postDetail.detail)
            return item
        } catch (err) {
            toastActionError('load', 'post (detail)', err)
            postDetailMap.value[postId] = undefined
            editorOutputMap.value[postId] = { blocks: [] }
            return undefined
        } finally {
            isLoadingPostDetail.value[postId] = false
        }
    }

    const isPostDetail = async (postId: number) => {
        if (postDetailMap.value[postId]) return postDetailMap.value[postId]
        return await refreshPostDetail(postId)
    }

    const updatePostDetailFields = (prev: PostDetailResponse, payload: PostUpdateBody) => ({
        ...prev,
        postDetail: {
            ...prev.postDetail,
            title: payload.title || 'Untitled',
            detail: payload.detail,
            detailFormat: payload.detailFormat,
            isPublish: payload.isPublish,
            status: payload.status || 'DRAFT',
            sorting: payload.sorting ?? prev.postDetail.sorting,
            updatedAt: new Date().toISOString(),
        },
    })

    const updateCachesAfterSave = (postId: number, payload: PostUpdateBody) => {
        const prev = postDetailMap.value[postId]
        if (prev) postDetailMap.value[postId] = updatePostDetailFields(prev, payload)
        editorOutputMap.value[postId] = safeParseEditorJs(payload.detail)
    }

    const savePostDetail = async (postId: number, payload: PostUpdateBody) => {
        isSaving.value[postId] = true
        try {
            await updatePost(postId, payload)
            updateCachesAfterSave(postId, payload)
        } catch (err) {
            toastActionError('update', 'post', err)
            throw err
        } finally {
            isSaving.value[postId] = false
        }
    }

    const orderModeByGroup = ref<Record<number, OrderMode>>({})
    const postOrderByGroup = ref<Record<number, PostOrder>>({})

    const getOrderMode = (groupId: number): OrderMode =>
        orderModeByGroup.value[groupId] ?? 'default'

    const setOrderMode = (groupId: number, mode: OrderMode) => {
        orderModeByGroup.value[groupId] = mode
        const list = postList.value[groupId]?.postList ?? []
        postOrderByGroup.value[groupId] = buildPostOrderBy(list, mode)
    }

    const rebuildOrder = (groupId: number) => {
        const list = postList.value[groupId]?.postList ?? []
        const mode = getOrderMode(groupId)
        postOrderByGroup.value[groupId] = buildPostOrderBy(list, mode)
    }

    const getDocsOrdered = (groupId: number) => {
        const list = postList.value[groupId]?.postList ?? []
        const order = postOrderByGroup.value[groupId]
        if (!order?.ids?.length) return list
        const byId: Record<number, PostList> = Object.create(null)
        for (const post of list) byId[post.dayworkDocumentPostID] = post
        return order.ids.map((id) => byId[id]).filter(Boolean)
    }

    const getOrderedPostIds = (groupId: number): number[] => {
        return postOrderByGroup.value[groupId]?.ids ?? []
    }

    const getPostNeighborsByGroup = (groupId: number, postId: number) =>
        getPostNeighbors(postOrderByGroup.value[groupId], postId)

    const preparePostOrder = async (groupId: number) => {
        let ids = getOrderedPostIds(groupId)
        if (ids.length) return

        await refreshPostList(groupId).catch(() => {})
        ids = getOrderedPostIds(groupId)
        if (ids.length) return

        await refreshPostSidebar(groupId).catch(() => {})
    }

    const setStatus = async (postId: number, status: DocumentStatus) => {
        await updatePostStatus({ dayworkDocumentPostID: postId, status })
        await refreshPostDetail(postId)
    }

    const setPublish = async (postId: number, isPublish: boolean) => {
        await updatePublishStatus({ dayworkDocumentPostID: postId, isPublish })
        await refreshPostDetail(postId)
    }

    const updateOrderAndRefresh = async (
        groupId: number,
        postId: number,
        newSorting: number,
    ): Promise<Post[]> => {
        try {
            await updatePostOrder({ dayworkDocumentPostID: postId, newSorting })
            await refreshPostList(groupId)
            const sidebarPosts = await refreshPostSidebar(groupId)
            rebuildOrder(groupId)
            return sidebarPosts
        } catch (err) {
            toastActionError('update', 'post order', err)
            throw err
        }
    }

    return {
        postsSidebarMap,
        postList,
        postDetailMap,
        editorOutputMap,

        isLoadingPostsSidebarMap,
        isLoadingPostList,
        isLoadingPostDetail,
        isCreatingPost,
        isSaving,
        isDeleting,

        getPostSidebar,

        getPostListData,
        getPostDetailData,
        getEditorOutput,
        isSidebarLoading,
        isListLoading,
        isDetailLoading,

        refreshPostSidebar,

        refreshPostList,
        loadMorePosts,

        refreshPostDetail,
        isPostDetail,
        savePostDetail,

        getOrderedPostIds,
        getPostNeighborsByGroup,
        preparePostOrder,
        postOrderByGroup,
        getOrderMode,
        setOrderMode,
        getDocsOrdered,
        setStatus,
        setPublish,

        updateOrderAndRefresh,
    }
})
