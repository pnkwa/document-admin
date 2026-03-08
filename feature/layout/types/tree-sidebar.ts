export interface Post {
    dayworkDocumentPostID: number
    title: string
    isPublish?: boolean
    sorting: number
    dayworkDocumentGroupID: number
}

export interface Group {
    dayworkDocumentGroupID: number
    name: string
    slug: string
}

export interface Collection {
    dayworkDocumentCollectionID: number
    name: string
    slug: string
    isPrivate: boolean
}
