import type { PostListItems } from '../types/components/post'

export type Totals = {
    total: number
    totalComplete: number
    totalDraft: number
    totalPublish: number
    totalUnpublish: number
}

const DEFAULT_TOTALS: Totals = {
    total: 0,
    totalComplete: 0,
    totalDraft: 0,
    totalPublish: 0,
    totalUnpublish: 0,
}

export const extractTotals = (list: PostListItems | undefined): Totals => ({
    total: list?.total || DEFAULT_TOTALS.total,
    totalComplete: list?.totalComplete || DEFAULT_TOTALS.totalComplete,
    totalDraft: list?.totalDraft || DEFAULT_TOTALS.totalDraft,
    totalPublish: list?.totalPublish || DEFAULT_TOTALS.totalPublish,
    totalUnpublish: list?.totalUnpublish || DEFAULT_TOTALS.totalUnpublish,
})
