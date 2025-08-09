import type { VNodeRef } from 'vue'
import { useDark } from '@vueuse/core'

export function AppModeSwitch() {
  const isDark = useDark()
  const { locale } = useI18n()

  function toggleThemeMode() {
    isDark.value = !isDark.value
  }
  function toggleLocale() {
    const switchTo = (
      locale.value === 'zhCN'
        ? 'enUS'
        : 'zhCN'
    )
    locale.value = switchTo
  }
  const localeLabel = computed(() => {
    return (
      locale.value === 'zhCN'
        ? '中'
        : 'EN'
    )
  })

  return vine`
    <div
      class="fixed bottom-10 right-10 z-2 h-max row-flex gap-2 border-1px border-zinc/10 rounded-lg bg-zinc-100/20 p-1 backdrop-blur md:right-12 md:top-12 dark:bg-zinc-600/10"
    >
      <button
        class="h-8 w-8 flex items-center rounded-md p-2 transition duration-300 hover:bg-zinc-300/20 light:bg-neutral-50/1"
        @click="toggleThemeMode"
      >
        <Transition name="fade-rotate-slide" mode="out-in">
          <div v-if="!isDark" class="i-carbon:moon" />
          <div v-else class="i-carbon:sun" />
        </Transition>
      </button>
      <button
        class="h-8 w-8 flex items-center rounded-md p-2 font-mono transition duration-300 hover:bg-zinc-300/20 light:bg-neutral-50/1"
        @click="toggleLocale"
      >
        <span class="text-sm">{{ localeLabel }}</span>
      </button>
    </div>
  `
}

function AnimatedSignature(props: {
  classNames?: string
  width?: string
  height?: string
  strokeColor?: string
  strokeWidth?: string
}) {
  const isDark = useDark()
  const defaultStrokeColor = computed(() => (isDark.value ? '#fff' : '#000'))
  const signatureGraphRef = ref<SVGElement | null>(null)
  const stroke = computed(() => (
    props.strokeColor ?? defaultStrokeColor.value
  ))

  const onSignatureRender: VNodeRef = (el) => {
    const graphElement = el as SVGElement
    signatureGraphRef.value = graphElement
    const totalLength = graphElement.querySelector<SVGPathElement>('path')?.getTotalLength()
    if (!totalLength)
      return

    graphElement.style.setProperty('--signature-storke', stroke.value)
    graphElement.style.setProperty('--signature-dasharray', String(totalLength))
    graphElement.style.setProperty('--signature-dashoffset', String(totalLength))
  }

  vineStyle.scoped(`
    .signature {
      stroke: var(--signature-storke, #fff);
      stroke-linecap: round;
      stroke-dasharray: var(--signature-dasharray);
      stroke-dashoffset: var(--signature-dashoffset);
      animation: dash 2.4s ease alternate;
      animation-iteration-count: 1;
      animation-fill-mode: forwards;
    }
    
    @keyframes dash {
      from {
        stroke-dashoffset: var(--signature-dashoffset);
      }
      to {
        stroke-dashoffset: 1;
      }
    }  
  `)

  return vine`
    <Transition name="fade">
      <svg
        v-show="Boolean(signatureGraphRef)"
        :class="classNames"
        xmlns="http://www.w3.org/2000/svg"
        :width="width || '100%'"
        :height="height || '100%'"
        viewBox="0 0 3010 5150"
      >
        <g
          :ref="onSignatureRender"
          class="signature"
          fill="none"
          :stroke-width="strokeWidth || '100'"
        >
          <g fill="none">
            <path
              d="M795 710C875 710 1025 710 1085 640C1135 575 1150 440 1170 360C1175 320 1180 275 1205 245C1255 195 1385 200 1450 205C1500 210 1515 260 1500 305C1480 370 1435 425 1400 480C1385 500 1365 535 1380 560C1390 580 1415 575 1435 575C1485 570 1525 550 1575 550C1595 550 1630 545 1640 570C1650 610 1595 660 1570 685C1480 765 1345 795 1240 865C1220 880 1130 970 1190 990C1210 1000 1235 985 1250 975C1290 960 1390 890 1435 920C1475 950 1410 1050 1390 1075C1315 1160 1165 1195 1065 1240C875 1315 700 1440 500 1500C425 1525 350 1540 275 1560C250 1570 210 1585 235 1615C340 1740 535 1680 655 1630C765 1585 860 1515 970 1470C1240 1355 1530 1265 1820 1210C1965 1180 2195 1085 2305 1220C2320 1240 2345 1265 2350 1290C2355 1325 2310 1335 2285 1345C2215 1370 2140 1385 2065 1405C1950 1440 1830 1460 1710 1490C1635 1515 1560 1545 1485 1565C1365 1595 1235 1610 1130 1680C1080 1715 1025 1770 1010 1825C985 1895 995 1980 990 2055C980 2165 960 2275 940 2385C915 2505 880 2620 860 2745C855 2780 840 2850 870 2875C895 2900 935 2885 960 2870C1010 2835 1060 2765 1075 2700C1105 2505 1135 2310 1180 2120C1200 2040 1225 1930 1285 1865C1325 1820 1400 1795 1455 1770C1535 1725 1615 1700 1705 1690C1730 1685 1775 1675 1795 1695C1815 1710 1810 1735 1815 1755C1820 1815 1815 1895 1805 1955C1795 2035 1805 2115 1805 2195C1805 2315 1800 2435 1800 2555C1800 2625 1805 2740 1725 2775C1690 2790 1670 2760 1665 2730C1640 2640 1640 2555 1590 2475C1575 2455 1535 2375 1500 2410C1480 2425 1480 2465 1475 2490C1450 2580 1435 2665 1435 2755C1435 2995 1395 3235 1345 3470C1325 3545 1295 3620 1285 3700C1280 3720 1270 3765 1290 3780C1340 3810 1400 3725 1420 3695C1520 3560 1600 3420 1710 3295C1755 3245 1795 3190 1845 3150C1860 3135 1885 3115 1910 3125C1965 3145 1930 3265 2010 3265C2085 3270 2135 3155 2165 3100C2270 2905 2340 2700 2430 2500C2480 2390 2530 2285 2590 2180C2605 2150 2640 2085 2685 2105C2735 2120 2725 2235 2720 2275C2710 2355 2690 2440 2680 2520C2670 2625 2680 2730 2680 2835C2680 3020 2665 3215 2685 3400C2710 3590 2780 3760 2750 3955C2730 4080 2660 4205 2600 4315C2480 4555 2335 4775 2165 4985"
            />
          </g>
        </g>
      </svg>
    </Transition>
  `
}

