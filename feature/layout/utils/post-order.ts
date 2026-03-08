import type { PostList } from '~/core/types/components/post'
import { toTimestamp } from '~/core/utils/date'

export type PostOrder = { ids: number[]; index: Record<number, number> }

type OrderItem = { id: number; sorting: number; updatedAt?: string }

const toOrderItems = (list: Array<PostList>): OrderItem[] =>
    list
        .map((post) => {
            const id = post?.dayworkDocumentPostID
            if (typeof id !== 'number') return null
            return { id, sorting: post?.sorting ?? 0, updatedAt: post?.updatedAt }
        })
        .filter(Boolean) as OrderItem[]

export const sortItemsByDefault = (a: OrderItem, b: OrderItem) => {
    return (a.sorting ?? 0) - (b.sorting ?? 0)
}

const sortItemsByLatest = (a: OrderItem, b: OrderItem) => {
    const byUpdated = toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
    if (byUpdated !== 0) return byUpdated
    return (a.sorting ?? 0) - (b.sorting ?? 0)
}

export type OrderMode = 'default' | 'latest'

export const buildPostOrderBy = (list: Array<PostList>, mode: OrderMode = 'default'): PostOrder => {
    const items = toOrderItems(list)
    const ordered = items.slice().sort(mode === 'latest' ? sortItemsByLatest : sortItemsByDefault)
    const ids = ordered.map((x) => x.id)
    const index: Record<number, number> = {}
    ids.forEach((id, i) => (index[id] = i))
    return { ids, index }
}

export const getPostNeighbors = (order: PostOrder | undefined, postId: number) => {
    if (!order) return { prevId: null, nextId: null }
    const position = order.index[postId]
    if (typeof position !== 'number') return { prevId: null, nextId: null }

    return {
        prevId: position > 0 ? order.ids[position - 1] : null,
        nextId: position < order.ids.length - 1 ? order.ids[position + 1] : null,
    }
}

export const reorderNewArray = <T>(arr: T[], from: number, to: number) => {
    const copy = arr.slice()
    const [it] = copy.splice(from, 1)
    copy.splice(to, 0, it)
    return copy
}

export const getMovedItemNewSorting = <T extends { dayworkDocumentPostID: number }>(
    list: T[],
    movedId: number,
) => {
    const index = list.findIndex((p) => p.dayworkDocumentPostID === movedId)
    if (index === -1) return null

    return {
        id: movedId,
        newSorting: index + 1,
    }
}
