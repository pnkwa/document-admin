<script lang="ts" setup generic="T extends Record<string, undefined>">
import { Form, type FormContext, type TypedSchema } from 'vee-validate'

const props = defineProps<{
    validationSchema: TypedSchema<T>
}>()

const emit = defineEmits<{
    (e: 'submit', values: T, form: FormContext<T>): void
}>()
</script>

<template>
    <Form
        :validation-schema="props.validationSchema"
        @submit="(values, ctx) => emit('submit', values as T, ctx as FormContext<T>)"
    >
        <slot />
    </Form>
</template>
