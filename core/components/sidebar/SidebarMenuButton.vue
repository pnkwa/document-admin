<script setup lang="ts">
import type { Component } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import SidebarMenuButtonChild, { type SidebarMenuButtonProps } from './SidebarMenuButtonChild.vue'
import { useSidebar } from '@/core/utils/sidebar'

defineOptions({
    inheritAttrs: false,
})

const props = withDefaults(
    defineProps<
        SidebarMenuButtonProps & {
            // eslint-disable-next-line vue/require-default-prop
            tooltip?: string | Component
        }
    >(),
    {
        as: 'button',
        variant: 'default',
        size: 'default',
    },
)

const { isMobile, state } = useSidebar()

const delegatedProps = reactiveOmit(props, 'tooltip')
</script>

<template>
    <SidebarMenuButtonChild v-if="!tooltip" v-bind="{ ...delegatedProps, ...$attrs }">
        <slot />
    </SidebarMenuButtonChild>

    <DocTooltip v-else>
        <DocTooltipTrigger as-child>
            <SidebarMenuButtonChild v-bind="{ ...delegatedProps, ...$attrs }">
                <slot />
            </SidebarMenuButtonChild>
        </DocTooltipTrigger>
        <DocTooltipContent side="right" align="center" :hidden="state !== 'collapsed' || isMobile">
            <template v-if="typeof tooltip === 'string'">
                {{ tooltip }}
            </template>
            <component :is="tooltip" v-else />
        </DocTooltipContent>
    </DocTooltip>
</template>
