<script setup lang="ts">
import { useForm } from 'vee-validate'
import { validateCollectionSchema, type CollectionSchema } from '~/core/services/collection'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

import type { Collection } from '~/feature/layout/types/tree-sidebar'

const emit = defineEmits<{
    (e: 'submitted', item?: Collection): void
    (e: 'cancel'): void
}>()

const formCreateCollection = useForm<CollectionSchema>({
    initialValues: {
        name: '',
        slug: '',
        isPrivate: false,
    },
    validationSchema: validateCollectionSchema,
})

const handleCreateCollection = formCreateCollection.handleSubmit(
    async (values: CollectionSchema) => {
        try {
            const res = await createCollection(values)
            if (!res) return
            const item = res?.data?.data?.item
            toastActionSuccess('create', 'collection')
            formCreateCollection.resetForm()
            emit('submitted', item)
        } catch (error) {
            toastActionError('create', 'collection', error)
        }
    },
)
</script>
<template>
    <form @submit.prevent="handleCreateCollection">
        <DocAlertDialogHeader>
            <DocAlertDialogTitle>Add Collection</DocAlertDialogTitle>
            <DocAlertDialogDescription>
                <DocInput name="name" label="Name" placeholder="Enter name" />

                <DocInput name="slug" label="Slug" placeholder="Enter slug" />
            </DocAlertDialogDescription>
        </DocAlertDialogHeader>

        <DocAlertDialogFooter>
            <DocAlertDialogCancel @click="emit('cancel')">Cancel</DocAlertDialogCancel>
            <DocButton type="submit">Confirm</DocButton>
        </DocAlertDialogFooter>
    </form>
</template>
