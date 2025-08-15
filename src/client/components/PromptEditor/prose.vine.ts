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
import '../../styles/prosekit.scss'

function createExtension() {
  const { t } = useI18n()
  return union(
    defineBasicExtension(),
    defineMention(),
    definePlaceholder({
      strategy: 'doc',
      placeholder: t('chat_flow__prompt_editor_placeholder'),
    }),
  )
}
type EditorExtension = ReturnType<typeof createExtension>

const MENTION_PATTERN_REGEX = /@[\da-z]*$/i
function MentionSymbol() {
  const { t } = useI18n()
  const editor = useEditor<EditorExtension>()
  const tags = ref<Array<any>>([
    { id: 1, label: 'John Doe', value: 'john_doe' },
    { id: 2, label: 'Mike Smith', value: 'mike_smith' },
    { id: 3, label: 'Jane Miller', value: 'jane_miller' },
  ])

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
      :regex="MENTION_PATTERN_REGEX"
      :class="[
        'relative block max-h-100 min-w-60 text-black dark:text-white',
        'select-none overflow-auto whitespace-nowrap',
        ' p-1 z-10 rounded-lg border-(1px solid zinc-300) dark:border-zinc-700',
        'bg-neutral-100 dark:bg-neutral-900 shadow-lg',
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
          {{ t('chat_flow__prompt_editor_no_at_result') }}
        </AutocompleteEmpty>
        <AutocompleteItem
          v-for="tag in tags"
          :key="tag.id"
          :class="[
            'relative flex items-center justify-between text-black dark:text-white',
            'scroll-my-1 rounded px-3',
            'py-1.5 cursor-default select-none',
            'whitespace-nowrap outline-none ',
            'data-[focused]:bg-neutral-200 dark:data-[focused]:bg-neutral-700',
          ]"
          @select="() => handleTagInsert(tag.id, tag.label)"
        >
          {{ tag.label }}
        </AutocompleteItem>
      </AutocompleteList>
    </AutocompletePopover>
  `
}

export default function ProseEditor(props: {
  containerClass?: string
}) {
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
        class="flex-1 outline-none font-sans h-full"
        :class="[containerClass]"
        spellcheck="false"
      />

      <MentionSymbol />
    </ProseKit>
  `
}
