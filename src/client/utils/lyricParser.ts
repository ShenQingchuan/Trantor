/**
 * 歌词行信息
 */
export interface LyricLine {
  time: number // 时间戳（秒）
  text: string // 歌词文本
}

/**
 * 解析LRC格式歌词
 */
export function parseLyric(lrcText: string): LyricLine[] {
  const lines = lrcText.split('\n')
  const lyricLines: LyricLine[] = []

  for (const line of lines) {
    // 匹配时间标签 [mm:ss.xx] 或 [mm:ss]
    const timeMatch = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2}))?\]/)
    if (timeMatch) {
      const minutes = Number.parseInt(timeMatch[1], 10)
      const seconds = Number.parseInt(timeMatch[2], 10)
      const milliseconds = timeMatch[3] ? Number.parseInt(timeMatch[3], 10) : 0

      const time = minutes * 60 + seconds + milliseconds / 100
      const text = line.replace(/\[.*?\]/g, '').trim()

      if (text) {
        lyricLines.push({ time, text })
      }
    }
  }

  // 按时间排序
  return lyricLines.sort((a, b) => a.time - b.time)
}

/**
 * 获取当前播放时间对应的歌词行索引
 */
export function getCurrentLyricIndex(lyricLines: LyricLine[], currentTime: number): number {
  if (lyricLines.length === 0)
    return -1

  // 找到当前时间对应的歌词行
  for (let i = lyricLines.length - 1; i >= 0; i--) {
    if (currentTime >= lyricLines[i].time) {
      return i
    }
  }

  return -1
}

/**
 * 获取滚动歌词显示的行（前一句、当前句、后两句）
 */
export function getScrollLyricLines(lyricLines: LyricLine[], currentIndex: number): {
  lines: (LyricLine | null)[]
  currentIndex: number
} {
  if (lyricLines.length === 0) {
    return { lines: [], currentIndex: -1 }
  }

  const lines: (LyricLine | null)[] = []

  // 前一句 (-1)
  if (currentIndex > 0) {
    lines.push(lyricLines[currentIndex - 1])
  }
  else {
    lines.push(null)
  }

  // 当前句 (0)
  lines.push(lyricLines[currentIndex])

  // 后一句 (+1)
  if (currentIndex < lyricLines.length - 1) {
    lines.push(lyricLines[currentIndex + 1])
  }
  else {
    lines.push(null)
  }

  // 后两句 (+2)
  if (currentIndex < lyricLines.length - 2) {
    lines.push(lyricLines[currentIndex + 2])
  }
  else {
    lines.push(null)
  }

  return { lines, currentIndex }
}
