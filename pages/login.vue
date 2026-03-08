<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { LogIn } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
    layout: 'no-navbar',
})

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const auth = useAuth()
const router = useRouter()

const isLoading = ref(false)

const form = useForm<LoginForm>({
    validationSchema: toTypedSchema(loginSchema),
    initialValues: {
        username: '',
        password: '',
    },
})

const handleLogin = form.handleSubmit(async (values: LoginForm) => {
    try {
        isLoading.value = true

        const res = await login(values)

        if (res.data.error) {
            toast.error('Invalid username or password')

            return
        }

        if (res.data.data?.item.accessToken) {
            auth.signInAuth(res.data.data.item.accessToken, res.data.data.item.refreshToken)
            toast.success('Login successful!')
            await router.push('/')
        }
    } catch {
        toast.error('An error occurred during login. Please try again.')
    } finally {
        isLoading.value = false
    }
})

watchEffect(() => {
    if (auth.isLogin) {
        router.push('/')
    }
})
</script>

<template>
    <div class="relative overflow-hidden flex justify-center items-center h-screen">
        <div
            class="flex relative justify-center min-w-2xl rounded-3xl border/50 bg-white/90 overflow-hidden shadow-2xl z-99"
        >
            <div
                class="absolute -left-60 -top-32 w-96 h-96 bg-primary/40 rounded-full blur-3xl"
            ></div>
            <div
                class="absolute -right-24 -bottom-24 w-80 h-80 bg-primary/40 dark:bg-pink-500/20 rounded-full blur-2xl"
            ></div>
            <div
                class="absolute right-80 bottom-48 w-80 h-80 bg-primary/40 dark:bg-pink-500/20 rounded-full blur-2xl"
            ></div>
            <aside class="relative min-w-lg hidden lg:flex items-center justify-center">
                <svg class="absolute inset-0 opacity-20" aria-hidden="true">
                    <defs>
                        <pattern id="dw-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path
                                d="M24 0H0V24"
                                class="stroke-current"
                                fill="none"
                                stroke-width="1"
                            />
                        </pattern>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="url(#dw-grid)"
                        class="text-gray-300 dark:text-white/10"
                    ></rect>
                </svg>

                <div class="relative m-6 z-10 max-w-sm w-full px-10">
                    <div class="flex items-center gap-3 mb-6">
                        <div
                            class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center"
                        >
                            <svg
                                class="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6l6 6V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <span class="text-lg font-semibold">Docs</span>
                        <!-- <span
                            class="ml-auto text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5"
                        >
                            Staging
                        </span> -->
                    </div>

                    <h2 class="text-3xl font-semibold leading-tight mb-4">Document Admin</h2>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">
                        Streamline document control. Faster approvals. Clear audit trails.
                    </p>
                    <img src="/public/icons/avatar-daywork.svg" class="w-[60%] h-[60%]" />

                    <p class="mt-8 text-xs text-gray-500 dark:text-gray-400">
                        © 2024 Document Admin
                    </p>
                </div>
            </aside>

            <main role="main" class="flex min-w-lg items-center justify-center p-6 m-6 sm:p-10">
                <div class="w-full max-w-lg">
                    <div class="text-center mb-6">
                        <h1 class="text-2xl font-semibold text-primary">Sign in</h1>
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            Use your account credentials
                        </p>
                    </div>

                    <div
                        class="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur p-8 sm:p-10 shadow-sm"
                    >
                        <form class="flex flex-col gap-2" @submit="handleLogin">
                            <DocInput
                                name="username"
                                label="Username"
                                type="text"
                                placeholder="username"
                                :disabled="isLoading"
                                aria-describedby="username-help"
                            />

                            <DocInput
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="password"
                                :disabled="isLoading"
                            />

                            <DocButton type="submit" class="w-full" :disabled="isLoading">
                                <DocSpinner v-if="isLoading" class="mr-2 h-4 w-4" />
                                <LogIn v-else :size="16" class="mr-2" />
                                {{ isLoading ? 'Signing in...' : 'Sign In' }}
                            </DocButton>
                        </form>
                    </div>

                    <div
                        class="mt-6 flex items-center justify-end text-sm text-gray-600 dark:text-gray-300"
                    >
                        <div>
                            Need help?
                            <span class="font-medium text-primary">Contact your administrator</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <img
            src="/public/background/blobs/blob.webp"
            class="absolute -right-120 -bottom-120"
            style="animation: spin 120s linear infinite"
        />
        <img
            src="/public/background/blobs/blob.webp"
            class="absolute -right-20 -bottom-30 opacity-50 size-3/6 rotate-160"
        />
        <img
            src="/public/background/blobs/blob2.webp"
            class="absolute -left-60 -top-80 opacity-100 rotate-60"
        />
        <img
            src="/public/background/blobs/blob2.webp"
            class="absolute -left-60 -top-80 opacity-30 size-4/5 rotate-60"
            style="animation: spin 120s linear infinite"
        />

        <img
            src="/public/background/blobs/blob3.webp"
            class="absolute -right-120 -top-80 rotate-180 opacity-80 h-3/5 w-3/5"
            style="animation: spin 150s linear infinite"
        />

        <div class="absolute left-20 top-10 size-32 opacity-20">
            <svg viewBox="0 0 100 100" class="size-full">
                <path
                    d="M20,30 C40,10 70,20 80,40 C90,60 70,85 45,80 C20,75 5,50 20,30 Z"
                    fill="white"
                    class="animate-pulse"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="15s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>

        <div class="absolute right-32 top-32 size-24 opacity-15">
            <svg viewBox="0 0 100 100" class="size-full">
                <path
                    d="M25,35 C50,15 80,25 85,50 C90,75 65,90 40,85 C15,80 0,55 25,35 Z"
                    fill="#9333ea"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;-360 50 50"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>

        <div class="absolute bottom-32 right-20 size-28 opacity-25">
            <svg viewBox="0 0 100 100" class="size-full">
                <path
                    d="M30,25 C55,5 85,15 90,45 C95,75 70,90 45,85 C20,80 5,50 30,25 Z"
                    fill="white"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="18s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>

        <div class="absolute bottom-16 left-180 size-20 opacity-20">
            <svg viewBox="0 0 100 100" class="size-full">
                <path
                    d="M35,30 C60,10 85,20 90,50 C95,80 70,95 45,90 C20,85 10,55 35,30 Z"
                    fill="#9333ea"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;-360 50 50"
                        dur="22s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>

        <div class="absolute left-16 top-1/2 size-16 opacity-30">
            <svg viewBox="0 0 100 100" class="size-full">
                <path
                    d="M40,35 C65,15 90,25 95,55 C100,85 75,100 50,95 C25,90 15,60 40,35 Z"
                    fill="white"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="25s"
                        repeatCount="indefinite"
                    />
                </path>
            </svg>
        </div>
    </div>
</template>
