export const COLLECTION_STATUS_VALUES = ['PRIVATE', 'PUBLIC'] as const
export type CollectionStatus = (typeof COLLECTION_STATUS_VALUES)[number]
export const DOCUMENT_STATUS_VALUES = ['DRAFT', 'COMPLETE'] as const
export type DocumentStatus = (typeof DOCUMENT_STATUS_VALUES)[number]
export const PUBLISH_STATUS_VALUES = ['PUBLISH', 'UNPUBLISH'] as const
export type PublishStatus = (typeof PUBLISH_STATUS_VALUES)[number]
export type SelectedPostStatus = 'ALL' | DocumentStatus | PublishStatus
export const SELECTED_POST_STATUS_LABELS: Record<SelectedPostStatus, string> = {
    ALL: 'All',
    DRAFT: 'Draft',
    COMPLETE: 'Complete',
    PUBLISH: 'Published',
    UNPUBLISH: 'Unpublished',
}
