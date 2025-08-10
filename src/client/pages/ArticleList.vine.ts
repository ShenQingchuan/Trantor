import type { ArticleMetadata } from '../../bridge/types/articles'
import { useQuery } from '@pinia/colada'
import { format } from 'date-fns'
import { NSkeleton } from 'naive-ui'
import { ofetch } from 'ofetch'
import { randomSkeletonWidth } from '../utils/shared'

export function PageArticles() {
  const router = useRouter()
  const { state, asyncStatus } = useQuery<{ articles: ArticleMetadata[] }>({
    key: ['articlesList'],
    query: () => ofetch('/api/articles/list').then(res => res.data),
  })

  const articlePath = (article: ArticleMetadata) => {
    return `/articles/${decodeURIComponent(article.path)}`
  }
  const articleDate = (article: ArticleMetadata) => {
    return format(new Date(article.date), 'yyyy-MM-dd')
  }

  return vine`
    <div
      v-if="asyncStatus === 'loading'"
      class="trantor-articles h-full w-full col-flex flex-1 gap-4 p-16 md:px-20%"
    >
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
    <div
      v-else-if="state.data"
      class="trantor-articles h-full w-full col-flex flex-1 gap-4 p-10 lg:p-16 lg:px-20%"
    >
      <div class="mb-4 text-3xl font-bold">
        {{ $t('articles_list_title') }}
      </div>
      <div class="col-flex gap-4">
        <div
          v-if="state.data.articles.length > 0"
          v-for="article in state.data.articles"
          :key="article.title"
          class="article-item w-full col-flex gap-2 sm:row-flex"
        >
          <a
            :href="articlePath(article)"
            class="article-title sm:w-full lg:max-w-6/8 row-flex gap-2 text-xl"
            @click.prevent="router.push(articlePath(article))"
          >
            <div
              class="overflow-hidden text-ellipsis xl:whitespace-nowrap hover:(text-sky-700 dark:text-sky-300)"
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
        <div v-else class="text-center text-2xl text-zinc-500:50 font-500 h-100">
          {{ $t('articles_list_empty') }}
        </div>
      </div>
    </div>
  `
}
