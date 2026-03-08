import { ref, computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useDocName, type Crumb } from '~/feature/layout/composables/useDocName'

export const useBreadcrumbs = defineStore('breadcrumbs', () => {
    const items = ref<Crumb[]>([])
    const title = computed(() => items.value.at(-1)?.label ?? 'Documentation')

    const set = (crumbs: Crumb[]) => {
        items.value = crumbs
    }
    const reset = () => {
        items.value = []
    }

    const { buildCrumbsFromRoute } = useDocName()
    const setFromRoute = async (route: Pick<RouteLocationNormalizedLoaded, 'params' | 'path'>) => {
        items.value = await buildCrumbsFromRoute(route)
    }

    return { items, title, set, reset, setFromRoute }
})
