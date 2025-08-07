import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, union } from 'prosekit/core'
import { defineMention } from 'prosekit/extensions/mention'
import { definePlaceholder } from 'prosekit/extensions/placeholder'
import { ProseKit, useEditor } from 'prosekit/vue'

import {
  AutocompleteEmpty,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopover,
} from 'prosekit/vue/autocomplete'
import { ref, useTemplateRef, watchPostEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import 'prosekit/basic/style.css'
import 'prosekit/basic/typography.css'

function createExtension() {
  const { t } = useI18n()
  return union(
    defineBasicExtension(),
    defineMention(),
    definePlaceholder({
      placeholder: t('prompt_editor__placeholder'),
    }),
  )
}
type EditorExtension = ReturnType<typeof createExtension>

function MentionSymbol() {
  const editor = useEditor<EditorExtension>()
  const tags = ref<Array<any>>([])

  const handleTagInsert = (id: number, label: string) => {
    editor.value.commands.insertMention({
      id: id.toString(),
      value: `@${label}`,
      kind: 'symbol',
    })
    editor.value.commands.insertText({ text: ' ' })
  }

  return vine`
    <AutocompletePopover
      :regex="/@[\da-z]*$/i"
      :class="[
        'relative block max-h-100 min-w-60 text-white',
        'select-none overflow-auto whitespace-nowrap',
        ' p-1 z-10 rounded-lg border-(1px solid zinc-300)',
        'bg-neutral-100 shadow-lg',
        '[&:not([data-state])]:hidden',
      ]"
    >
      <AutocompleteList>
        <AutocompleteEmpty
          :class="[
            'relative flex items-center justify-between text-zinc-400',
            'scroll-my-1 rounded px-3 text-sm',
            'py-1.5 cursor-default select-none',
            'whitespace-nowrap outline-none ',
            'data-[focused]:bg-zinc-500 ',
          ]"
        >
          {{ $t('prompt_editor__no_at_result') }}
        </AutocompleteEmpty>
        <AutocompleteItem
          v-for="tag in tags"
          :key="tag.id"
          :class="[
            'relative flex items-center justify-between text-black',
            'scroll-my-1 rounded px-3',
            'py-1.5 cursor-default select-none',
            'whitespace-nowrap outline-none ',
            'data-[focused]:bg-neutral-200 ',
          ]"
          @select="() => handleTagInsert(tag.id, tag.label)"
        >
          {{ tag.label }}
        </AutocompleteItem>
      </AutocompleteList>
    </AutocompletePopover>
  `
}

export default function ProseEditor() {
  const emits = vineEmits<{ focus: [e: FocusEvent] }>()

  const editorRef = useTemplateRef('editorRef')
  const editor = createEditor({
    extension: createExtension(),
  })

  watchPostEffect((onCleanup) => {
    editor.mount(editorRef.value)
    onCleanup(() => editor.unmount())
  })

  vineExpose({
    editor,
  })

  return vine`
    <ProseKit :editor="editor">
      <div
        ref="editorRef"
        class="flex-1 outline-none px-4 pt-2 font-sans h-full"
        spellcheck="false"
        @focus="emits('focus', $event)"
      />

      <MentionSymbol />
    </ProseKit>
  `
}
