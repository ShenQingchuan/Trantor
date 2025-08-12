import type { ArticleResponse } from '../../bridge/types/articles'
import { useQuery } from '@pinia/colada'
import { useDark } from '@vueuse/core'
import { format } from 'date-fns'
import { ofetch } from 'ofetch'
import { Skeleton } from '../components/Shared.vine'
import { randomSkeletonWidth } from '../utils/shared'
import '../styles/blog-article.scss'

function BackToArticleList() {
  const router = useRouter()

  return vine`
    <a
      class="mb-2 w-fit row-flex cursor-pointer text-zinc-400:80 font-mono hover:text-zinc-600 dark:hover:text-zinc-300"
      href="/articles"
      @click.prevent="router.push('/articles')"
    >
      cd ..
    </a>
  `
}

export function PageArticleContent() {
  const route = useRoute()
  const articlePath = route.params.path as string
  const isDark = useDark()

  const { state, asyncStatus } = useQuery<ArticleResponse>({
    key: [`articleContent-${articlePath}`],
    query: () => ofetch(`/api/articles/${articlePath}?theme=${isDark.value ? 'dark' : 'light'}`).then(res => res.data),
  })

  const formatDate = (date: string) => {
    return format(new Date(date), 'yyyy-MM-dd')
  }

  const getSkeletonRowsWidth = () => {
    return Array.from({ length: 16 }, () => randomSkeletonWidth())
  }

  return vine`
    <div class="mb-30 mt-10 h-full w-screen px-10 md:mt-24 sm:px-15%">
      <template v-if="state.data?.metadata">
        <BackToArticleList />

        <div class="col-flex gap-1 md:row-flex">
          <div class="row-flex">
            <div class="i-lucide:calendar-days mr-2 text-secondary" />
            <div class="text-secondary">
              {{ $t('article_posted_on') }} {{ formatDate(state.data.metadata.date) }}
            </div>
          </div>
          <div class="mx-4 w-1px self-stretch bg-gray-400:50 tablet-hidden" />
          <div class="row-flex">
            <div class="i-lucide:tag mr-2 text-secondary" />
            <div class="text-secondary font-mono">
              <span>{{ state.data.metadata.category }}</span>
            </div>
          </div>
        </div>
        <div class="trantor-blog-article" v-html="state.data.content" />

        <BackToArticleList />
      </template>
      <div
        v-else-if="state.status === 'error'"
        class="h-full w-auto col-flex items-center justify-center"
      >
        <div class="mb-6 mt-6 col-flex text-center text-3xl font-bold font-mono">
          <span class="slate-700 mr-2 text-6xl">404</span>
          <span class="mt-2 text-xl font-sans">
            {{ $t('oops_something_went_wrong') }}
          </span>
        </div>
        <div class="mt-2 text-center text-3xl text-zinc-400:50 font-bold font-sans">
          {{ $t('article_not_found') }}
        </div>
        <div class="mt-8 w-full row-flex justify-center">
          <button
            class="row-flex gap-2 rounded-md bg-zinc-700 px-4 py-2 text-white"
            @click="$router.back()"
          >
            <div class="i-lucide:circle-arrow-left" />
            {{ $t('go_back') }}
          </button>
        </div>
      </div>
      <div v-else-if="asyncStatus === 'loading'" class="mt-8 w-full col-flex gap-4">
        <div class="row-flex gap-4 text-2xl text-zinc-500:50 font-500">
          <div class="i-svg-spinners:bars-scale-fade text-2xl" />
          {{ $t('articles_loading') }}
        </div>
        <Skeleton
          :rows="16"
          :rows-width="getSkeletonRowsWidth()"
          wrapper-class="gap-4"
          row-class="h-4 bg-zinc-500/50 rounded"
        />
      </div>
    </div>
  `
}
