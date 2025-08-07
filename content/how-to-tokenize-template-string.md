---
title: 怎么构建模板字符串节点？
date: 2025-04-04
category: 编译原理
---

# 怎么构建模板字符串节点？

## 📚 简述词法分析

由于是简单地记录一下这个我花了好久终于想通的知识点，所以我不会在这里长篇大论地展开这两个可以非常深入去聊的话题，只是为了帮助本文读者更好地理解。

词法分析器，英语里一般称为 Lexer 或 Scanner，主要用于将源代码拆成一个列表，每一项都是不可再分的“词素”，英语对应词为 **Token**。

我们用 C 语言举个例子，源代码如下：

```c
#include <stdio.h>

int main() {
  printf("Hello world!");
}
```

这里是上面源代码中所有 Token 的信息：

```txt
<预处理指令 #include> <空格> <左尖括号 '<'> <名称 stdio.h> <右尖括号 '>'> <换行符>
<换行符>
<关键字 int> <空格> <名称 main> <左圆括号 '('> <右圆括号 ')'> <空格> <左花括号 '{'> <换行符>
<空格> <空格> <名称 printf> <左圆括号 '('> <字符串字面量> <右圆括号 ')'> <分号 ';'> <换行符>
<右花括号 '}'>
```

词法分析器的输入是一段字符串内容，输出是一个 Token 列表。而对于每一个 Token 来说，其关键属性为 **位置（Position）**、**内容（Raw content）**、**类型（Token Type）** 三项，记录位置主要是为了之后代码包含错误时能够方便程序员定位问题。

而语法分析器，英语里一般称为 Parser，它的工作过程可以理解为根据编程语言的设计方案（Specification）将符合定义的几个 Token 组合为一个语法节点，最终组合成一颗 “抽象语法树”（AST，Abstract Syntax Tree）

## 🥵 为什么模板字符串不易处理

下面我都将以 JavaScript 的模板字符串语法定义为例。

在实现 Lexer 的一开始，我以为只要根据输入的内容逐个读取，一定可以获取到一一对应的词素，但对模板字符串时我却发现不一样了。

你很难从词法分析阶段将下面这样一个甚至包含嵌套的模板字符串读取为一个 “不可分割” 的词素，显然它是可分割的。

```ts
`my name is ${'David' + ` - ${firstName}`}, nice to meet you!`
```

## 🤔️ 应该怎么做？

要想仍然顺次地读取出 Token，我们应该设立一些变量表示当前解析所处的状态，并且不要按照和一般字符串解析一样的方式去看待模板字符串。

可以确定的是，模板字符串的处理一定是在语法分析阶段，最终会形成一个包含如下两种内容语法节点：

- 可能有多段分散的字符串文本
- 插值表达式，而表达式同样也是一个语法节点

```ts
interface TemplateStringNode {
  quasis: TemplateElement[]
  expressions: ExpressionNode[]
}
```

所以最好的方式是找到一个标志性的 Token，告诉 Parser 在解析到这个符号时需要开始解析模板字符串，并根据状态信息处理可能存在的嵌套情况。

我们设立以下两个关键信息：

1. `isReadingText`，即是否正需要读取文本
2. `nested`，嵌套的层数

![image](/blog-images/template-string-tokenize-explanation.png)

按照上面这样一张图的推演分析，我们可以得出以下结论：

1. `模板字符串引号` 会置反 `isReadingText` 的状态
2. 插值表达式开始标志 `${` 会增加一层 `nested`，并将 `isReadingText` 设置为 `false`，因为即将读取的是一个插值表达式。
3. `右花括号` 会减少一层 `nested`，并将 `isReadingText` 设回 `true`，因为又回到了模板字符串的文本读取中。

直到遇见某个模板字符串引号，将 `isReadingText` 设为 `false`，而 `nested` 层数也为 0 时，一个模板字符串节点的解析就结束了。

## 参考

两篇 Stackoverflow 的问答：

- [How does a lexer handle template strings?](https://softwareengineering.stackexchange.com/questions/431232/how-does-a-lexer-handle-template-strings)
- [How to lex/tokenise template literals](https://stackoverflow.com/questions/68682043/how-to-lex-tokenise-template-literals)
