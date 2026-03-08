<script setup lang="ts">
import { useBreadcrumbs } from '~/core/store/breadcrumbs'

import { LogOut } from 'lucide-vue-next'
import AppSidebar from '~/feature/layout/components/AppSidebar.vue'

const breadcrumb = useBreadcrumbs()
const { items } = storeToRefs(breadcrumb)

const auth = useAuth()
const router = useRouter()

const handleLogout = async () => {
    auth.clearToken()
    await router.push('/login')
}
</script>

<template>
    <DocSidebarProvider class="app-shell">
        <AppSidebar />
        <main>
            <header
                class="flex h-[50px] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
                <div class="flex gap-2 px-4 justify-between w-full">
                    <div class="flex gap-2 items-center">
                        <DocSidebarTrigger class="-ml-1" />
                        <DocSeparator orientation="vertical" class="mr-2 h-4" />

                        <DocBreadcrumb>
                            <DocBreadcrumbList>
                                <template v-for="(crumb, i) in items" :key="i">
                                    <DocBreadcrumbItem>
                                        <DocBreadcrumbLink
                                            v-if="i < items.length - 1 && crumb.to"
                                            as-child
                                        >
                                            <NuxtLink
                                                :to="crumb.to"
                                                class="text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors"
                                            >
                                                {{ crumb.label }}
                                            </NuxtLink>
                                        </DocBreadcrumbLink>

                                        <DocBreadcrumbPage v-else>
                                            {{ crumb.label }}
                                        </DocBreadcrumbPage>
                                    </DocBreadcrumbItem>

                                    <DocBreadcrumbSeparator v-if="i < items.length - 1" />
                                </template>
                            </DocBreadcrumbList>
                        </DocBreadcrumb>
                    </div>

                    <div class="flex gap-4 items-center justify-center">
                        <DocDarkMode class="mx-2" />

                        <DocDropdownMenu>
                            <DocDropdownMenuTrigger as-child>
                                <button
                                    type="button"
                                    class="inline-flex items-center justify-center rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all"
                                    aria-label="User menu"
                                >
                                    <DocAvatar>
                                        <DocAvatarImage
                                            src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
                                            alt="User avatar"
                                        />
                                        <DocAvatarFallback>U</DocAvatarFallback>
                                    </DocAvatar>
                                </button>
                            </DocDropdownMenuTrigger>

                            <DocDropdownMenuContent class="w-56" align="end" side="bottom">
                                <DocDropdownMenuLabel class="font-normal">
                                    <div class="flex flex-col space-y-1">
                                        <p class="text-sm font-medium leading-none">User Account</p>
                                        <p class="text-xs leading-none text-muted-foreground">
                                            Signed in as admin
                                        </p>
                                    </div>
                                </DocDropdownMenuLabel>

                                <DocDropdownMenuSeparator />

                                <DocDropdownMenuItem
                                    class="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-300"
                                    @click="handleLogout"
                                >
                                    <LogOut :size="16" />
                                    <span>Sign out</span>
                                </DocDropdownMenuItem>
                            </DocDropdownMenuContent>
                        </DocDropdownMenu>
                    </div>
                </div>
            </header>

            <slot />
        </main>
    </DocSidebarProvider>
</template>

<style lang="scss">
main {
    width: 100%;
    height: 100dvh;
}
</style>
