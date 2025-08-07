import type { ColorName } from '../../utils/unocss-helpers'
import { useDebounceFn } from '@vueuse/core'
import homePageStatsIllustration from '../../assets/home-page__landing-illustration.svg'
import { useChatFlowStore } from '../../stores/chatFlowStore'
import { getButtonColorClassList } from '../../utils/unocss-helpers'

export function LandingGuideFeature() {
  const icon = vineProp<string>()
  const title = vineProp<string>()
  const color = vineProp<ColorName>()

  return vine`
    <div
      class="row gap-2 cursor-pointer select-none text-sm rounded-md px-3 py-1.5 filter-grayscale-25"
      :class="getButtonColorClassList(color)"
    >
      <div :class="icon" />
      <span>{{ title }}</span>
    </div>
  `
}

export function LandingGuide() {
  const { t } = useI18n()
  const { sendPrompt } = useChatFlowStore()

  interface GuideFeature {
    id: number
    icon: string
    prompt: string
    color: ColorName
  }
  const guideFeatures = ref<GuideFeature[]>([
    { id: 1, icon: 'i-lucide:search', prompt: t('home_page__landing_guide_feature_demo_1'), color: 'blue' },
    { id: 2, icon: 'i-lucide:alarm-clock', prompt: t('home_page__landing_guide_feature_demo_2'), color: 'orange' },
    { id: 3, icon: 'i-lucide:hand-coins', prompt: t('home_page__landing_guide_feature_demo_3'), color: 'pink' },
  ])

  const onGuideFeatureClick = useDebounceFn(async (feature: GuideFeature) => {
    await sendPrompt(feature.prompt)
  })

  return vine`
    <div class="row gap-10 py-5 mt-20 max-w-400 justify-center">
      <img :src="homePageStatsIllustration" alt="home-page__landing-illustration" class="w-50" />
      <div class="stack gap-1 self-stretch">
        <div class="row text-2xl font-bold gap-2">
          <div class="i-twemoji:waving-hand-light-skin-tone" />
          <span>{{ $t('home_page__landing_greeting') }}</span>
        </div>
        <div class="text-lg text-neutral-400 font-italic">{{ t('home_page__landing_subtitle') }}</div>

        <div class="stack gap-2 flex-1 mt-2">
          <div class="row gap-2 text-neutral-200">
            <div class="i-twemoji:magic-wand" />
            <div class="text-slate-400">{{ t('home_page__landing_come_and_try') }}</div>
          </div>
          <div class="stack gap-2 flex-wrap max-w-120">
            <LandingGuideFeature
              v-for="feature in guideFeatures"
              :key="feature.icon"
              :icon="feature.icon"
              :title="feature.prompt"
              :color="feature.color"
              @click="onGuideFeatureClick(feature)"
            />
          </div>
        </div>
      </div>
    </div>
  `
}
