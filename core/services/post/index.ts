import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type {
    Post,
    PostDetail,
    PostDetailResponse,
    PostListItems,
} from '~/core/types/components/post'

import { DOCUMENT_STATUS_VALUES } from '~/types/status'

export const postSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: 'Title is required.' })
        .max(120, { message: 'Title must be 120 characters or fewer.' })
        .default('Untitled'),
    detail: z
        .string()
        .refine(
            (val) => {
                try {
                    const parsed = JSON.parse(val)
                    return typeof parsed === 'object'
                } catch {
                    return false
                }
            },
            {
                message: 'Detail must be a valid JSON string representing an object.',
            },
        )
        .default('{}'),
    detailFormat: z.string().default(''),
    isPublish: z.coerce.boolean().default(false),
    status: z.enum(DOCUMENT_STATUS_VALUES).default('DRAFT'),
    sorting: z.coerce.number().int().nonnegative().default(0),
    dayworkDocumentGroupID: z.coerce.number().int().positive(),
})
export type PostSchema = z.infer<typeof postSchema>
export type FormPost = z.infer<typeof postSchema>
export const validateFormCreatePostSchema = toTypedSchema(postSchema)

export type CreatePostInput = z.input<typeof postSchema>

export const createPost = async (payload: CreatePostInput) => {
    return callApi(payload, postSchema, (data): ApiResponse<Post> => {
        const { $axios } = useNuxtApp()
        return $axios.post('/v10/admin/daywork-document-post/create', data)
    })
}

export const getSidebarPostList = async (groupId: number): ApiResponse<Post[]> => {
    const { $axios } = useNuxtApp()
    return $axios.get(`/v10/admin/daywork-document-group/sidebar/post/list/${groupId}`)
}

export const postListQuerySchema = z.object({
    dayworkDocumentGroupID: z.coerce.number().int().positive(),
    filterByID: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    page: z.coerce.number().int().positive().default(1),
    perPage: z.coerce.number().int().positive().max(100).default(10),
    searchText: z.string().trim().optional(),
    status: z.enum(DOCUMENT_STATUS_VALUES).optional(),
    updateFrom: z.coerce.date().optional(),
    updateTo: z.coerce.date().optional(),
})

export type PostListQuery = z.input<typeof postListQuerySchema>

export const getPostList = async (
    query: PostListQuery,
    axiosCfg?: { signal?: AbortSignal },
): ApiResponse<PostListItems> => {
    return callApi(query, postListQuerySchema, (data) => {
        const { $axios } = useNuxtApp()
        return $axios.get('/v10/admin/daywork-document-post/list', {
            params: data,
            signal: axiosCfg?.signal,
        })
    })
}

export const getPostDetail = async (postId: number): ApiResponse<PostDetailResponse> => {
    const { $axios } = useNuxtApp()
    return $axios.get(`/v10/admin/daywork-document-post/detail/${postId}`)
}

export const postUpdateBodySchema = postSchema.omit({ dayworkDocumentGroupID: true })

export const postUpdateApiSchema = postUpdateBodySchema.extend({
    dayworkDocumentPostID: z.coerce.number().int().positive(),
})
export type PostUpdateBody = z.input<typeof postUpdateBodySchema>
export type PostUpdateApi = z.infer<typeof postUpdateApiSchema>

export const updatePost = async (postId: number, values: PostUpdateBody) => {
    const payload = postUpdateApiSchema.parse({
        ...values,
        dayworkDocumentPostID: postId,
    })

    return callApi(payload, postUpdateApiSchema, (data): ApiResponse<PostDetail> => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-post/update', data)
    })
}

const postIdSchema = z.number().int().positive()

const postStatusSchema = z.object({
    dayworkDocumentPostID: postIdSchema,
    status: z.enum(DOCUMENT_STATUS_VALUES),
})
export type UpdatePostStatusInput = z.input<typeof postStatusSchema>

export const updatePostStatus = async (payload: UpdatePostStatusInput) => {
    return callApi(payload, postStatusSchema, (data): ApiResponse<PostDetail> => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-post/update/post-status', data)
    })
}

const publishStatusSchema = z.object({
    dayworkDocumentPostID: postIdSchema,
    isPublish: z.boolean(),
})
export type UpdatePublishStatusInput = z.input<typeof publishStatusSchema>

export const updatePublishStatus = async (payload: UpdatePublishStatusInput) => {
    return callApi(payload, publishStatusSchema, (data): ApiResponse<PostDetail> => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-post/update/publish-status', data)
    })
}

const postOrderSchema = z.object({
    dayworkDocumentPostID: z.coerce.number().int().positive(),
    newSorting: z.coerce.number().int().nonnegative(),
})
export type UpdatePostOrderInput = z.input<typeof postOrderSchema>

export const updatePostOrder = async (payload: UpdatePostOrderInput) => {
    return callApi(payload, postOrderSchema, (data): ApiResponse<PostDetail> => {
        const { $axios } = useNuxtApp()
        return $axios.patch('/v10/admin/daywork-document-post/update/post-order', data)
    })
}

export const confirmDeletePost = async (postId: number) => {
    callApi(postId, postIdSchema, () => {
        const { $axios } = useNuxtApp()
        return $axios.delete(`/v10/admin/daywork-document-post/delete/${postId}`)
    })
}
