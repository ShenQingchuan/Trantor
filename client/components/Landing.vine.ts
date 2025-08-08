
import { useDark, useIntervalFn } from '@vueuse/core'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  speed: number
}

export function AuroraBackground() {
  const particleCount = vineProp.withDefault(25)
  const speed = vineProp.withDefault(0.3)
  const size = vineProp.withDefault(400)
  const opacity = vineProp.withDefault(0.8)
  
  const isDark = useDark()
  const colors = computed(() => {
    if (isDark.value) {
      // 深色模式：使用优雅的蓝紫色系
      return ['#8B5CF6', '#7C3AED', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4']
    } else {
      // 浅色模式：使用鲜艳的蓝绿色系
      return ['#3B82F6', '#2563EB', '#1D4ED8', '#0891B2', '#0EA5E9', '#06B6D4']
    }
  })

  const canvas = ref<HTMLCanvasElement>()
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const particles = ref<Particle[]>([])
  const frame = ref(0)
  const width = ref(0)
  const height = ref(0)
  let animationId = 0

  // 简化的噪声实现，避免复杂的类型错误
  // 使用简单的三角函数模拟噪声效果
  function noise(x: number, y: number, z: number): number {
    return Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(z * 0.1) * 0.5 + 0.5
  }

  function createParticles() {
    particles.value = []
    for (let i = 0; i < particleCount.value; i++) {
      const color = colors.value[Math.floor(Math.random() * colors.value.length)] || '#4CC9F0'
      particles.value.push({
        x: Math.random() * width.value,
        y: Math.random() * height.value,
        vx: (Math.random() - 0.5) * speed.value,
        vy: (Math.random() - 0.5) * speed.value,
        size: size.value * (0.5 + Math.random() * 1.2),
        color,
        alpha: 0.05 + Math.random() * 0.25,
        speed: 0.5 + Math.random() * 0.5,
      })
    }
  }

  function drawLight(particle: Particle) {
    if (!ctx.value)
      return

    const t = frame.value * 0.01 * particle.speed
    const n = noise(particle.x * 0.005, particle.y * 0.005, t) * 8

    // 外层大光晕
    const outerGrd = ctx.value.createRadialGradient(
      particle.x + Math.cos(n) * 30,
      particle.y + Math.sin(n) * 30,
      0,
      particle.x,
      particle.y,
      particle.size * 1.8,
    )

    outerGrd.addColorStop(0, `${particle.color}20`)
    outerGrd.addColorStop(0.3, `${particle.color}15`)
    outerGrd.addColorStop(0.6, `${particle.color}08`)
    outerGrd.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.value.globalAlpha = particle.alpha * opacity.value * 0.6
    ctx.value.fillStyle = outerGrd
    ctx.value.beginPath()
    ctx.value.arc(particle.x, particle.y, particle.size * 1.8, 0, Math.PI * 2)
    ctx.value.fill()

    // 中层光晕
    const middleGrd = ctx.value.createRadialGradient(
      particle.x + Math.cos(n * 0.7) * 15,
      particle.y + Math.sin(n * 0.7) * 15,
      0,
      particle.x,
      particle.y,
      particle.size * 1.2,
    )

    middleGrd.addColorStop(0, `${particle.color}40`)
    middleGrd.addColorStop(0.4, `${particle.color}25`)
    middleGrd.addColorStop(0.8, `${particle.color}10`)
    middleGrd.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.value.globalAlpha = particle.alpha * opacity.value * 0.8
    ctx.value.fillStyle = middleGrd
    ctx.value.beginPath()
    ctx.value.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2)
    ctx.value.fill()

    // 内层核心光
    const innerGrd = ctx.value.createRadialGradient(
      particle.x + Math.cos(n * 1.3) * 8,
      particle.y + Math.sin(n * 1.3) * 8,
      0,
      particle.x,
      particle.y,
      particle.size * 0.6,
    )

    innerGrd.addColorStop(0, `${particle.color}80`)
    innerGrd.addColorStop(0.3, `${particle.color}60`)
    innerGrd.addColorStop(0.7, `${particle.color}30`)
    innerGrd.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.value.globalAlpha = particle.alpha * opacity.value
    ctx.value.fillStyle = innerGrd
    ctx.value.beginPath()
    ctx.value.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2)
    ctx.value.fill()
  }

  function updateParticle(particle: Particle) {
    const t = frame.value * 0.01 * particle.speed
    const n1 = noise(particle.x * 0.001, particle.y * 0.001, t)
    const n2 = noise(particle.x * 0.001 + 100, particle.y * 0.001 + 100, t)

    particle.vx += Math.cos(n1 * Math.PI * 2) * 0.01
    particle.vy += Math.sin(n2 * Math.PI * 2) * 0.01

    particle.vx *= 0.99
    particle.vy *= 0.99

    particle.x += particle.vx
    particle.y += particle.vy

    if (particle.x < -particle.size)
      particle.x = width.value + particle.size
    if (particle.x > width.value + particle.size)
      particle.x = -particle.size
    if (particle.y < -particle.size)
      particle.y = height.value + particle.size
    if (particle.y > height.value + particle.size)
      particle.y = -particle.size
  }

  function render() {
    if (!ctx.value || !canvas.value)
      return

    ctx.value.clearRect(0, 0, width.value, height.value)

    // 使用 screen 混合模式让光晕叠加效果更梦幻
    ctx.value.globalCompositeOperation = 'screen'

    particles.value.forEach((particle) => {
      updateParticle(particle)
      drawLight(particle)
    })

    frame.value++
    animationId = requestAnimationFrame(render)
  }

  function initCanvas() {
    if (!canvas.value || !ctx.value)
      return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.value.getBoundingClientRect()

    width.value = rect.width
    height.value = rect.height

    canvas.value.width = width.value * dpr
    canvas.value.height = height.value * dpr

    ctx.value.scale(dpr, dpr)
  }

  function handleResize() {
    initCanvas()
    createParticles()
  }

  onMounted(() => {
    if (!canvas.value)
      return
    const context = canvas.value.getContext('2d', { alpha: true })
    if (!context)
      return

    ctx.value = context

    handleResize()
    render()

    window.addEventListener('resize', handleResize)
  })

  // 监听主题变化，重新创建粒子
  watch(isDark, () => {
    createParticles()
  })

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
  })

  vineStyle.scoped(`
    canvas.aurora-background {
      pointer-events: none;
    }  
  `)

  return vine`
    <div class="fixed inset-0 z--1">
      <div class="absolute inset-0 from-slate-100 to-slate-200 dark:from-slate-800 dark:to-black bg-gradient-to-b" />
      <canvas ref="canvas" class="aurora-background absolute inset-0 h-full w-full" />
    </div>
  `
}

