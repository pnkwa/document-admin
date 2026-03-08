import type { DocumentStatus } from '~/types/status'

export interface Post {
    dayworkDocumentPostID: number
    title: string
    isPublish?: boolean
    sorting: number
    dayworkDocumentGroupID: number
}

export interface PostDetail {
    dayworkDocumentCollectionID: number
    dayworkDocumentCollectionName: string
    dayworkDocumentGroupID: number
    dayworkDocumentGroupName: number
    dayworkDocumentPostID: number
    title: string
    detail?: string
    detailFormat?: string
    status: DocumentStatus
    isPublish?: boolean
    sorting: number
    createdAt?: string
    updatedAt?: string
    writer?: string
}

export interface PostDetailResponse {
    dayworkDocumentCollectionID: number
    dayworkDocumentCollectionName: string
    dayworkDocumentGroupID: number
    dayworkDocumentGroupName: string
    postDetail: PostDetail
}

export interface PostList {
    dayworkDocumentPostID: number
    title: string
    status: DocumentStatus
    isPublish?: boolean
    sorting: number
    updatedAt?: string
    writer?: string
}

export interface PostListItems {
    dayworkDocumentCollectionID?: number
    dayworkDocumentCollectionName?: string
    dayworkDocumentGroupID?: number
    dayworkDocumentGroupName?: string
    total?: number
    totalComplete?: number
    totalDraft?: number
    totalPublish?: number
    totalUnpublish?: number
    postList: PostList[]
}
