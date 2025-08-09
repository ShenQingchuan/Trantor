import { onClickOutside } from '@vueuse/core'
import { ref, useTemplateRef, watch } from 'vue'
import ProseEditor from './prose.vine'

export default function PromptEditor() {
  const isPinned = ref(false)
  const isShowFullEditor = ref(false)
  const editorContainerRef = useTemplateRef('editorContainerRef')
  const editorRef = useTemplateRef('editorRef')

  watch(isPinned, (isNowPinned) => {
    if (!isNowPinned)
      isShowFullEditor.value = false
  })

  onClickOutside(editorContainerRef, () => {
    if (isPinned.value)
      return

    isShowFullEditor.value = false
  })

  const onEditorFocus = (_: FocusEvent) => {
    isShowFullEditor.value = true
  }
  const onSendPrompt = () => {
    console.log('[Trantor] 发送提示词', editorRef.value?.editor.getDocJSON())
  }

  watchEffect(() => [
    window.promptEditor = editorRef.value?.editor,
  ])

  return vine`
    <div
      ref="editorContainerRef"
      :class="[
        'prompt-editor-container stack fixed bottom-0 px-4 pt-3',
        'left-50% transform-translate-x--50% mx-auto shadow-xl',
        'my-0 w-80vw min-h-80vh bg-slate-100 rounded-2xl rounded-smooth',
        'transition transition-duration-500 transition-ease border-(1px solid zinc-300)',
        isShowFullEditor
          ? 'transform-translate-y-50%'
          : 'transform-translate-y-80% filter-drop-shadow-xl',
      ]"
    >
      <div
        v-if="isShowFullEditor"
        v-motion-fade
        :duration="1000"
        class="wh-full relative row gap-4 z-2"
      >
        <div
          class="i-ri:send-plane-fill text-2xl text-zinc-400 cursor-pointer ml-auto absolute top-2 right-12"
          @click="onSendPrompt"
        />
        <div
          class="i-ri:pushpin-line text-2xl text-zinc-400 cursor-pointer ml-auto absolute top-2 right-2"
          :class="[isPinned ? '' : 'transform-rotate--45']"
          @click="isPinned = !isPinned"
        />
      </div>

      <div class="stack wh-full flex-1 pr-10">
        <ProseEditor ref="editorRef" @focus="onEditorFocus" />
      </div>
    </div>
  `
}
