export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuth()

    if (to.path === '/login' && auth.isLogin) {
        return navigateTo('/')
    }

    if (to.path !== '/login' && !auth.isLogin) {
        return navigateTo('/login')
    }
})