function useGreeting() {
  const nowHours = new Date().getHours()
  const greetingTexts = [
    '你好！',
    'Hello!',
    'Hola!',
    'Bonjour!',
    'Guten Tag!',
    'Ciao!',
    'Olá!',
    (
      nowHours < 12
        ? 'おはようございます！'
        : nowHours < 18
          ? 'こんにちは！'
          : 'こんばんは！'
    ),
  ] as const

  const greetingTextIndex = ref(1)
  const greetingHelloRef = ref<HTMLSpanElement | null>(null)

  function animateGreeting(text: string) {
    if (!greetingHelloRef.value) {
      return
    }

    greetingHelloRef.value.textContent = text
    greetingHelloRef.value.animate(
      [
        { transform: 'translateY(-40%)', opacity: 0 },
        ...Array.from({ length: 10 }, () => ({ transform: 'translateY(0)', opacity: 1 })),
        { transform: 'translateY(20%)', opacity: 0 },
      ],
      {
        duration: 4000,
        easing: 'ease-in-out',
        fill: 'forwards',
      },
    )
  }

  onMounted(() => {
    useIntervalFn(() => {
      const greetingText = greetingTexts[greetingTextIndex.value]
      if (greetingText) {
        animateGreeting(greetingText)
        greetingTextIndex.value = (greetingTextIndex.value + 1) % greetingTexts.length
      }
    }, 4000)
  })

  return {
    greetingHelloRef,
    greetingTexts,
  }
}

export function Greeting() {
  const { greetingHelloRef, greetingTexts } = useGreeting()

  return vine`
    <div
    ref="greetingHelloRef"
    class="greeting-container__hello cursor-silent mx-auto w-fit row-flex text-4xl font-bold"
  >
    {{ greetingTexts[0] ?? '你好！' }}
  </div>

  <div
    class="greeting-container__name mx-auto mt-2 w-fit col-flex text-2xl font-700 md:text-5xl md:lh-16"
  >
    <span class="cursor-silent my-1">
      {{ $t('welcome') }}<br>
      {{ $t('this_is_shenqingchuan_blog') }}
    </span>
    <span class="my-1 text-xl text-zinc-600 dark:text-zinc-400">
      {{ $t('learn_explore_create') }}
    </span>
  </div>
  `
}

