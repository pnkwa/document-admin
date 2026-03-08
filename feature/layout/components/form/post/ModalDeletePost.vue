<script setup lang="ts">
import { ref, computed } from 'vue'
import { confirmDeletePost } from '~/core/services/post'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

type DeletablePost = {
    dayworkDocumentPostID: number
    title?: string
}
const props = defineProps<{
    post: DeletablePost
    requireTitleConfirm?: boolean
}>()

const emit = defineEmits<{
    (e: 'deleted' | 'cancel'): void
}>()

const isDeleting = ref(false)
const errorMsg = ref<string | null>(null)
const confirmText = ref('')

const canDelete = computed(() => {
    if (isDeleting.value) return false
    if (!props.requireTitleConfirm) return true
    return confirmText.value.trim() === (props.post.title ?? '').trim()
})

const onDelete = async () => {
    if (!canDelete.value) return
    try {
        isDeleting.value = true
        errorMsg.value = null
        await confirmDeletePost(props.post.dayworkDocumentPostID)
        toastActionSuccess('delete', 'post')
        emit('deleted')
    } catch (error) {
        const message = error instanceof ValidationToError ? error.message : 'Failed to delete post'
        errorMsg.value = message
        toastActionError('delete', 'post', error)
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
    <DocAlertDialogContent>
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Delete post</DocAlertDialogTitle>
            <DocAlertDialogDescription>
                This will permanently delete
                <b>{{ props.post.title }}</b>
                . This action cannot be undone.
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>

        <div v-if="requireTitleConfirm" class="my-3 space-y-2">
            <p class="text-xs text-muted-foreground">
                Type the post title to confirm:
                <b>{{ props.post.title }}</b>
            </p>
            <DocInput v-model="confirmText" placeholder="Post title" />
        </div>

        <p v-if="errorMsg" class="text-xs text-red-500 my-2">{{ errorMsg }}</p>

        <DocAlertDialogFooter>
            <DocAlertDialogCancel
                class="cursor-pointer"
                :disabled="isDeleting"
                @click="emit('cancel')"
            >
                Cancel
            </DocAlertDialogCancel>
            <DocButton type="button" variant="destructive" :disabled="!canDelete" @click="onDelete">
                {{ isDeleting ? 'Deleting…' : 'Delete' }}
            </DocButton>
        </DocAlertDialogFooter>
    </DocAlertDialogContent>
</template>
