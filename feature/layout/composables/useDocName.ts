import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import { usePostStore } from '~/core/store/post'

export type Crumb = { label: string; to?: RouteLocationRaw }
export type PageMode = 'overview' | 'preview' | 'edit'

export const pathOf = {
    group: (c: number, g: number) => `/${c}/${g}`,
    post: (c: number, g: number, p: number) => `/${c}/${g}/${p}`,
    postEdit: (c: number, g: number, p: number) => `/${c}/${g}/${p}/edit`,
} as const

const fallback = (kind: 'Collection' | 'Group' | 'Post', id?: number) =>
    id ? `${kind} #${id}` : kind

const inferModeFromPath = (path: string, hasPost: boolean): PageMode =>
    !hasPost ? 'overview' : path.endsWith('/edit') ? 'edit' : 'preview'

const getNamesFromStore = (collectionId?: number, groupId?: number, postId?: number) => {
    const postStore = usePostStore()

    const list = groupId != null ? postStore.getPostListData(groupId) : undefined
    let collectionName = list?.dayworkDocumentCollectionName
    let groupName = list?.dayworkDocumentGroupName

    let postTitle: string | undefined

    if (postId != null) {
        const detail = postStore.getPostDetailData(postId)
        if (detail) {
            collectionName = detail.dayworkDocumentCollectionName || collectionName
            groupName = detail.dayworkDocumentGroupName || groupName
            postTitle = detail.postDetail?.title || postTitle
        }

        if (!postTitle && list?.postList?.length) {
            postTitle = list.postList.find((p) => p.dayworkDocumentPostID === postId)?.title
        }
    }

    return {
        collectionName:
            collectionName ??
            (collectionId ? fallback('Collection', collectionId) : fallback('Collection')),
        groupName: groupName ?? (groupId ? fallback('Group', groupId) : fallback('Group')),
        postTitle: postTitle ?? (postId ? fallback('Post', postId) : undefined),
    }
}

const buildCrumbsByIds = async (
    collectionId?: number,
    groupId?: number,
    postId?: number,
    mode: PageMode = 'overview',
): Promise<Crumb[]> => {
    const crumbs: Crumb[] = [{ label: 'Home', to: '/' }]

    if (!collectionId && !groupId && !postId) {
        crumbs.push({ label: 'Introduction' })
        return crumbs
    }
    if (!collectionId || !groupId) return crumbs

    const { collectionName, groupName, postTitle } = getNamesFromStore(
        collectionId,
        groupId,
        postId ?? undefined,
    )

    crumbs.push({ label: collectionName })
    crumbs.push({ label: groupName, to: pathOf.group(collectionId, groupId) })

    if (!postId) {
        crumbs.push({ label: 'Overview' })
        return crumbs
    }

    crumbs.push({ label: postTitle!, to: pathOf.post(collectionId, groupId, postId) })
    crumbs.push({ label: mode === 'edit' ? 'Edit' : 'Preview' })
    return crumbs
}

const buildCrumbsFromRoute = (
    route: Pick<RouteLocationNormalizedLoaded, 'params' | 'path'>,
): Promise<Crumb[]> => {
    const toNum = (v: unknown) => {
        const n = Number(v)
        return Number.isFinite(n) ? n : undefined
    }
    const collectionId = toNum(route.params.collectionId)
    const groupId = toNum(route.params.groupId)
    const postId = toNum(route.params.postId)
    const mode = inferModeFromPath(route.path, postId != null)
    return buildCrumbsByIds(collectionId, groupId, postId, mode)
}

export const useDocName = () => {
    return { buildCrumbsFromRoute, buildCrumbsByIds, pathOf }
}