function LinkBtn() {
  const href = vineProp<string>()
  const target = vineProp.withDefault('_blank')

  return vine`
    <a
      class="relative mx-1 inline-flex cursor-pointer select-none items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 transition-all duration-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-500/30"
      :href="href"
      :target="target"
    >
      <slot name="icon" />
      <slot />
    </a>
  `
}

function useLogoFill() {
  const isDark = useDark()
  const fill = computed(() => isDark.value ? '#fff' : '#1C1C1C')
  return fill
}

function FutuLogo() {
  const fill = useLogoFill()

  vineStyle.scoped(`
    .cls-1 {
      fill: #0052d9;
    }
    .cls-2 {
      fill: #fff;
    }  
  `)

  return vine`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 691.9 170.08"
    >
      <g>
        <g>
          <path class="cls-1" d="M158.52,0h-147A11.57,11.57,0,0,0,0,11.56v147a11.57,11.57,0,0,0,11.56,11.57h147a11.57,11.57,0,0,0,11.56-11.57V11.56A11.57,11.57,0,0,0,158.52,0m-45.1,109.62a3.82,3.82,0,0,1-3.82,3.82H88.84A3.82,3.82,0,0,1,85,109.62V88.86A3.82,3.82,0,0,1,88.84,85H109.6a3.82,3.82,0,0,1,3.82,3.82ZM141.76,53a3.8,3.8,0,0,1-3.8,3.8H77.84A21.16,21.16,0,0,0,56.68,78v60.12a3.8,3.8,0,0,1-3.8,3.8H32.08a3.8,3.8,0,0,1-3.8-3.8V70.82A42.41,42.41,0,0,1,70.69,28.41H138a3.8,3.8,0,0,1,3.8,3.8Z" /><rect class="cls-2" x="85.02" y="85.04" width="28.4" height="28.4" rx="3.82" />
          <path class="cls-2" d="M141.76,53a3.8,3.8,0,0,1-3.8,3.8H77.84A21.16,21.16,0,0,0,56.68,78v60.12a3.8,3.8,0,0,1-3.8,3.8H32.08a3.8,3.8,0,0,1-3.8-3.8V70.82A42.41,42.41,0,0,1,70.69,28.41H138a3.8,3.8,0,0,1,3.8,3.8Z" />

          <path :fill="fill" d="M333.1,97.88a48.9,48.9,0,0,0,48.84,48.85h12a48.9,48.9,0,0,0,48.85-48.85V27.53a4.18,4.18,0,0,0-4.18-4.18H419.9a4.18,4.18,0,0,0-4.18,4.18v73.18a27.79,27.79,0,1,1-55.58,0V27.53A4.18,4.18,0,0,0,356,23.35H337.27a4.18,4.18,0,0,0-4.17,4.18Z" />
          <path :fill="fill" d="M605.1,23.35H586.41a4.18,4.18,0,0,0-4.17,4.18V97.88a48.9,48.9,0,0,0,48.84,48.85h12A48.9,48.9,0,0,0,691.9,97.88V27.53a4.18,4.18,0,0,0-4.18-4.18H669a4.18,4.18,0,0,0-4.18,4.18v73.18a27.79,27.79,0,1,1-55.58,0V27.53A4.18,4.18,0,0,0,605.1,23.35Z" />
          <path :fill="fill" d="M212.94,59.63v87.1h9a18.07,18.07,0,0,0,18-18V98.21a.2.2,0,0,1,.2-.2h60a18.08,18.08,0,0,0,18.05-17.85h-78a.19.19,0,0,1-.2-.2V58.28A17.1,17.1,0,0,1,257.06,41.2h43.08a18.08,18.08,0,0,0,18.05-17.85h-69A36.33,36.33,0,0,0,212.94,59.63Z" />
          <path :fill="fill" d="M457.67,27.53V37a4.18,4.18,0,0,0,4.17,4.18h36.8a.2.2,0,0,1,.2.2V142.55a4.18,4.18,0,0,0,4.18,4.18H521.7a4.18,4.18,0,0,0,4.18-4.18V41.4a.2.2,0,0,1,.2-.2H549a18.06,18.06,0,0,0,18-17.85H461.84A4.18,4.18,0,0,0,457.67,27.53Z" />
        </g>
      </g>
    </svg>
  `
}

