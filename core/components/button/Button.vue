<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { type ButtonVariants, buttonVariants } from '~/core/types/components/button'
import { Loader2 } from 'lucide-vue-next'

interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    class?: HTMLAttributes['class']
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
}

const target = ref<InstanceType<typeof Primitive>>()

const props = withDefaults(defineProps<Props>(), {
    as: 'button',
    variant: 'default',
    size: 'default',
    disabled: false,
    type: 'button',
    loading: false,
    class: '',
})
</script>

<template>
    <Primitive
        v-bind="props"
        ref="target"
        data-slot="button"
        :as="as"
        :as-child="asChild"
        :disabled="disabled || loading"
        :type="type"
        :aria-disabled="disabled || loading"
        :class="cn(buttonVariants({ variant, size }), props.class, `btn-${variant}`)"
    >
        <template v-if="!asChild && !props.disabled">
            <Loader2 v-if="loading" class="w-4 animate-spin" />
            <slot class="btn-content" />
        </template>

        <template v-else-if="!asChild && props.disabled">
            <span class="btn-disabled">
                <slot />
            </span>
        </template>

        <template v-if="asChild">
            <slot class="btn-content" />
        </template>
    </Primitive>
</template>
