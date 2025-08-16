export default function AboutMyOS() {
  const { t } = useI18n()

  // System version
  const systemVersion = 'v1.0.0'

  return vine`
    <div class="w-full h-full col-flex items-center justify-center p-4">
      <div class="max-w-sm w-full space-y-6">
        <div class="flex justify-center">
          <div class="i-mdi:linux text-8xl text-blue-800 dark:text-blue-400" />
        </div>

        <div class="text-center mt-1 pb-2">
          <h1 class="text-2xl font-sans font-bold text-gray-900 dark:text-white">MyOS</h1>
          <p class="font-sans text-gray-600 dark:text-gray-400">
            {{ t('about_myos_version', { version: systemVersion }) }}
          </p>
          <p class="font-sans text-gray-500 mt-4">
            {{ t('about_myos_description') }}
          </p>
        </div>
      </div>
    </div>
  `
}
