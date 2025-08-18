import type { ArticleMetadata } from '../../bridge/types/articles'
import { useQuery } from '@pinia/colada'
import { format } from 'date-fns'
import { ofetch } from 'ofetch'
import { randomSkeletonWidth, Skeleton } from '../components/Shared.vine'
import { useArticleStore } from '../stores/articleStore'

export function PageArticles() {
  const router = useRouter()
  const articleStore = useArticleStore()

  const { state, asyncStatus } = useQuery<ArticleMetadata[]>({
    key: ['articlesList'],
    query: () => ofetch('/api/articles/list').then(res => res.data),
  })

  const articlePath = (article: ArticleMetadata) => {
    return `/articles/${decodeURIComponent(article.path)}`
  }
  const articleDate = (article: ArticleMetadata) => {
    return format(new Date(article.date), 'yyyy-MM-dd')
  }
  const getSkeletonRowsWidth = () => {
    return Array.from({ length: 10 }, () => randomSkeletonWidth())
  }

  // 处理文章点击，预加载内容后跳转
  const handleArticleClick = async (article: ArticleMetadata) => {
    const path = article.path

    try {
      // 预加载文章内容
      await articleStore.preloadArticle(path)
      // 预加载完成后跳转
      router.push(articlePath(article))
    }
    catch {
      console.warn('预加载文章失败')
      router.push(articlePath(article))
    }
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
          <Skeleton
            :rows="10"
            :rows-width="getSkeletonRowsWidth()"
            wrapper-class="gap-4"
            row-class="h-4 bg-zinc-500/50 rounded"
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
          v-if="state.data.length > 0"
          v-for="article in state.data"
          :key="article.title"
          class="article-item w-full col-flex gap-2 sm:row-flex"
        >
          <a
            :href="articlePath(article)"
            class="article-title sm:w-full lg:max-w-6/8 row-flex gap-2 text-xl"
            @click.prevent="handleArticleClick(article)"
          >
            <div class="row-flex gap-2 items-center">
              <!-- 加载指示器 -->
              <div
                v-if="articleStore.isArticleLoading(article.path)"
                class="i-svg-spinners:bars-scale-fade text-lg text-sky-600 dark:text-sky-400 flex-shrink-0"
              />
              <div
                class="overflow-hidden text-ellipsis xl:whitespace-nowrap hover:(text-sky-700 dark:text-sky-300)"
                :class="{ 'opacity-70': articleStore.isArticleLoading(article.path) }"
              >
                {{ article.title }}
              </div>
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
