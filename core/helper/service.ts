import type { z, ZodTypeAny } from 'zod'
import { ValidationToError, type ApiResponse } from '@/core/types/services/index'

export const callApi = <D, T extends ZodTypeAny>(
    rawData: z.input<T>,
    schema: T,
    onValidDataCallApi: (data: z.infer<T>) => ApiResponse<D>,
) => {
    const validData = schema.safeParse(rawData)

    if (!validData.success) {
        throw new ValidationToError('ValidationToError', {
            cause: validData.error.issues.map((f) => ({
                field: f.path[0],
                message: f.message,
            })),
        })
    }

    return onValidDataCallApi(validData.data)
}
