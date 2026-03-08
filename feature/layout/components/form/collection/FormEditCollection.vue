<script setup lang="ts">
import { useForm } from 'vee-validate'

import {
    updateCollection,
    validateCollectionSchema,
    type CollectionSchema,
} from '~/core/services/collection'
import type { Collection } from '~/feature/layout/types/tree-sidebar'
import { toastActionError, toastActionSuccess } from '~/feature/layout/utils/toast-helper'

const props = defineProps<{
    collection: Collection
}>()

const emit = defineEmits<{
    (e: 'updated' | 'cancel'): void
}>()

const formEditCollection = useForm<CollectionSchema>({
    validationSchema: validateCollectionSchema,
    initialValues: {
        name: props.collection.name,
        slug: props.collection.slug,
        isPrivate: props.collection.isPrivate,
    },
})

const handleEditCollection = formEditCollection.handleSubmit(async (values) => {
    try {
        await updateCollection(props.collection.dayworkDocumentCollectionID, values)
        toastActionSuccess('update', 'collection')
        emit('updated')
    } catch (error) {
        toastActionError('update', 'collection', error)
    }
})
</script>

<template>
    <form @submit.prevent="handleEditCollection">
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