function BytedanceLogo() {
  const fill = useLogoFill()
  return vine`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16219.041 2798.1476"
    >
      <g id="g68" transform="translate(-5889.2439,-88.063461)">
        <path id="path58" style="fill:#3259b4;fill-opacity:1;stroke:none;stroke-width:10px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 5889.2439,198.14279 495.357,143.10312 V 2322.6738 l -495.357,143.1031 z" />
        <path id="path60" style="fill:#3c8cff;fill-opacity:1;stroke:none;stroke-width:10px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 6670.8071,1210.8726 484.3491,121.0872 v 1067.7695 l -484.3491,99.0714 z" />
        <path id="path62" style="fill:#00c8d2;fill-opacity:1;stroke:none;stroke-width:10px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="M 7496.4021,1001.7219 7947.7273,880.63461 V 2190.5786 l -451.3252,-132.0952 z" />
        <path id="path64" style="fill:#78e6dd;fill-opacity:1;stroke:none;stroke-width:10px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m 8244.9415,88.063461 495.357,143.103119 V 2454.769 l -495.357,121.0872 z" />
        <path id="path49" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:2647.62px;line-height:1.25;font-family:'Geometr706 Md BT';-inkscape-font-specification:'Geometr706 Md BT';letter-spacing:0px;word-spacing:0px;fill:#3259b4;fill-opacity:1;stroke-width:93.437" d="m 20976.329,1586.9411 h 874.026 q -22.003,-165.8898 -141.8,-268.8141 -119.796,-102.9243 -290.934,-102.9243 -173.582,0 -298.269,105.346 -123.464,104.1352 -143.023,266.3924 z m 0,184.0528 q 12.225,179.2094 141.8,290.6098 130.799,111.4005 328.83,111.4005 127.13,0 237.149,-53.2785 110.016,-53.2785 201.697,-157.4136 l 167.471,133.1961 q -125.909,145.3049 -276.266,214.3247 -149.134,69.0198 -337.385,69.0198 -155.246,0 -289.713,-55.7002 -134.465,-55.7002 -231.036,-158.6245 -84.347,-90.8156 -129.576,-209.4812 -45.229,-119.8766 -45.229,-250.651 0,-309.9837 187.03,-501.3018 187.028,-191.3181 488.966,-191.3181 308.047,0 497.521,204.6377 190.697,203.4269 190.697,537.628 v 16.9523 z m -512.541,-423.8059 q -60.745,-67.809 -138.847,-99.2917 -76.862,-32.6936 -176.038,-32.6936 -192.155,0 -316.126,135.6179 -122.73,134.4071 -122.73,345.0991 0,210.6921 121.491,343.8883 122.73,133.1962 317.365,133.1962 105.375,0 185.957,-36.3263 81.819,-36.3262 138.846,-107.7678 l 152.484,170.7333 q -104.136,93.2373 -219.428,136.8287 -114.053,42.3806 -257.859,42.3806 -147.525,0 -272.736,-48.4349 -125.209,-48.4351 -216.948,-140.4615 -97.937,-96.8698 -148.765,-221.5899 -49.589,-125.9309 -49.589,-272.4467 0,-146.5157 49.589,-272.4467 50.828,-125.9308 148.765,-222.8008 92.978,-93.2373 216.948,-140.4614 123.971,-48.4349 272.736,-48.4349 141.326,0 255.38,41.1697 115.292,41.1697 209.51,124.72 z m -2257.02,998.9712 V 1044.4695 h 232.044 v 148.9375 q 87.633,-88.3938 183.906,-130.7744 97.507,-43.5915 208.592,-43.5915 228.34,0 360.407,152.5702 132.067,152.5701 132.067,420.1733 v 754.3746 h -234.512 v -731.368 q 0,-204.6378 -72.822,-299.0859 -71.587,-95.6591 -225.871,-95.6591 -175.266,0 -264.134,101.7134 -87.633,100.5026 -87.633,302.7185 v 721.6811 z m -892.716,-181.6312 q 196.244,0 322.659,-131.9853 126.414,-131.9853 126.414,-339.0447 0,-205.8486 -126.414,-337.8338 -126.415,-133.1962 -322.659,-133.1962 -196.242,0 -322.659,131.9853 -126.414,131.9852 -126.414,339.0447 0,208.2703 126.414,340.2556 126.417,130.7744 322.659,130.7744 z m 665.785,181.6312 h -228.75 v -213.1139 q -81.87,115.033 -199.856,173.155 -116.783,56.911 -268.481,56.911 -134.843,0 -257.645,-50.8567 -121.6,-52.0676 -216.712,-150.1483 -90.296,-94.4482 -136.045,-213.1139 -45.751,-118.6656 -45.751,-257.9162 0,-301.5076 179.389,-486.7714 180.592,-185.2637 476.764,-185.2637 149.29,0 273.296,61.7546 124.007,60.5437 211.895,176.7876 v -213.1138 h 211.896 z M 15269.933,675.15287 V 2123.3582 h 180.032 q 393.672,0 592.908,-182.8419 200.436,-182.842 200.436,-541.2608 0,-359.6295 -200.436,-541.26064 -199.236,-182.84199 -592.908,-182.84199 z m 142.825,-224.0117 q 528.095,0 802.946,242.17481 276.05,240.96395 276.05,705.93952 0,463.7648 -276.05,705.9397 -274.851,240.964 -802.946,240.964 h -388.87 V 451.14117 Z M 13561.982,1586.9411 h 859.921 q -21.648,-165.8898 -139.511,-268.8141 -117.863,-102.9243 -286.24,-102.9243 -170.781,0 -293.455,105.346 -121.471,104.1352 -140.715,266.3924 z m 0,184.0528 q 12.028,179.2094 139.513,290.6098 128.687,111.4005 323.522,111.4005 125.079,0 233.321,-53.2785 108.241,-53.2785 198.443,-157.4136 l 164.768,133.1961 q -123.876,145.3049 -271.807,214.3247 -146.728,69.0198 -331.941,69.0198 -152.741,0 -285.037,-55.7002 -132.295,-55.7002 -227.307,-158.6245 -82.985,-90.8156 -127.484,-209.4812 -44.5,-119.8766 -44.5,-250.651 0,-309.9837 184.01,-501.3018 184.012,-191.3181 481.075,-191.3181 303.076,0 489.494,204.6377 187.618,203.4269 187.618,537.628 v 16.9523 z m -868.74,-1043.76734 v 317.24614 h -194.609 -260.176 l -349.805,823.3984 c -5.809,13.7232 -17.015,44.384 -33.613,92.0117 -15.769,46.8205 -35.259,104.5479 -58.496,173.1641 -20.747,-72.6525 -38.597,-131.9946 -53.535,-178.0078 -14.109,-46.0133 -24.074,-75.0593 -29.883,-87.168 l -344.824,-823.3984 h -265.137 l 558.926,1301.6796 -235.274,540.0586 h 240.254 l 747.813,-1656.2695 278.359,8.2617 v 837.9297 c 0,108.9787 28.069,186.8709 84.199,233.6914 56.129,46.0132 150.447,69.0235 282.95,69.0235 h 147.695 v -219.1602 h -138.027 c -39.567,0 -68.551,-8.8811 -86.954,-26.6406 -17.483,-17.7595 -26.23,-46.0176 -26.23,-84.7657 v -810.0781 h 251.211 v -193.7304 h -251.211 V 727.22656 Z M 9676.5955,2346.1592 V 451.14117 h 367.1415 q 212.556,0 335.397,19.37398 124.221,18.16311 205.655,60.5437 139.403,72.65245 211.175,184.05287 73.153,110.18953 73.153,249.4401 0,115.03298 -67.632,210.69198 -66.25,95.6591 -189.091,156.2028 201.513,58.122 305.031,181.6312 104.898,122.2982 104.898,302.7185 0,224.0117 -201.514,377.7927 -200.134,152.5702 -499.645,152.5702 z m 280.1873,-1078.8889 h 231.8792 q 193.233,0 298.13,-78.7068 106.278,-78.7069 106.278,-221.59 0,-150.14836 -106.278,-226.43343 -106.278,-76.28507 -317.453,-76.28507 h -212.5562 z m 0,856.0879 h 285.7082 q 241.541,0 365.762,-81.1284 125.601,-81.1286 125.601,-239.7531 0,-156.2028 -121.46,-236.1205 -121.461,-81.1285 -358.861,-81.1285 h -296.7502 z" />
      </g>
    </svg>
  `
}

