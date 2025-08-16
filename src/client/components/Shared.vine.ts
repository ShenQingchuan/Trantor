export function Alert(props: {
  title?: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'danger'
  icon?: string
}) {
  vineStyle.scoped(scss`
    .alert {
      --at-apply: 'text-white';
    
      &.info {  --at-apply: 'bg-blue-600'; }
      &.success { --at-apply: 'bg-green-600'; }
      &.warning { --at-apply: 'bg-yellow-600'; }
      &.danger { --at-apply: 'bg-rose-600'; }
    } 
  `)

  const iconClass = computed(() => {
    if (props.icon) {
      return props.icon
    }

    switch (props.type) {
      case 'info':
        return 'i-mdi:information'
      case 'success':
        return 'i-material-symbols:check-circle'
      case 'warning':
        return 'i-material-symbols:warning-rounded'
      case 'danger':
        return 'i-ix:namur-failure-filled'
      default:
        return 'i-mdi:information'
    }
  })

  return vine`
    <div class="alert font-sans row-flex gap-4 rounded-md" :class="[type]">
      <div class="col-flex gap-1">
        <div class="row-flex gap-2">
          <slot name="icon">
            <div class="alert-icon text-2xl" :class="[iconClass]" />
          </slot>
          <slot name="title">
            <div class="alert-title font-bold row-flex text-xl">
              {{ title }}
            </div>
          </slot>
        </div>
        <slot name="message">
          <div class="alert-message">
            {{ message }}
          </div>
        </slot>
      </div>
    </div>
  `
}

export function Skeleton(props: {
  rows?: number
  rowsWidth?: string[]
  wrapperClass?: string
  rowClass?: string
}) {
  return vine`
    <div class="skeleton col-flex" :class="wrapperClass">
      <div
        class="skeleton-row bg-zinc-500/50"
        :class="rowClass"
        v-for="i in rows"
        :key="i"
        :style="{
          width: rowsWidth?.[i],
        }"
      />
    </div>
  `
}
