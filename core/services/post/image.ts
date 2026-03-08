import { z } from 'zod'
import type { ApiResponse } from '@/core/types/services/index'
import { toastActionError } from '~/feature/layout/utils/toast-helper'
import { ACCEPTED_MIME, MAX_SIZE_BYTES } from '~/core/types/services/image'

const uploadImagePathApi = '/v10/utility/dw-document/file/upload'

const groupIdSchema = z.coerce.number().int().positive()

export const uploadByFileSchema = z.object({
    file: z
        .instanceof(File, { message: 'File is required' })
        .refine((f) => ACCEPTED_MIME.includes(f.type), 'Unsupported file type')
        .refine((f) => f.size <= MAX_SIZE_BYTES, 'File too large (max 5MB)'),
    dayworkDocumentGroupID: groupIdSchema,
})

export const uploadByUrlSchema = z.object({
    url: z.string().url(),
    dayworkDocumentGroupID: groupIdSchema,
})

type UploadImageItem = { publicUrl: string }

export type EditorJsImageResponse = { success: 1; file: { url: string } }

export const uploadImageByFileApi = (
    payload: z.input<typeof uploadByFileSchema>,
): ApiResponse<UploadImageItem> =>
    callApi(payload, uploadByFileSchema, async ({ file, dayworkDocumentGroupID }) => {
        const form = new FormData()
        form.append('file', file)
        form.append('dayworkDocumentGroupID', String(dayworkDocumentGroupID))

        const { $axios } = useNuxtApp()
        return $axios.post(uploadImagePathApi, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            transformRequest: [(d) => d],
        })
    })

export const uploadImageByUrlApi = (
    payload: z.input<typeof uploadByUrlSchema>,
): ApiResponse<UploadImageItem> =>
    callApi(payload, uploadByUrlSchema, async (data) => {
        const { $axios } = useNuxtApp()
        return $axios.post(uploadImagePathApi, data)
    })

export const uploadImageByFile = async (
    payload: z.input<typeof uploadByFileSchema>,
): Promise<EditorJsImageResponse> => {
    try {
        const res = await uploadImageByFileApi(payload)
        const url = res.data?.data?.item?.publicUrl
        if (!url) throw new Error('Upload succeeded but no publicUrl returned')
        return { success: 1, file: { url } }
    } catch (err) {
        toastActionError('load', 'image', err)
        throw err
    }
}

export const uploadImageByUrl = async (
    payload: z.input<typeof uploadByUrlSchema>,
): Promise<EditorJsImageResponse> => {
    try {
        const res = await uploadImageByUrlApi(payload)
        const url = res.data?.data?.item?.publicUrl
        if (!url) throw new Error('Remote upload succeeded but no publicUrl returned')
        return { success: 1, file: { url } }
    } catch (err) {
        toastActionError('load', 'image (via URL)', err)
        throw err
    }
}
