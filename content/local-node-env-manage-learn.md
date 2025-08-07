---
title: 本地多版本 Node 踩坑与最佳实践
date: 2025-03-27
category: 前端工程化
tags:
  - Node.js
  - pnpm
---

# 本地多版本 Node 踩坑与最佳实践

## 问题背景

为了测试不同 Node.js 环境，开发机器上可能会安装多个不同版本的实例。大多是通过 nvm、fnm、volta 等管理工具安装 node。当你切换了不同的 Node.js 环境可能发现全局安装的依赖丢失了！还有可能你的第三方包管理工具版本会不一致！

这是因为：安装 Node 默认会自带一个 npm 可执行文件，然而不同的 Node 环境自带的 npm 版本是分开的，你可能在不同的环境中通过 `npm install -g` 将某个包安装了好几份、因此当你切换了 Node 版本可能导致找不到这个全局包。

如果你是用 `npm install -g pnpm` 安装的 pnpm，那么不同版本的 node 环境中可能下载了不同版本的 pnpm。

那么有没有一种方案，可以让安装的命令行工具不跟随 Node 版本环境变化、 pnpm 版本也不会跟着变呢？

当然是有的，pnpm 的方案目前堪称业界最佳。它的全局脚本安装位置在 Mac 上是 `~/Library/pnpm` 这个目录，它可以不受 Node 版本环境变化影响。

因此我们解决的思路就是：将所有的 Node 相关命令行工具全部由 PNPM 管理，所安装的 Node 实例自带 npm 的全局安装目录里只留下它自己、以免和其他地方安装的包冲突。

但这一番操作需要你格外注意操作顺序，请跟我来 ...

## 解决过程

### 安装 Node.js 环境

以 fnm 为例，当你刚刚装机后，去安装 fnm：

```bash
brew install fnm         # 安装 Node 版本管理工具
fnm env >> ~/.zshrc      # 将 fnm 所需的环境变量追加到 Shell 环境配置文件末尾

fnm install v23          # 安装任意版本的 Node.js 这里以 v23 为例
fnm use v23              # 选用该版本环境

which node
# 应该会输出类似如下示例的一段路径：
# /Users/admin/.local/state/fnm_multishells/39828_1742787558878/bin/node

which npm
# /Users/admin/.local/state/fnm_multishells/39828_1742787558878/bin/npm

which corepack
# /Users/admin/.local/state/fnm_multishells/39828_1742787558878/bin/corepack
```

### 搬动 pnpm 位置

我们将用 pnpm 再全局安装一次 pnpm 自己，这种方式安装最后落到的位置是在 `~/Library/pnpm/global` 下面：

```bash
npm i -g pnpm             # 先利用环境自带 npm 安装 pnpm

which pnpm
# 此时 pnpm 所在位置应该为：
# /Users/admin/.local/state/fnm_multishells/39828_1742787558878/bin/pnpm

# 这里一定要这样指定版本号，你也可以不指定 @latest 而是锚定到所需的 pnpm 版本号
# 如果不这样安装，在最新的环境中 pnpm 会阻止你、叫你去用 pnpm self-update
pnpm i -g pnpm@latest

# 接着将 pnpm 关键目录添加到系统环境变量 $PATH 中
echo '
export PNPM_HOME="/Users/admin/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac' >> ~/.zshrc

# 重载 Shell 环境配置
source .zshrc

# 可以执行一下检查是否有添加成功
echo $PATH
```

添加 PNPM_HOME 目的是为了让 pnpm 的全局目录优先于 Node 版本环境的 npm 全局目录，我们也可以手动清理一下 npm 全局目录中的 pnpm。

然后你就可以通过 `pnpm i -g ...` 来全局安装包了，牢记始终采用 pnpm。

```bash
# 删除 npm 全局目录中的 corepack/pnpm/pnpx
rm corepack pnpm pnpx

# 检查当前 pnpm 是否已经由 PNPM_HOME 来提供
which pnpm
# 应当为：/Users/admin/Library/pnpm/pnpm
```

### 重新安装 corepack

```bash
# 使用 pnpm 重新安装 corepack
pnpm i -g corepack
# Packages: +1
# +
# Progress: resolved 2, reused 1, downloaded 1, added 1, done
#
# /Users/admin/Library/pnpm/global/5:
# + corepack 0.32.0
#
# Done in 532ms using pnpm v10.6.5
```

可以看到此时 corepack 是安装在 `PNPM_HOME` 下面了。这么做的好处是 corepack 之后下载的包管理工具可执行文件因为都会与其毗邻、而此时它在 `PNPM_HOME` 下面，所以不会跟着 Node 版本环境变化。

corepack 这个全局工具本身是用于帮助一个 Node 项目（我们暂时这么称呼一个有 package.json 的文件夹）规范化参与该项目的所有开发者保持统一的包管理工具及版本，当它发现你的环境与 package.json 中定义的不一致时，它会自动帮你安装该工具到某版本并重设环境。

```json
// package.json
{
  // 强烈建议项目都加上这个字段，非常有用！
  "packageManager": "pnpm@10.6.5"
}
```

参考 pnpm 的这个 issue 回复：[https://github.com/pnpm/pnpm/issues/9021#issuecomment-2621511347](https://github.com/pnpm/pnpm/issues/9021#issuecomment-2621511347)

### 有没有更简单点办法安装 pnpm

我们刚才之所以要搬动 pnpm，是因为大多数同学安装 pnpm 都是通过 `npm i -g pnpm` 来安装的，所以才会掉入我们说的这个坑。

但 pnpm 也提供了 `brew install pnpm` 的方案，这样安装的 pnpm 同样也是全局唯一的。

## 如何以项目维度隔离不同环境需要？

fnm 可以完美做到在你的项目环境里始终指定你需要的 node 版本。解决步骤如下：

在你的项目目录内新建一个 .node-version 文件，可以用如下命令生成

```bash
node -v > .node-version
```

在你的 bash / shell 脚本里添加如下 eval 指令

```bash
eval "$(fnm env --use-on-cd)"
```

这样每次命令行启动时都会遵循你当前目录的 `.node-version` 定义。

这样你就可以在不同的项目中有不同的 "环境 + 包管理工具" 组合了。
