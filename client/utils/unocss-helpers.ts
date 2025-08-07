export type ColorName
  = | 'black' | 'white' | 'slate' | 'neutral' | 'zinc' | 'stone' | 'light' | 'dark'
    | 'gray' | 'coolGray'
    | 'green' | 'emerald' | 'teal'
    | 'indigo' | 'violet' | 'fuchsia' | 'purple'
    | 'yellow' | 'amber' | 'orange'
    | 'red' | 'pink' | 'rose'
    | 'blue' | 'cyan' | 'lightBlue' | 'darkBlue' | 'sky'

export function getButtonColorClassList(color: ColorName): string {
  switch (color) {
    case 'blue':
      return 'border-1px border-solid border-blue-300:50 bg-blue-300:20 text-blue-500'
    case 'cyan':
      return 'border-1px border-solid border-cyan-300:50 bg-cyan-300:20 text-cyan-500'
    case 'emerald':
      return 'border-1px border-solid border-emerald-300:50 bg-emerald-300:20 text-emerald-500'
    case 'teal':
      return 'border-1px border-solid border-teal-300:50 bg-teal-300:20 text-teal-500'
    case 'indigo':
      return 'border-1px border-solid border-indigo-300:50 bg-indigo-300:20 text-indigo-500'
    case 'violet':
      return 'border-1px border-solid border-violet-300:50 bg-violet-300:20 text-violet-500'
    case 'fuchsia':
      return 'border-1px border-solid border-fuchsia-300:50 bg-fuchsia-300:20 text-fuchsia-500'
    case 'purple':
      return 'border-1px border-solid border-purple-300:50 bg-purple-300:20 text-purple-500'
    case 'pink':
      return 'border-1px border-solid border-pink-300:50 bg-pink-300:20 text-pink-500'
    case 'rose':
      return 'border-1px border-solid border-rose-300:50 bg-rose-300:20 text-rose-500'
    case 'yellow':
      return 'border-1px border-solid border-yellow-300:50 bg-yellow-300:20 text-yellow-500'
    case 'amber':
      return 'border-1px border-solid border-amber-300:50 bg-amber-300:20 text-amber-500'
    case 'orange':
      return 'border-1px border-solid border-orange-300:50 bg-orange-300:20 text-orange-500'
    case 'red':
      return 'border-1px border-solid border-red-300:50 bg-red-300:20 text-red-500'
    default:
      return ''
  }
}
