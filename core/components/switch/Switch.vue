<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
    SwitchRoot,
    type SwitchRootEmits,
    type SwitchRootProps,
    SwitchThumb,
    useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<
    SwitchRootProps & {
        class?: HTMLAttributes['class']
        thumbClass?: HTMLAttributes['class']
    }
>()

const emits = defineEmits<SwitchRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'thumbClass')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
    <SwitchRoot
        data-slot="switch"
        v-bind="forwarded"
        :class="
            cn(
                'bg-[var(--color-navy-40)] inline-flex h-[18px] w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none',
                'data-[state=checked]:bg-[var(--color-primary-hover)]',
                'data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-[var(--color-navy-40)]',
                'focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                props.class,
            )
        "
    >
        <SwitchThumb
            data-slot="switch-thumb"
            :class="
                cn(
                    'pointer-events-none block size-3 rounded-full ring-0 transition-transform',
                    'bg-white dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-white',
                    'data-[state=checked]:translate-x-[calc(100%+8px)]',
                    'data-[state=unchecked]:translate-x-[2px]',
                    props.thumbClass,
                )
            "
        >
            <slot name="thumb" />
        </SwitchThumb>
    </SwitchRoot>
</template>
