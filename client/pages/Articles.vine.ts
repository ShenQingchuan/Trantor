import type { ArticleMetadata, ArticleResponse } from '../../bridge/types/articles'
import { useAsyncState, useDark } from '@vueuse/core'
import { format } from 'date-fns'
import { NSkeleton } from 'naive-ui'
import { ofetch } from 'ofetch'
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
  const { state, isLoading, isReady } = useAsyncState<ArticleResponse>(() => {
    return ofetch(`/api/articles/${articlePath}?theme=${isDark.value ? 'dark' : 'light'}`).then(res => res.data)
  }, { content: '', metadata: null })

  const formatDate = (date: string) => {
    return format(new Date(date), 'yyyy-MM-dd')
  }

  return vine`
    <div class="mb-30 mt-10 h-full w-screen px-10 md:mt-24 sm:px-15%">
      <template v-if="isReady && state.metadata">
        <BackToArticleList />

        <div class="col-flex gap-1 md:row-flex">
          <div class="row-flex">
            <div class="i-lucide:calendar-days mr-2 text-secondary" />
            <div class="text-secondary">
              {{ $t('article_posted_on') }} {{ formatDate(state.metadata.date) }}
            </div>
          </div>
          <div class="mx-4 w-1px self-stretch bg-gray-400:50 tablet-hidden" />
          <div class="row-flex">
            <div class="i-lucide:tag mr-2 text-secondary" />
            <div class="text-secondary font-mono">
              <span>{{ state.metadata.category }}</span>
            </div>
          </div>
        </div>
        <div class="trantor-blog-article" v-html="state.content" />

        <BackToArticleList />
      </template>
      <div
        v-else-if="!isLoading && !isReady"
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
      <div v-else class="mt-8 w-full col-flex gap-4">
        <div class="row-flex gap-4 text-2xl text-zinc-500:50 font-500">
          <div class="i-svg-spinners:bars-scale-fade text-2xl" />
          {{ $t('articles_loading') }}
        </div>
        <NSkeleton v-for="i in 16" :key="i" animated text :style="{ width: randomSkeletonWidth() }" />
      </div>
    </div>
  `
}

export function PageArticles() {
  const router = useRouter()
  const { state, isLoading } = useAsyncState<{ articles: ArticleMetadata[] }>(() => {
    return ofetch('/api/articles/list').then(res => res.data)
  }, { articles: [] })

  const articlePath = (article: ArticleMetadata) => {
    return `/articles/${decodeURIComponent(article.path)}`
  }
  const articleDate = (article: ArticleMetadata) => {
    return format(new Date(article.date), 'yyyy-MM-dd')
  }

  return vine`
    <div v-if="isLoading" class="trantor-articles h-full w-full col-flex flex-1 gap-4 p-16 md:px-20%">
      <div class="h-full w-full col-flex gap-8">
        <div class="row-flex gap-4 text-2xl text-zinc-500:50 font-500">
          <div class="i-svg-spinners:bars-scale-fade text-2xl" />
          {{ $t('articles_list_loading') }}
        </div>
        <div class="col-flex gap-4">
          <NSkeleton
            v-for="i in 10"
            :key="i"
            text
            animated
            :style="{ width: randomSkeletonWidth() }"
          />
        </div>
      </div>
    </div>
    <div v-else class="trantor-articles h-full w-full col-flex flex-1 gap-4 p-16 md:px-20%">
      <div class="mb-4 text-3xl font-bold">
        {{ $t('articles_list_title') }}
      </div>
      <div class="col-flex gap-4">
        <div
          v-for="article in state.articles"
          :key="article.title"
          class="article-item w-full col-flex gap-2 sm:row-flex"
        >
          <a
            :href="articlePath(article)"
            class="article-title sm:w-full md:max-w-4/6 row-flex gap-2 text-xl"
            @click.prevent="router.push(articlePath(article))"
          >
            <div
              class="overflow-hidden text-ellipsis whitespace-nowrap hover:(text-sky-700 dark:text-sky-300)"
            >
              {{ article.title }}
            </div>
            <div
              class="article-category ml-1 w-fit border-1 badge-color-amber rounded px-1.25 py-1 text-xs font-mono transition transition-duration-300 whitespace-nowrap hidden bs:block"
            >
              {{ article.category }}
            </div>
          </a>
          <p
            class="cursor-silent flex-shrink-0 whitespace-nowrap text-secondary font-mono sm:ml-auto"
          >
            {{ articleDate(article) }}
          </p>
        </div>
      </div>
    </div>
  `
}
