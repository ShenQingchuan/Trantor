---
title: 我需要一个更方便的 Chrome Network 筛选工具
date: 2025-03-11
category: 前端工程化
tags:
  - Chrome 插件
---

# 我需要一个更方便的 Chrome Network 筛选工具

## 背景

事情是这样的，我新入职了某公司、了解完项目开发后发现，他们的需求做完了之后竟然没有专门的环节来测试需求中定义的埋点是否有按要求发请求提交，纯靠开发自觉。

这令我大为惊讶，不过想要自测埋点请求发没发、发了几条，确实不是个容易的事，因为 Chrome Network 面板并不支持你按 HTTP 请求和响应的内容进行筛选和搜索，导致你会在 Network 面板中看到这样一堆 URL 完全一致但需要你一个个手动点开查验的列表项，体验非常糟糕。（很难理解为什么 Chrome 没有自己意识到这里的问题。）

因此我想到我可以自己做一个和 Network 面板类似的浏览器插件，帮助我实现根据请求内容筛选。

## 实现原理

由于出发点是解决我自己的需求，而我主要使用 Chrome 系列的浏览器所以下面所讲的插件开发概念都是以 Chrome 插件为例。

对于截获页面中的请求，Chrome 插件 API 提供了几种方式，但每一种都有各自的 drawback 。我觉得 [这篇博客](https://segmentfault.com/a/1190000045278358) 讲的很好，我就不再在本文多赘述了，仅罗列几个重要结论：

- chrome.webRequest 可以监听多个阶段，但由于安全性限制，唯独无法获取响应的 body 内容
- chrome.devtools.network.onRequestFinished 可以在回调中拿到完整的请求和响应
- 另一种比较釜底抽薪的办法是 全局替换 XMLHttpRequest 和 fetch

首先可以确定的是我想要的肯定不是第三种方案这样的，我只是需要在 Read 过程中有更好的体验而并不想对网站的 runtime 有任何影响。而第一种方案需求完成不了，只剩第二种可以选。

第二种方案的限制在于用户必须打开 Chrome DevTools 面板，也就是我们常说的 F12 / Cmd+Shift+i 打开的那个东西，但这对我来说是完全可以接受的。

关键代码

```ts
// 处理请求完成事件
function handleRequestFinished(
  request: chrome.devtools.network.Request
): void {
  try {
  // 使用开始时间作为唯一标识
    const timestampId = getTimestampId(request.startedDateTime)

    // 检查是否已处理过此请求
    if (!timestampId || processedRequests.has(timestampId)) {
      return
    }

    // 标记为已处理
    processedRequests.add(timestampId)

    // 提取请求信息
    const {
      url,
      method,
      headers: requestHeadersArray,
      postData
    } = request.request
    const requestHeaders = convertHeadersToObject(requestHeadersArray)

    // 提取响应信息
    const {
      status,
      statusText = '',
      headers: responseHeadersArray
    } = request.response
    const responseHeaders = convertHeadersToObject(responseHeadersArray)

    // 计算持续时间（毫秒）
    const duration = request.time

    // 获取请求体
    const requestBody = postData?.text
      ? tryParseJSON<Record<string, any>>(postData.text)
      : undefined

    // 获取响应体
    request.getContent((content, encoding) => {
      try {
        // 尝试解析响应体
        const responseBody = content
          ? tryParseJSON<Record<string, any>>(content)
          : undefined

        // 创建完整的请求记录
        const record: NetworkRequest = {
          timestampId,
          url,
          method,
          duration,
          requestHeaders,
          responseHeaders,
          requestBody,
          status,
          statusText,
          responseBody,
          encoding,
        }

        // 发送记录到background
        sendNetworkRecord(record)
      }
      catch (e) {
        logger.error('处理响应体出错:', e)
      }
    })
  }
  catch (e) {
    logger.error('网络请求监听器出错:', e)
  }
}

// 启动网络请求监听
function startNetworkListener(): void {
  logger.info('启动网络请求监听')

  // 监听网络请求完成事件
  chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished)

  // 设置一个定时器清理过旧的处理记录
  setInterval(() => {
    if (processedRequests.size > 1000) {
      logger.info(`清理请求记录，当前大小: ${processedRequests.size}`)
      processedRequests.clear()
    }
  }, 60000) // 每分钟检查一次
}
```

## 现在就试试！

- [Chrome 商店链接](https://chromewebstore.google.com/detail/cypher/popkijhcnnieolohhloamlibennbklhd?hl=zh-cn)
- [源码仓库：ShenQingchuan/cypher](https://github.com/ShenQingchuan/cypher)

目前还在不断完善和打磨的阶段，欢迎试用！
