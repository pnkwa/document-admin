<script setup lang="ts">
import { useForm } from 'vee-validate'
import { updateGroup, validateGroupFormSchema, type GroupForm } from '~/core/services/group'
import type { Group } from '~/feature/layout/types/tree-sidebar'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

const props = defineProps<{
    group: Group
}>()
const emit = defineEmits<{
    (e: 'updated' | 'cancel'): void
}>()

const formEditGroup = useForm<GroupForm>({
    validationSchema: validateGroupFormSchema,
    initialValues: {
        name: props.group.name,
        slug: props.group.slug,
    },
})

const handleEditGroup = formEditGroup.handleSubmit(async (values) => {
    try {
        await updateGroup(props.group.dayworkDocumentGroupID, values)
        emit('updated')
        toastActionSuccess('update', 'group')
    } catch (error) {
        toastActionError('update', 'group', error)
    }
})
</script>
<template>
    <form @submit.prevent="handleEditGroup">
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Edit Collection</DocAlertDialogTitle>
            <DocAlertDialogDescription class="space-y-3">
                <DocInput name="name" label="Name" />
                <DocInput name="slug" label="Slug" />
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>

        <DocAlertDialogFooter>
            <DocAlertDialogCancel @click="emit('cancel')">Cancel</DocAlertDialogCancel>
            <DocButton type="submit">Save</DocButton>
        </DocAlertDialogFooter>
    </form>
</template>
