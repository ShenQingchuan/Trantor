import type { CachedArticleResponse } from '../../bridge/types/articles.js'
import { useDark } from '@vueuse/core'
import { ofetch } from 'ofetch'

interface ArticleState {
  loading: boolean
  data: CachedArticleResponse | null
  error: string | null
}

interface ArticleLoadingState {
  [path: string]: boolean
}

const articleStoreId = 'trantor:article-store' as const

export const useArticleStore = defineStore(articleStoreId, () => {
  // 文章内容缓存
  const articleCache = ref<{ [path: string]: ArticleState }>({})

  // 当前正在加载的文章
  const loadingStates = ref<ArticleLoadingState>({})

  // 当前主题
  const isDark = useDark()

  /**
   * 获取文章加载状态
   */
  const isArticleLoading = (path: string): boolean => {
    return loadingStates.value[path] || false
  }

  /**
   * 获取缓存的文章内容
   */
  const getCachedArticle = (path: string): CachedArticleResponse | null => {
    return articleCache.value[path]?.data || null
  }

  /**
   * 检查文章是否已缓存
   */
  const isArticleCached = (path: string): boolean => {
    return !!articleCache.value[path]?.data && !articleCache.value[path]?.error
  }

  /**
   * 预加载文章内容
   */
  const preloadArticle = async (path: string): Promise<CachedArticleResponse> => {
    // 如果已经缓存且没有错误，直接返回
    if (isArticleCached(path)) {
      return articleCache.value[path].data!
    }

    // 如果正在加载，等待加载完成
    if (isArticleLoading(path)) {
      return new Promise((resolve, reject) => {
        const unwatch = watch(
          () => loadingStates.value[path],
          (loading) => {
            if (!loading) {
              unwatch()
              const cachedData = getCachedArticle(path)
              if (cachedData) {
                resolve(cachedData)
              }
              else {
                reject(new Error(articleCache.value[path]?.error || '加载失败'))
              }
            }
          },
        )
      })
    }

    // 开始加载
    loadingStates.value[path] = true

    // 初始化文章状态
    if (!articleCache.value[path]) {
      articleCache.value[path] = {
        loading: true,
        data: null,
        error: null,
      }
    }

    try {
      const theme = isDark.value ? 'dark' : 'light'
      const response = await ofetch(`/api/articles/${path}?theme=${theme}`)

      if (response.code === 0) {
        const articleData: CachedArticleResponse = {
          content: response.data.content,
          metadata: response.data.metadata,
          fromCache: response.data.fromCache || false,
          cacheUpdated: response.data.cacheUpdated || false,
        }

        // 更新缓存
        articleCache.value[path] = {
          loading: false,
          data: articleData,
          error: null,
        }

        return articleData
      }
      else {
        throw new Error(response.message || '文章加载失败')
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'

      // 更新错误状态
      articleCache.value[path] = {
        loading: false,
        data: null,
        error: errorMessage,
      }

      throw error
    }
    finally {
      // 清除加载状态
      loadingStates.value[path] = false
    }
  }

  /**
   * 清除文章缓存
   */
  const clearArticleCache = (path?: string) => {
    if (path) {
      delete articleCache.value[path]
      delete loadingStates.value[path]
    }
    else {
      articleCache.value = {}
      loadingStates.value = {}
    }
  }

  /**
   * 获取文章错误信息
   */
  const getArticleError = (path: string): string | null => {
    return articleCache.value[path]?.error || null
  }

  /**
   * 重新加载文章（忽略缓存）
   */
  const reloadArticle = async (path: string): Promise<CachedArticleResponse> => {
    // 清除当前缓存
    clearArticleCache(path)
    // 重新加载
    return preloadArticle(path)
  }

  return {
    // 状态
    articleCache: readonly(articleCache),
    loadingStates: readonly(loadingStates),

    // 计算属性
    isArticleLoading,
    getCachedArticle,
    isArticleCached,
    getArticleError,

    // 方法
    preloadArticle,
    clearArticleCache,
    reloadArticle,
  }
})