function SheinLogo() {
  const fill = useLogoFill()

  return vine`
    <svg viewBox="0 0 106 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_900_7310)">
        <path
          d="M16.5 15.95C16.5 16.775 16.3167 17.5083 15.95 18.15C15.5833 18.8833 15.0333 19.4333 14.3917 19.9833C13.75 20.5333 12.925 20.9917 12.0083 21.2667C11.0917 21.5417 10.0833 21.725 8.98333 21.725C7.975 21.725 7.05833 21.6333 6.325 21.5417C5.5 21.45 4.76667 21.2667 4.03333 21.0833C3.3 20.9 2.65833 20.5333 2.01667 20.2583C1.375 19.8917 0.733333 19.4333 0 18.975L3.20833 16.1333C4.125 16.8667 5.04167 17.325 5.95833 17.6C6.875 17.875 7.79167 18.0583 8.8 18.0583C9.25833 18.0583 9.625 17.9667 9.99167 17.875C10.3583 17.7833 10.725 17.6 11 17.4167C11.275 17.2333 11.4583 16.9583 11.6417 16.775C11.825 16.5 11.9167 16.225 11.9167 15.95C11.9167 15.5833 11.825 15.3083 11.7333 15.0333C11.6417 14.7583 11.3667 14.4833 11 14.3C10.6333 14.025 10.175 13.8417 9.53333 13.5667C8.89167 13.2917 8.15833 13.0167 7.15 12.7417C6.325 12.4667 5.5 12.1917 4.675 11.825C3.85 11.4583 3.20833 11 2.65833 10.5417C2.10833 10.0833 1.55833 9.44167 1.28333 8.8C0.825 7.975 0.641667 7.15 0.641667 6.23333C0.641667 5.31667 0.825 4.49167 1.19167 3.75833C1.55833 3.025 2.10833 2.38333 2.84167 1.83333C3.48333 1.375 4.30833 0.916667 5.225 0.641667C6.14167 0.366667 7.15 0.183333 8.15833 0.183333C9.9 0.183333 11.4583 0.366667 12.65 0.825C13.8417 1.28333 14.9417 1.83333 15.8583 2.65833L12.7417 5.5C12.1917 5.04167 11.55 4.58333 10.8167 4.30833C10.0833 4.03333 9.25833 3.94167 8.34167 3.94167C7.88333 3.94167 7.51667 4.03333 7.15 4.125C6.69167 4.21667 6.41667 4.4 6.14167 4.58333C5.86667 4.76667 5.68333 5.04167 5.5 5.31667C5.31667 5.59167 5.225 5.86667 5.225 6.14167C5.225 6.50833 5.31667 6.78333 5.5 7.05833C5.59167 7.33333 5.86667 7.51667 6.23333 7.79167C6.6 8.06667 7.05833 8.25 7.7 8.525C8.34167 8.8 9.075 9.075 9.99167 9.35C11.1833 9.71667 12.1 10.0833 12.925 10.5417C13.75 11 14.3917 11.4583 14.9417 12.0083C15.4917 12.5583 15.8583 13.1083 16.1333 13.75C16.4083 14.3917 16.5 15.125 16.5 15.95ZM42.2583 21.45H37.7667V12.2833H29.425V21.45H24.9333V0.641667H29.425V8.89167H37.7667V0.641667H42.2583V21.45ZM67.1 21.45H50.6917V0.641667H67.1V3.94167H55.0917V8.89167H66.1833V12.1H55.0917V17.7833H67.1V21.45ZM80.3917 21.45H75.9V0.641667H80.3917V21.45ZM105.783 0.641667V22L93.225 11.0917V21.2667H88.825V0L101.383 10.9083V0.641667H105.783Z"
          :fill="fill"
        />
      </g>
      <defs>
        <clipPath id="clip0_900_7310">
          <rect width="106" height="22" fill="white" />
        </clipPath>
      </defs>
    </svg>
  `
}

