<script setup lang="ts">
import { confirmDeleteGroup } from '~/core/services/group'
import type { Group } from '~/feature/layout/types/tree-sidebar'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

const props = defineProps<{
    group: Group
}>()

const emit = defineEmits<{
    (e: 'deleted' | 'cancel'): void
}>()
const handleDeleteGroup = async () => {
    try {
        await confirmDeleteGroup(props.group.dayworkDocumentGroupID)
        emit('deleted')
        toastActionSuccess('delete', 'group')
    } catch (error) {
        toastActionError('delete', 'group', error)
    }
}
</script>
<template>
    <DocAlertDialogContent>
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Delete group</DocAlertDialogTitle>
            <DocAlertDialogDescription>
                Are you sure you want to delete
                <b>{{ group?.name }}</b>
                ? This cannot be undone.
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>
        <DocAlertDialogFooter>
            <DocAlertDialogCancel class="cursor-pointer" @click="emit('cancel')">
                Cancel
            </DocAlertDialogCancel>
            <DocButton type="button" variant="destructive" @click="handleDeleteGroup">
                Delete
            </DocButton>
        </DocAlertDialogFooter>
    </DocAlertDialogContent>
</template>