export function DesktopHeader() {
  interface NavItem {
    label: () => string
    path: string
    icon: string
  }

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const headerNavs = [
    { label: () => t('nav_home'), path: '/', icon: 'i-lucide:tree-palm' },
    { label: () => t('nav_articles'), path: '/articles', icon: 'i-lucide:notebook-text' },
    { label: () => t('nav_mindpalace'), path: '/os', icon: 'i-lucide:monitor' },
    { label: () => t('nav_memo'), path: '/memo', icon: 'i-lucide:feather' },
  ]
  function isActiveNavItem(item: NavItem) {
    return item.path === route.path
  }

  vineStyle.scoped(scss`
    .trantor-header-nav {
      --header-nav-border-color-light: #4242421a;
      --header-nav-border-color-dark: #b5b5b537;
      --header-nav-item-text-color-light: var(--p-cyan-500);
      --header-nav-item-text-hover-color-light: var(--p-cyan-600);
      --header-nav-item-text-color-dark: var(--p-cyan-300);
      --header-nav-item-text-hover-color-dark: var(--p-cyan-400);
    
      transition:
        background-color 600ms ease-in-out,
        border-color 400ms linear 600ms;
    
      &-item {
        &__icon {
          opacity: 0;
          width: 0;
          transition: opacity ease 500ms;
        }
    
        &.is-active &__icon {
          width: 1rem;
          opacity: 1;
        }
      }
    }
    
    html.light {
      .trantor-header-nav {
        background-color: #fff;
        border: 1px solid var(--header-nav-border-color-light);
      }
      .trantor-header-nav-item.is-active {
        color: var(--p-cyan-500);
      }
      .trantor-header-nav-item:hover {
        color: var(--p-cyan-600);
        text-shadow: 0px 0px 40px var(--p-cyan-600);
      }
    }
    html.dark {
      .trantor-header-nav {
        background-color: #18181b;
        border: 1px solid var(--header-nav-border-color-dark);
      }
      .trantor-header-nav-item.is-active {
        color: var(--p-cyan-500);
      }
      .trantor-header-nav-item:hover {
        color: var(--p-cyan-400);
        text-shadow: 0px 0px 40px var(--p-cyan-400);
      }
    }
  `)

  return vine`
    <AnimatedSignature
      key="signature-desktop"
      class-names="tablet-hidden absolute sm:left-30 top-24px h-auto animate-fade-in z-99"
      width="48px"
      stroke-width="120"
    />

    <nav
      class="trantor-header-nav phone-hidden absolute top-40px w-fit row-flex select-none flex-center self-center rounded-full px-6 py-2 shadow-2xl z-99 dark:border-none border-(0.5px solid zinc/36)"
    >
      <div
        v-for="navItem in headerNavs"
        :key="navItem.path"
        class="trantor-header-nav-item mx-4 row-flex cursor-pointer transition-all transition-duration-600"
        :class="{
          'is-active': isActiveNavItem(navItem),
        }"
        @click="router.push(navItem.path)"
      >
        <div class="trantor-header-nav-item__icon" :class="[navItem.icon]" />
        <span class="ml-2">{{ navItem.label() }}</span>
      </div>
    </nav>
  `
}

export function MobileHeader() {
  interface NavItem {
    path: string
    icon: string
  }

  const route = useRoute()
  const headerNavs = [
    { path: '/', icon: 'i-lucide:tree-palm' },
    { path: '/articles', icon: 'i-lucide:notebook-text' },
    { path: '/os', icon: 'i-lucide:monitor' },
    { path: '/memo', icon: 'i-lucide:feather' },
  ]
  function isActiveNavItem(item: NavItem) {
    return item.path === route.path
  }

  vineStyle.scoped(`
    .trantor-header-nav-item.is-active {
      color: var(--p-indigo-400);
    }  
  `)

  return vine`
    <AnimatedSignature
      key="signature-mobile"
      class-names="desktop-hidden absolute left-10 top-10 h-auto animate-fade-in z-99"
      width="32px"
      stroke-width="120"
    />

    <nav
      class="trantor-header-nav desktop-hidden absolute right-4 top-13 w-fit row-flex select-none flex-center self-center rounded-full py-2 z-99"
    >
      <div
        v-for="navItem in headerNavs"
        :key="navItem.path"
        class="trantor-header-nav-item mx-4 row-flex cursor-pointer transition-all transition-duration-600"
        :class="{
          'is-active': isActiveNavItem(navItem),
        }"
        @click="$router.push(navItem.path)"
      >
        <div class="trantor-header-nav-item__icon" :class="[navItem.icon]" />
      </div>
    </nav>
  `
}
