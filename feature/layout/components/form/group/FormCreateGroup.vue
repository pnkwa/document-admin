<script setup lang="ts">
import { useForm } from 'vee-validate'
import { validateGroupFormSchema, type GroupForm } from '~/core/services/group'
import type { Group } from '~/feature/layout/types/tree-sidebar'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

const props = defineProps<{
    collectionId: number
}>()

const emit = defineEmits<{
    (e: 'submitted', item?: Group): void
    (e: 'cancel'): void
}>()

const { handleSubmit, resetForm } = useForm<GroupForm>({
    validationSchema: validateGroupFormSchema,
    initialValues: {
        name: '',
        slug: '',
    },
})
const handleCreateGroup = handleSubmit(async (values) => {
    try {
        const res = await createGroup(props.collectionId, values)
        const item = res?.data?.data?.item as Group | undefined
        resetForm()
        emit('submitted', item)
        toastActionSuccess('create', 'group')
    } catch (error) {
        toastActionError('create', 'group', error)
    }
})
</script>
<template>
    <form @submit.prevent="handleCreateGroup">
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Add Group</DocAlertDialogTitle>
            <DocAlertDialogDescription class="space-y-3">
                <DocInput name="name" label="Name" placeholder="Enter the group name" />

                <DocInput name="slug" label="Slug" placeholder="Enter the group slug" />
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>

        <DocAlertDialogFooter>
            <DocAlertDialogCancel @click="emit('cancel')">Cancel</DocAlertDialogCancel>
            <DocButton type="submit">Create</DocButton>
        </DocAlertDialogFooter>
    </form>
</template>
