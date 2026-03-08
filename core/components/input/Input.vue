<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { type InputVariants, inputVariants } from '../../types/components/input'
import { Primitive, type PrimitiveProps } from 'reka-ui'

interface props extends PrimitiveProps {
    class?: HTMLAttributes['class']
    size?: InputVariants['size']
    type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'tel' | 'url'
    placeholder?: string
    label?: string
    maxLength?: number
    description?: string
    name?: string
    clearable?: boolean
}

const props = withDefaults(defineProps<props>(), {
    as: 'input',
    type: 'text',
    size: 'md',
    class: '',
    placeholder: '',
    label: '',
    maxLength: undefined,
    description: '',
    name: '',
    clearable: false,
})

const emits = defineEmits(['clickAction', 'update:modelValue', 'clear'])

const field = useVeeValidateModel<string | number>(props, emits)

const handleType = computed(() => {
    if (props.type === 'password') {
        return 'password'
    }
    return props.type || 'text'
})

const shouldShowError = computed(() => {
    return field?.errorMessage?.value && field.errorMessage.value.length > 0
})

const errorMessageText = computed(() => {
    return field?.errorMessage?.value || ''
})

const isInvalidState = computed(() => {
    return !!(field?.errorMessage?.value && field.errorMessage.value.length > 0)
})

const convertMaxLengthToNumber = computed(() => {
    if (!props.maxLength || typeof props.maxLength !== 'number') {
        return false
    }

    const currentValue = field.value?.value
    if (currentValue === undefined || currentValue === null) {
        return false
    }

    const stringValue = String(currentValue)
    return stringValue.length >= props.maxLength
})

const isTypingNumber = (evt: KeyboardEvent) => {
    if (
        evt.key === 'Backspace' ||
        evt.key === 'Delete' ||
        evt.key === 'ArrowLeft' ||
        evt.key === 'ArrowRight' ||
        evt.key === 'Tab'
    ) {
        return true
    }

    if (evt.key === '.' && props.type === 'number') {
        const currentValue = String(field.value?.value || '')
        if (!currentValue.includes('.')) {
            return true
        }
    }

    const isNumber = /^[0-9]$/.test(evt.key)

    if (!isNumber) {
        evt.preventDefault()
        return false
    }

    if (convertMaxLengthToNumber.value) {
        evt.preventDefault()
        return false
    }

    return true
}
</script>

<template>
    <Primitive class="doc-input">
        <DocLabel v-if="props.label" for="input" class="doc-input__label">
            {{ props.label }}
        </DocLabel>

        <input
            :value="field.value.value"
            :class="cn(inputVariants({ size: props.size }), props.class, 'doc-input-error')"
            data-slot="input"
            :type="handleType"
            :aria-invalid="isInvalidState"
            :placeholder="props.placeholder"
            @input="
                (val) => {
                    field.value.value = (val.target as HTMLInputElement).value
                }
            "
            @keypress="props.type === 'number' && isTypingNumber($event)"
        />

        <span v-if="props.description" class="doc-input__description">
            {{ props.description }}
        </span>

        <span v-if="shouldShowError && errorMessageText" class="doc-input__error-message">
            {{ errorMessageText }}
        </span>
    </Primitive>
</template>

<style lang="scss" scoped>
.doc-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;

    &__label {
        display: block;
        font-weight: 500;
        color: var(--color-text);
    }

    &__description {
        color: var(--color-navy-60);
        font-size: 0.875rem;
        margin-top: 0.5rem;
        margin-left: 2px;
    }

    &__error-message {
        color: var(--color-danger);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        margin-left: 2px;
    }
}
</style>