export function WhoAmI() {
  return vine`
    <div class="who-am-i relative mx-auto mt-6 w-fit w-full col-flex items-center z-3">
      <div class="who-am-i__title cursor-silent absolute whitespace-nowrap text-6xl color-transparent text-stroke-2 text-stroke-zinc-200/40 op-30 sm:text-8xl light:text-stroke-zinc-700/60">
        WHO AM I
      </div>
      <div class="who-am-i__content ml-2 mt-8 col-flex leading-8 sm:mt-16">
        <div class="cursor-silent text-2xl">
          {{ $t('front_end_developer') }}
          <br class="visible sm:hidden">
          <div class="inline-block text-xl text-secondary sm:ml-2 dark:text-zinc-300">
            <div class="i-material-symbols:location-on-rounded inline-block transform-translate-y-0.5 text-base" /> {{ $t('current_location') }}
          </div>
        </div>

        <div class="cursor-silent mb-6 mt-2 col-flex text-base text-secondary">
          <div class="mb-1 row-flex">
            <div class="i-lucide:code-xml mr-2 icon-div" />{{ $t('fanatical_oss_enthusiast') }}
          </div>
          <div class="mb-1 row-flex">
            <div class="i-lucide:mic-vocal mr-2 icon-div" />{{ $t('music_lover') }}
          </div>
          <div class="mb-1 row-flex">
            <div class="i-lucide:gamepad-2 mr-2 icon-div" />{{ $t('valorant_lover') }}
          </div>
        </div>

        <div class="mb-2 mt-2 whitespace-nowrap text-2xl">
          <span class="cursor-silent">{{ $t('currently_working_at') }}</span>
          <a class="cursor-pointer" href="https://www.futunn.com" target="_blank">
            <FutuLogo class="ml-2 inline-block w-16 transform-translate-y--0.5" />
          </a>
        </div>
        <div class="flex whitespace-nowrap text-sm text-secondary">
          <span class="cursor-silent">{{ $t('previous_experience_in') }}</span>
          <a class="cursor-pointer" href="https://www.bytedance.com" target="_blank">
            <BytedanceLogo class="ml-2 inline-block w-16 transform-translate-y--0.2" />
          </a>
          <span class="mx-2 text-zinc-400/40">/</span>
          <a class="cursor-pointer" href="https://www.shein.com" target="_blank">
            <SheinLogo class="inline-block w-12 transform-translate-y--0.2" />
          </a>
        </div>

        <div class="mt-1 row-flex flex-shrink-0 flex-nowrap gap-1 text-base">
          <div class="cursor-silent whitespace-nowrap">
            {{ $t('author_of') }}
          </div>
          <LinkBtn class="font-bold text-emerald-500 after:border-emerald-300 light:text-emerald-600 light:after:border-emerald-600" href="https://vue-vine.dev" target="_blank">
            <template #icon>
              <img class="w-6 transform-translate-y--0.5" src="https://vue-vine.dev/vine-logo.png" alt="Vue Vine">
            </template>
            <div class="whitespace-nowrap">
              Vue Vine
            </div>
          </LinkBtn>
          <div class="row-flex transform-translate-x-6 select-none whitespace-nowrap break-all text-sm text-secondary phone-hidden md:flex-basis-auto">
            <div class="i-lucide:arrow-left mx-1 inline-block" />
            Made with
            <div class="i-twemoji:sparkling-heart mx-1 inline-block text-base" />
            <span class="mx-1">and</span>
            <a
              class="transition-colors hover:text-emerald-300"
              href="https://github.com/orgs/vue-vine/people"
              target="_blank"
            >
              our team
            </a>
          </div>
        </div>

        <div class="mt-1 row-flex flex-wrap gap-1 text-base">
          <div class="cursor-silent whitespace-nowrap text-secondary">
            {{ $t('former_maintainer_of') }}
          </div>
          <div class="row-flex flex-nowrap gap-1">
            <LinkBtn class="font-bold text-violet-500 after:border-violet-300 light:text-violet-600 light:after:border-violet-600" href="https://cn.vite.dev" target="_blank">
              <template #icon>
                <div class="i-logos:vitejs inline-block text-base" />
              </template>
              <span class="phone-hidden">Vite</span> {{ $t('chinese_docs') }}
            </LinkBtn>
            <LinkBtn class="font-bold text-orange-500 after:border-orange-500 light:text-orange-600 light:after:border-orange-600" href="https://cn.rollupjs.org" target="_blank">
              <template #icon>
                <div class="i-logos:rollupjs inline-block text-base" />
              </template>
              <span class="phone-hidden">Rollup</span> {{ $t('chinese_docs') }}
            </LinkBtn>
          </div>
        </div>
      </div>
    </div>
  `
}
