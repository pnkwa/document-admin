<script setup lang="ts">
import {
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxLabel,
    ComboboxRoot,
    ComboboxSeparator,
    ComboboxTrigger,
    ComboboxViewport,
} from 'reka-ui'
import { cn } from '~/lib/utils'

interface OptionsGroup {
    name: string
    children: { value: string; name: string }[]
}

interface FlatOption {
    value: string
    name: string
}

interface Props {
    name?: string
    label?: string
    placeholder?: string
    description?: string
    required?: boolean
    options?: OptionsGroup[] | FlatOption[]
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

const normalizedOptions = computed(() => {
    if (!props.options || props.options.length === 0) {
        return { groups: [], isGrouped: false }
    }

    const firstItem = props.options[0]

    if ('children' in firstItem && 'name' in firstItem) {
        const groupedOptions = props.options as OptionsGroup[]
        return {
            groups: groupedOptions,
            isGrouped: true,
        }
    }

    const flatOptions = props.options as FlatOption[]
    return {
        groups: [
            {
                name: '',
                children: flatOptions,
            },
        ],
        isGrouped: false,
    }
})

const emits = defineEmits<{
    'update:modelValue': [value: string]
}>()

const field = useVeeValidateModel<string>(props, emits)

const modelValue = computed({
    get: () => field?.value.value || props.modelValue || '',
    set: (value: string) => {
        if (field?.value) {
            field.value.value = value
        }
        emits('update:modelValue', value)
    },
})

const errorMessageText = computed(() => {
    return field?.errorMessage?.value || ''
})

const shouldShowError = computed(() => {
    return field?.errorMessage?.value && field.errorMessage.value.length > 0
})

const isInvalidState = computed(() => {
    return !!(field?.errorMessage?.value && field.errorMessage.value.length > 0)
})
</script>

<template>
    <div>
        <DocLabel v-if="label" :for="name">
            {{ label }}
        </DocLabel>
        <div class="space-y-1">
            <ComboboxRoot v-model="modelValue" class="relative">
                <ComboboxAnchor
                    :class="
                        cn(
                            'min-w-[160px] inline-flex items-center justify-between rounded-lg border border-(--color-navy-40) hover:border-(--color-primary-hover) px-[15px] text-xs leading-none h-[35px] gap-[5px] bg-white text-foreground shadow-sm focus:shadow-[0_0_0_2px] focus:shadow-ring data-[placeholder]:text-muted-foreground outline-none transition-colors duration-300',
                            isInvalidState ? 'doc-select__invalid' : '',
                        )
                    "
                >
                    <ComboboxInput
                        class="!bg-transparent outline-none text-foreground h-full selection:bg-muted placeholder-muted-foreground"
                        :placeholder="placeholder"
                    />
                    <ComboboxTrigger>
                        <Icon
                            icon="radix-icons:chevron-down"
                            class="h-4 w-4 text-muted-foreground"
                        />
                    </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxContent
                    :class="
                        cn(
                            'absolute z-10 mt-1 min-w-[160px] bg-white overflow-hidden rounded-lg shadow-sm border border-(--color-navy-40) will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade',
                        )
                    "
                >
                    <ComboboxViewport class="p-[5px]">
                        <ComboboxEmpty
                            class="text-muted-foreground text-xs font-medium text-center py-2"
                        >
                            No results found
                        </ComboboxEmpty>

                        <template v-if="normalizedOptions.isGrouped">
                            <template
                                v-for="(group, index) in normalizedOptions.groups"
                                :key="group.name || 'group-' + index"
                            >
                                <ComboboxGroup>
                                    <ComboboxSeparator
                                        v-if="index !== 0"
                                        class="h-[1px] bg-(--color-navy-40) m-[5px]"
                                    />

                                    <ComboboxLabel
                                        v-if="group.name"
                                        class="px-[25px] text-xs leading-[25px] text-(--color-navy-40) font-medium"
                                    >
                                        {{ group.name }}
                                    </ComboboxLabel>

                                    <ComboboxItem
                                        v-for="option in group.children"
                                        :key="option.value"
                                        :value="option.value"
                                        class="doc-select__item"
                                    >
                                        <ComboboxItemIndicator
                                            class="absolute left-0 w-[25px] inline-flex items-center justify-center"
                                        >
                                            <Icon icon="radix-icons:check" class="h-3 w-3" />
                                        </ComboboxItemIndicator>
                                        <span>{{ option.name }}</span>
                                    </ComboboxItem>
                                </ComboboxGroup>
                            </template>
                        </template>

                        <template v-else>
                            <ComboboxItem
                                v-for="option in normalizedOptions.groups[0]?.children || []"
                                :key="option.value"
                                :value="option.value"
                                class="doc-select__item"
                            >
                                <ComboboxItemIndicator
                                    class="absolute left-0 w-[25px] inline-flex items-center justify-center"
                                >
                                    <Icon icon="radix-icons:check" class="h-3 w-3" />
                                </ComboboxItemIndicator>
                                <span>{{ option.name }}</span>
                            </ComboboxItem>
                        </template>
                    </ComboboxViewport>
                </ComboboxContent>
            </ComboboxRoot>

            <p v-if="description" class="doc-select__description">
                {{ description }}
            </p>

            <span v-if="shouldShowError && errorMessageText" class="doc-select__error-message">
                {{ errorMessageText }}
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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

    &[data-disabled] {
        color: var(--tw-color-muted-foreground);
        pointer-events: none;
    }

    &[data-highlighted] {
        outline: none;
        background-color: var(--tw-color-accent);
        color: var(--tw-color-accent-foreground);
    }

    &:hover {
        background-color: color-mix(in srgb, var(--color-primary-hover) 20%, transparent);
    }
}

.doc-select__description {
    color: var(--color-navy-60);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    margin-left: 2px;
}

.doc-select__invalid {
    border-color: var(--color-danger);
    background-color: var(--color-danger-light);
}

.doc-select__error-message {
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.25rem;
    margin-left: 2px;
}
</style>
