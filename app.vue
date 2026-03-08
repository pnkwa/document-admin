<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
        <Toaster class="pointer-events-auto" />
    </NuxtLayout>
</template>
