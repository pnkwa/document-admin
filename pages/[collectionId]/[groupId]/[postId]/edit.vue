<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import { useRoute } from '#imports'
import DocumentLayout from '~/feature/layout/components/DocumentLayout.vue'
import type { OutputData } from '@editorjs/editorjs'
import { usePostStore } from '~/core/store/post'
import { toast } from 'vue-sonner'
import { toastActionError } from '~/feature/layout/utils/toast-helper'
import type { SaveEvent } from '~/plugins/editor'
import { ArrowLeft, Save } from 'lucide-vue-next'

const route = useRoute()
const breadcrumbs = useBreadcrumbs()
const collectionId = computed(() => Number(route.params.collectionId))
const groupId = computed(() => Number(route.params.groupId))
const postId = computed(() => Number(route.params.postId))

const store = usePostStore()

const isLoading = computed(() => store.isDetailLoading(postId.value))
const isSaving = ref(false)
const isChange = ref(false)
const title = ref('Untitled')
const editorRef = useTemplateRef<{ getValue: () => Promise<SaveEvent> }>('editorRef')

const initialData = computed<OutputData>(() => store.getEditorOutput(postId.value))

const docTitlePreview = computed(() => title.value.trim() || 'Untitled document')
const unsavedLabel = computed(() => (isChange.value ? 'Unsaved changes' : 'All changes saved'))
const unsavedIndicatorClass = computed(() =>
    isChange.value ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
)
const lastUpdatedDisplay = computed(() => (isSaving.value ? 'Saving…' : 'Ready to save'))
const isSaveDisabled = computed(() => isSaving.value || !isChange.value)

const previewRoute = computed(() => ({
    name: 'collectionId-groupId-postId',
    params: { collectionId: collectionId.value, groupId: groupId.value, postId: postId.value },
}))

const handleEditorSave = async (payload: { output: OutputData; html: string }) => {
    try {
        isSaving.value = true
        await store.savePostDetail(postId.value, {
            title: title.value.trim(),
            detail: JSON.stringify(payload.output),
            detailFormat: payload.html,
            isPublish: store.getPostDetailData(postId.value)?.postDetail.isPublish,
            status: store.getPostDetailData(postId.value)?.postDetail.status,
            sorting: store.getPostDetailData(postId.value)?.postDetail.sorting,
        })
        toast('Saved', { description: 'Document updated.' })
    } catch (err) {
        toastActionError('update', 'post', err)
    } finally {
        isSaving.value = false
    }
}

const handleSave = async () => {
    if (!editorRef.value) return
    try {
        isSaving.value = true
        const val = await editorRef.value.getValue()
        if (!val) return
        await store.savePostDetail(postId.value, {
            title: title.value.trim(),
            detail: JSON.stringify(val.output),
            detailFormat: val.html,
            isPublish: store.getPostDetailData(postId.value)?.postDetail.isPublish,
            status: store.getPostDetailData(postId.value)?.postDetail.status,
            sorting: store.getPostDetailData(postId.value)?.postDetail.sorting,
        })
        isChange.value = false
        toast('Saved', { description: 'Document updated.' })
    } catch (err) {
        toastActionError('update', 'post', err)
    } finally {
        isSaving.value = false
    }
}

onMounted(async () => {
    try {
        await breadcrumbs.setFromRoute(route)
        await store.isPostDetail(postId.value)
        title.value = store.getPostDetailData(postId.value)?.postDetail.title ?? 'Untitled'
    } catch (error) {
        toastActionError('load', 'document', error)
    }
})
</script>

<template>
    <DocumentLayout class="flex flex-col">
        <section
            class="border-b border-gray-200 bg-gradient-to-br from-primary/8 via-transparent to-transparent px-4 py-4 dark:border-gray-700 sm:px-6 sm:py-5 lg:px-8"
        >
            <div class="flex flex-col gap-4">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div class="space-y-2">
                        <p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Document editor
                        </p>
                        <h1 class="text-lg font-semibold text-primary sm:text-xl">
                            {{ docTitlePreview }}
                        </h1>
                        <div class="flex items-center gap-3 text-xs text-muted-foreground">
                            <span class="flex items-center gap-1">
                                <span
                                    class="inline-block size-2 rounded-md"
                                    :class="unsavedIndicatorClass"
                                />
                                <span>{{ unsavedLabel }}</span>
                            </span>
                            <span>{{ lastUpdatedDisplay }}</span>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <NuxtLink :to="previewRoute" class="shrink-0">
                            <DocButton
                                variant="ghost"
                                size="sm"
                                class="gap-2 border border-primary/50 text-primary hover:text-primary"
                            >
                                <ArrowLeft class="size-4" />
                                <span>Back to preview</span>
                            </DocButton>
                        </NuxtLink>

                        <DocButton
                            variant="default"
                            size="sm"
                            class="min-w-[140px]"
                            :loading="isSaving"
                            :disabled="isSaveDisabled"
                            @click="handleSave"
                        >
                            <div class="flex gap-2">
                                <Save class="size-4" />
                                <span>{{ isSaving ? 'Saving…' : 'Save changes' }}</span>
                            </div>
                        </DocButton>
                    </div>
                </div>
            </div>
        </section>

        <div
            class="flex-1 overflow-y-auto bg-slate-100/5 px-4 py-8 dark:bg-slate-950/10 sm:px-6 lg:px-10"
        >
            <div class="mx-auto w-full max-w-[980px]">
                <div v-if="isLoading" class="flex justify-center py-20">
                    <DocSpinner />
                </div>
                <template v-else>
                    <div
                        class="rounded-md bg-white shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)] ring-1 ring-slate-200 dark:bg-slate-900/10 dark:ring-slate-700"
                    >
                        <div class="border-b border-slate-200 px-8 py-6 dark:border-slate-700">
                            <label
                                class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300"
                            >
                                Title
                            </label>
                            <input
                                v-model="title"
                                type="text"
                                class="mt-2 w-full bg-transparent text-3xl font-semibold text-slate-900 outline-none dark:text-slate-100"
                                placeholder="Untitled document"
                                @input="isChange = true"
                            />
                        </div>

                        <div class="px-6 py-8 sm:px-10">
                            <DocEditorBlock
                                ref="editorRef"
                                v-model:editor-output-data="initialData"
                                v-model:is-change="isChange"
                                :daywork-document-group-id="groupId"
                                :autofocus="true"
                                @save="handleEditorSave"
                            />
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </DocumentLayout>
</template>
