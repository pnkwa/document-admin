<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<SelectValueProps>()
</script>

<template>
    <SelectValue
        data-slot="select-value"
        v-bind="props"
        :class="cn('doc-select__value', { 'doc-select__value--placeholder': props.placeholder })"
    >
        <slot />
    </SelectValue>
</template>

<style scoped>
.doc-select__value {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: var(--color-navy-40);
}
</style>
