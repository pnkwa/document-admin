import { z } from 'zod'
import { callApi } from '~/core/helper/service'
import type { ApiResponse } from '~/core/types/services'
import { toTypedSchema } from '@vee-validate/zod'
import type { Collection } from '~/core/types/components/collection'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const collectionSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: 'Collection name is required.' })
        .max(50, { message: 'Collection name must be 50 characters or fewer.' }),
    slug: z
        .string()
        .trim()
        .min(1, { message: 'Slug is required.' })
        .max(50, { message: 'Slug must be 50 characters or fewer.' })
        .regex(slugRegex, {
            message:
                'Use lowercase letters, numbers, and hyphens only (e.g., "design-guidelines").',
        }),
    isPrivate: z.boolean().default(false),
})

export type CollectionSchema = z.infer<typeof collectionSchema>
export const validateCollectionSchema = toTypedSchema(collectionSchema)

export const createCollection = async (payload: CollectionSchema) =>
    callApi(payload, collectionSchema, (data): ApiResponse<Collection> => {
        const { $axios } = useNuxtApp()
        return $axios.post('/v10/admin/daywork-document-collection/create', data)
    })

export const getCollectionList = async (): ApiResponse<Collection[]> => {
    const { $axios } = useNuxtApp()
    return $axios.get('/v10/admin/daywork-document-collection/list')
}

const collectionIdSchema = z.coerce.number().int().positive()

const updateCollectionApiSchema = collectionSchema.extend({
    dayworkDocumentCollectionID: collectionIdSchema,
})
export type UpdateCollectionApi = z.infer<typeof updateCollectionApiSchema>

export const updateCollection = async (collectionId: number, values: CollectionSchema) => {
    const payload: UpdateCollectionApi = {
        ...values,
        dayworkDocumentCollectionID: collectionId,
    }
    callApi(payload, updateCollectionApiSchema, (data) => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-collection/update', data)
    })
}

export const confirmDeleteCollection = async (collectionId: number) => {
    callApi(collectionId, collectionIdSchema, () => {
        const { $axios } = useNuxtApp()
        return $axios.delete(`/v10/admin/daywork-document-collection/delete/${collectionId}`)
    })
}
