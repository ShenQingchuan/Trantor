export default function Default() {
  vineOptions({
    name: 'DefaultPage',
  })

  const router = useRouter()
  const { t } = useI18n()

  return vine`
    <div
      class="px-4 py-10 text-center dark:text-gray-200 h-full select-none text-center flex-1 col-flex justify-center"
    >
      <div class="text-6xl">
        <div class="i-twemoji:camping inline-block" />
      </div>
      <div class="mb-6 mt-6 col-flex text-3xl font-bold font-mono">
        <span class="slate-700 mr-2 text-6xl">404</span>
        <span class="mt-2 text-3xl font-sans">
          {{ t('oops_something_went_wrong') }}
        </span>
      </div>
      <div class="mt-2 text-3xl text-zinc-400:50 font-bold font-sans">
        {{ t('not_found') }}
      </div>
      <div class="mt-8 w-full row-flex justify-center">
        <button
          class="row-flex gap-2 rounded-md bg-zinc-700 px-4 py-2 text-white"
          @click="router.back()"
        >
          <div class="i-lucide:circle-arrow-left" />
          {{ t('go_back') }}
        </button>
      </div>
    </div>
  `
}
