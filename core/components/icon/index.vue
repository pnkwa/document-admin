<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { HTMLAttributes, Component } from 'vue'
import { cn } from '@/lib/utils'

interface IconProps {
    name: string
    size?: number | string
    strokeWidth?: number | string
    class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<IconProps>(), {
    size: 24,
    strokeWidth: 2,
    class: '',
})

const IconComponent = computed((): Component => {
    return defineAsyncComponent(async () => {
        try {
            const icons = await import('lucide-vue-next')
            const iconComponent = icons[props.name as keyof typeof icons] as Component

            if (!iconComponent) {
                return icons.AlertCircle as Component
            }

            return iconComponent
        } catch {
            const { AlertCircle } = await import('lucide-vue-next')
            return AlertCircle as Component
        }
    })
})

const iconProps = computed(() => ({
    size: props.size,
    strokeWidth: props.strokeWidth,
    class: cn(props.class),
}))
</script>

<template>
    <component :is="IconComponent" v-bind="iconProps" />
</template>
