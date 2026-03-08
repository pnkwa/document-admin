<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cn } from '@/lib/utils'

// eslint-disable-next-line vue/require-default-prop
const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes['class'] }>(), {
    as: 'a',
})
</script>

<template>
    <Primitive
        data-slot="breadcrumb-link"
        :as="as"
        :as-child="asChild"
        :class="cn('hover:text-foreground transition-colors', props.class)"
    >
        <slot />
    </Primitive>
</template>
