<script lang="ts" setup>
import type { SelectRootEmits, SelectRootProps } from 'reka-ui'
import { SelectRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props extends SelectRootProps {
    name?: string
    label?: string
    placeholder?: string
    description?: string
    required?: boolean
    options?: { value: string; label: string }[]
    class?: string
    modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    label: '',
    placeholder: 'Select an option',
    description: '',
    required: false,
    options: () => [],
    class: '',
    modelValue: '',
})

const emits = defineEmits<
    SelectRootEmits & {
        'update:modelValue': [value: string]
    }
>()

const forwarded = useForwardPropsEmits(props, emits)

const field = useVeeValidateModel<string>(props, emits)

const errorMessageText = computed(() => {
    return field?.errorMessage?.value || ''
})

const shouldShowError = computed(() => {
    return field?.errorMessage?.value && field.errorMessage.value.length > 0
})

const isInvalidState = computed(() => {
    return !!(field?.errorMessage?.value && field.errorMessage.value.length > 0)
})

const updateVal = (value: string | number | bigint | Record<string, unknown> | null) => {
    const stringValue = value !== null && value !== undefined ? String(value) : ''
    field.value.value = stringValue
    emits('update:modelValue', stringValue)
}
</script>

<template>
    <div class="space-y-2">
        <DocLabel v-if="label" :for="name" class="doc-select__label">
            {{ label }}
        </DocLabel>

        <SelectRoot
            v-bind="forwarded"
            :model-value="field.value.value"
            :name="name"
            :class="cn('doc-select', { 'doc-select__invalid': isInvalidState })"
            @update:model-value="(value) => updateVal(value)"
        >
            <slot>
                <DocSelectUiSelectTrigger
                    :class="
                        cn(
                            'w-full doc-sßelect__trigger',
                            isInvalidState ? 'doc-select__invalid' : '',
                            props.class,
                        )
                    "
                >
                    <DocSelectUiSelectValue
                        :placeholder="placeholder"
                        :class="
                            cn('doc-select__value', {
                                'doc-select__value-placeholder': !modelValue,
                            })
                        "
                    />
                </DocSelectUiSelectTrigger>
                <DocSelectUiSelectContent>
                    <DocSelectUiSelectItem
                        v-for="option in options"
                        :key="option.value"
                        :value="option.value"
                        class="doc-select__item"
                    >
                        {{ option.label }}
                    </DocSelectUiSelectItem>
                </DocSelectUiSelectContent>
            </slot>
        </SelectRoot>

        <p v-if="description" class="doc-select__description">
            {{ description }}
        </p>

        <span v-if="shouldShowError && errorMessageText" class="doc-select__error-message">
            {{ errorMessageText }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
.doc-select {
    display: block;
    width: 100%;
    position: relative;
}

.doc-select__trigger {
    border-color: var(--color-navy-40) !important;

    &:hover {
        border-color: color-mix(in srgb, var(--color-primary-hover) 15%, transparent) !important;
        border-color: var(--color-primary-hover) !important;
    }
}

.doc-select {
    &__value {
        display: flex;
        align-items: center;
        font-size: 0.75rem;
        color: var(--color-text);
    }

    &__value-placeholder {
        color: var(--color-navy-40);
    }
}
.doc-select__label {
    display: block;
    font-weight: 500;
    color: var(--color-navy-60);
}

.doc-select__description {
    color: var(--color-navy-60);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    margin-left: 2px;
}

.doc-select__error-message {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.doc-select__item {
    font-size: 0.75rem;
    line-height: 1;
    color: var(--color-navy-60);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding-right: 35px;
    padding-left: 25px;
    position: relative;
    user-select: none;
    cursor: pointer;
    transition-property: background-color, color;
    transition-duration: 300ms;

    &:hover {
        background-color: color-mix(
            in srgb,
            var(--color-primary-hover) 20%,
            transparent
        ) !important;
        color: var(--color-text);
    }

    &[data-highlighted] {
        outline: none;
    }

    &[data-disabled] {
        color: var(--color-navy-40);
        pointer-events: none;
    }
}

:deep(.doc-select__invalid) {
    border-color: var(--color-danger) !important;
}

.dark {
    .doc-select__label {
        color: var(--color-navy-20);
    }

    .doc-select__item {
        color: var(--color-navy-20);

        &:hover {
            color: var(--color-navy-20);
        }
    }
}
</style>
