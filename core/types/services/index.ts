import type { AxiosPromise } from 'axios'

export type Response<T> = {
    message: string
    error?: {
        code: never
        message: string
    }
    data?: {
        title: string
        description: string
    } & T
}

export type ApiResponse<T> = AxiosPromise<
    Response<
        T extends unknown[]
            ? {
                  items: T
              }
            : { item: T }
    >
>

export interface AxiosPayloadError<T> {
    error: {
        code: T
        message: string
    } | null
}

export class ValidationToError extends Error {}
