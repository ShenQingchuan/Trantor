---
title: 在 Array.filter 时妙用类型断言
date: 2023-07-19
category: TypeScript
---

# 在 `Array.filter` 时妙用类型断言

如果你是一个 TypeScript 常用者，你可能经历过如下这样的场景：

```ts
interface Base {
  type: 't1' | 't2'
}
interface Extend1 extends Base {
  ccc: string
  bbb: number
}
interface Extend2 extends Base {
  aaa: boolean
}
```

你有一个数组，类型只有一部分字段是确定的，需要在遍历时操作每个元素，仅能通过某种自定义逻辑的判断确定该元素的实际类型。

而当你想只需一串调用就能得到结果、同时又想要从中筛选出某种子类型的元素，常常会写出这样的代码：

```ts
const arr: Base[] = [/* ... */]
const arrOfExt1 = arr
  .filter(item => item.type === 't1') as Extend1[]
```

上面这样使用看起来非常主观的断言其实没什么不对，我们当然可以这样用，但对 "filter 后的断言" 这件事来说还有更好的解法。

问题的核心在于 `.filter` 的返回值好像仍然只能是个 `Base[]` 。而当你点开 `.filter` 这个方法的 TS 内建类型定义：

![.filter 的类型定义](/blog-images/filter-types-definition.png)

诶怎么还有另一种？似乎可以给 `.filter` 这个方法传入一个类型参数、或者在传入 `.filter` 的实参函数的签名部分显式定义类型谓词。TypeScript 的 “类型谓词” 可以用来自定义类型断言，因此我们可以这样做：

```ts
const arrOfExt1 = arr
  .filter((item): item is Extend1 => item.type === 't1')

console.log(arr_of_ext1)
//           ?^ Extend1[]
```

根据代码应符合职责分工的规则，使用 `.filter` 的这一侧应属于业务逻辑，传入的这个 predicate 函数是很独立的 util，这个类型断言函数可能复用多次，因此考虑将判断函数抽出来：

```ts
function isExtend1(item: Base): item is Extend1 {
  return item.type === 't1'
}

const arrOfExt1 = arr.filter(isExtend1)
```

最后我们看到的结果也非常简洁、直观和易读。
