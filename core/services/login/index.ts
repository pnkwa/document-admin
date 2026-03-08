import { z } from 'zod'
import axios from 'axios'

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
})

type LoginSchema = z.infer<typeof loginSchema>

export const login = (payload: LoginSchema): ApiResponse<LoginResponse> =>
    callApi(payload, loginSchema, (data) => {
        const { $axios } = useNuxtApp()
        return $axios.post('/admin/authentication/login', {
            username: data.username,
            password: data.password,
        })
    })

const refreshTokenSchema = z.string().jwt()

export const refreshToken = (refreshToken: string): ApiResponse<LoginResponse> =>
    callApi(refreshToken, refreshTokenSchema, (data) => {
        const {
            public: { apiBaseUrl },
        } = useRuntimeConfig()
        return axios.post(
            'admin/authentication/refreshtoken',
            {},
            {
                baseURL: apiBaseUrl,
                headers: {
                    Authorization: `Bearer ${data}`,
                },
            },
        )
    })
