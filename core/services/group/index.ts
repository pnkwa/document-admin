import { toTypedSchema } from '@vee-validate/zod'
import z from 'zod'
import type { Group } from '~/core/types/components/group'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const groupFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, { message: 'Group name is required.' })
        .max(50, { message: 'Group name must be 50 characters or fewer.' }),

    slug: z
        .string()
        .trim()
        .min(1, { message: 'Slug is required.' })
        .max(50, { message: 'Slug must be 50 characters or fewer.' })
        .regex(slugRegex, {
            message:
                'Use lowercase letters, numbers, and hyphens only (e.g., "design-guidelines").',
        }),
})

export type GroupForm = z.infer<typeof groupFormSchema>
export const validateGroupFormSchema = toTypedSchema(groupFormSchema)

export const createGroupApiSchema = groupFormSchema.extend({
    dayworkDocumentCollectionID: z.coerce.number().int().positive(),
})
export type CreateGroupApi = z.infer<typeof createGroupApiSchema>
export const createGroup = async (collectionId: number, values: GroupForm) => {
    const payload: CreateGroupApi = {
        ...values,
        dayworkDocumentCollectionID: collectionId,
    }

    return callApi(payload, createGroupApiSchema, (data): ApiResponse<Group> => {
        const { $axios } = useNuxtApp()
        return $axios.post('/v10/admin/daywork-document-group/create', data)
    })
}
export const getGroupList = async (collectionId: number): ApiResponse<Group[]> => {
    const { $axios } = useNuxtApp()
    return $axios.get(`/v10/admin/daywork-document-collection/group/list/${collectionId}`)
}

export const updateGroupApiSchema = groupFormSchema.extend({
    dayworkDocumentGroupID: z.coerce.number().int().positive(),
})
export type UpdateGroupApi = z.infer<typeof updateGroupApiSchema>
export const updateGroup = async (groupId: number, values: GroupForm) => {
    const payload: UpdateGroupApi = {
        ...values,
        dayworkDocumentGroupID: groupId,
    }
    callApi(payload, updateGroupApiSchema, (data) => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-group/name/update', data)
    })
}

const groupIdSchema = z.number()
export const confirmDeleteGroup = async (groupId: number) => {
    callApi(groupId, groupIdSchema, () => {
        const { $axios } = useNuxtApp()
        return $axios.delete(`/v10/admin/daywork-document-group/delete/${groupId}`)
    })
}
