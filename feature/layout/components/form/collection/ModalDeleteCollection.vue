<script setup lang="ts">
import type { Collection } from '~/feature/layout/types/tree-sidebar'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

const props = defineProps<{
    collection: Collection
}>()

const emit = defineEmits<{
    (e: 'deleted' | 'cancel'): void
}>()

const handleDeleteCollection = async () => {
    try {
        await confirmDeleteCollection(props.collection.dayworkDocumentCollectionID)
        toastActionSuccess('delete', 'collection')
        emit('deleted')
    } catch (error) {
        toastActionError('delete', 'collection', error)
    }
}
</script>
<template>
    <DocAlertDialogContent>
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Delete Collection</DocAlertDialogTitle>
            <DocAlertDialogDescription>
                Are you sure you want to delete
                <b>{{ collection?.name }}</b>
                ? This cannot be undone.
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>
        <DocAlertDialogFooter>
            <DocAlertDialogCancel @click="emit('cancel')">Cancel</DocAlertDialogCancel>
            <DocButton type="button" variant="destructive" @click="handleDeleteCollection">
                Delete
            </DocButton>
        </DocAlertDialogFooter>
    </DocAlertDialogContent>
</template>
