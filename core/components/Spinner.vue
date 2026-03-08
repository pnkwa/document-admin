<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
</script>

<template>
    <div class="flex justify-center py-6">
        <LoaderCircle class="w-5 h-5 animate-spin text-muted-foreground" color="#9333ea" />
        <span class="sr-only">Loading...</span>
    </div>
</template>
