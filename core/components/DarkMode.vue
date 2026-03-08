<script setup lang="ts">
import { useColorMode, useCycleList } from '@vueuse/core'
import { watchEffect } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'

const mode = useColorMode({
    attribute: 'class',
    selector: 'html',
})

const { state, next } = useCycleList(['dark', 'light'] as const, {
    initialValue: mode,
})

watchEffect(() => (mode.value = state.value))
</script>

<template>
    <button @click="next()">
        <i v-if="state === 'dark'" i-carbon-moon inline-block align-middle class="align-middle">
            <Moon :stroke-width="1.8" />
        </i>
        <i v-if="state === 'light'" i-carbon-sun inline-block align-middle class="align-middle">
            <Sun :stroke-width="1.8" />
        </i>
    </button>
</template>
