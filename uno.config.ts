import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.vue$/,
        /\.ts$/,
      ],
    },
  },
  theme: {
    breakpoints: {
      sm: '500px',
      md: '740px',
      bs: '960px',
      lg: '1024px',
      xl: '1280px',
    },
    scale: {
      130: '1.3',
      160: '1.6',
    },
  },
  presets: [
    presetWind3(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Rubik',
        mono: 'JetBrains Mono',
        serif: 'Noto Serif',
      },
    }),
  ],
  shortcuts: [
    ['icon-div', 'inline-block'],
    ['btn', 'px-4 py-1 rounded inline-block bg-slate-600 text-white cursor-pointer hover:bg-slate-500 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-slate-600'],
    ['row-flex', 'flex flex-row items-center'],
    ['col-flex', 'flex flex-col'],
    ['flex-center', 'items-center justify-center'],
    ['cursor-silent', 'select-none pointer-events-none cursor-default'],
    ['phone-hidden', 'w-0 h-0 invisible opacity-0 sm:visible sm:w-auto sm:h-auto sm:opacity-100'],
    ['tablet-hidden', 'w-0 h-0 invisible opacity-0 md:visible md:w-auto md:h-auto md:opacity-100'],
    ['desktop-hidden', 'w-auto h-auto visible opacity-100 sm:hidden sm:w-0 sm:h-0 sm:opacity-0'],
    ['text-secondary', 'text-zinc-600/80 dark:text-zinc-400/80'],
    [/^badge-color-(\w+)$/, ([, color]) => `bg-${color}-400:20 dark:bg-${color}-400:10 text-${color}-700 dark:text-${color}-300 border-${color}-600:10 dark:border-${color}-300:10`],
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
