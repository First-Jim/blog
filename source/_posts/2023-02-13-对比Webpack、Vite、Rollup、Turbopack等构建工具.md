---
title: 对比Webpack、Vite、Rollup、Turbopack等构建工具
author: Jimmy
cover: 2023/02/13/对比Webpack、Vite、Rollup、Turbopack等构建工具/cover.png
excerpt: 本文对比目前比较流行的Webpack、Vite、Rollup、Turbopack等构建工具的区别，帮助开发者在实践中进行选择合适的工具开发。
thumbnail: 2023/02/13/对比Webpack、Vite、Rollup、Turbopack等构建工具/cover.png
categories:
  - - 打包工具
    - Webpack、Vite、Rollup、Turbopack
tags:
  - 打包工具
toc: true
date: 2023-02-13 14:40:14
---

# 前端打包工具对比以及选择

### rollup

> 基于es module 打包器，比webpack要小巧的多,`Vue`、`React`和`three.js`等都在使用它进行打包

优点：
-  代码效率更简洁、效率更高，(不像`webpack`那样存在大量引导代码和模块函数)
-   默认支持 Tree-shaking
缺点:
-  加载其他类型的资源文件或者支持导入 `CommonJS` 模块，又或是编译 `ES` 新特性，这些额外的需求 `Rollup`需要使用插件去完成


综合来看，`rollup`并不适合开发应用使用，因为需要使用第三方模块，而目前第三方模块大多数使用`CommonJs`方式导出成员，并且`rollup`不支持`HMR`，使开发效率降低

但是在用于打包`JavaScript` 库时，`rollup`比 `webpack` 更有优势，因为其打包出来的代码更小、更快，其存在的缺点可以忽略


### Parcel

> `Parcel` 跟 `Webpack` 一样都支持以任意类型文件作为打包入口，但建议使用`HTML`文件作为入口，该`HTML`文件像平时一样正常编写代码、引用资源, 跟`webpack`类似，也支持模块热替换，但用法更简单

同时，`Parcel`有个十分好用的功能：支持自动安装依赖，像`webpack`开发阶段突然使用安装某个第三方依赖，必然会终止`dev server`然后安装再启动。而`Parcel`则免了这繁琐的工作流程

同时，`Parcel`能够零配置加载其他类型的资源文件，无须像`webpack`那样配置对应的`loader`

- 打包过程是多进程同时工作，构建速度会比`Webpack` 快，输出文件也会被压缩，并且样式代码也会被单独提取到单个文件中

###  Snowpack

> [Snowpack](https://www.snowpack.dev/) 也是一个与 Vite 十分类似的非构建式原生 ESM 开发服务器, 开发阶段，每次保存单个文件时，`Webpack`和`Parcel`都需要重新构建和重新打包应用程序的整个`bundle`。而`Snowpack`为你的应用程序每个文件构建一次，就可以永久缓存，文件更改时，`Snowpack`会重新构建该单个文件

该项目已经不维护了。团队目前正在开发 [Astro](https://astro.build/)，一个由 Vite 驱动的静态站点构建工具。Astro 团队目前是我们生态中非常活跃的成员，它们帮助 Vite 进益良多。


### Vite
> Vite 通过在一开始将应用中的模块区分为 **依赖** 和 **源码** 两类，改进了开发服务器启动时间。

-   **依赖** 大多为在开发时不会变动的纯 JavaScript。一些较大的依赖（例如有上百个模块的组件库）处理的代价也很高。依赖也通常会存在多种模块化格式（例如 ESM 或者 CommonJS）。
    
    Vite 将会使用 [esbuild](https://esbuild.github.io/) [预构建依赖](https://cn.vitejs.dev/guide/dep-pre-bundling.html)。esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。
    
-   **源码** 通常包含一些并非直接是 JavaScript 的文件，需要转换（例如 JSX，CSS 或者 Vue/Svelte 组件），时常会被编辑。同时，并不是所有的源码都需要同时被加载（例如基于路由拆分的代码模块）。
    
    Vite 以 [原生 ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) 方式提供源码。这实际上是让浏览器接管了打包程序的部分工作：Vite 只需要在浏览器请求源码时进行转换并按需提供源码。根据情景动态导入代码，即只在当前屏幕上实际使用时才会被处理。

Vite 同时利用 HTTP 头来加速整个页面的重新加载（再次让浏览器为我们做更多事情）：源码模块的请求会根据 `304 Not Modified` 进行协商缓存，而依赖模块请求则会通过 `Cache-Control: max-age=31536000,immutable` 进行强缓存，因此一旦被缓存它们将不需要再次请求。

它主要由两部分组成：

-   一个开发服务器，它基于 原生 ES 模块 提供了丰富的内建功能，如速度快到惊人的 模块热更新HMR
-   一套构建指令，它使用 Rollup打包你的代码，并且它是预配置的，可以输出用于生产环境的优化过的静态资源

其作用类似`webpack`+ `webpack-dev-server`，其特点如下：

-   快速的冷启动
-   即时的模块热更新
-   真正的按需编译

`vite`会直接启动开发服务器，不需要进行打包操作，也就意味着不需要分析模块的依赖、不需要编译，因此启动速度非常快

利用现代浏览器支持`ES Module`的特性，当浏览器请求某个模块的时候，再根据需要对模块的内容进行编译，这种方式大大缩短了编译时间


### Webpack

>相比上述的模块化工具，`webpack`大而全，很多常用的功能做到开箱即用。有两大最核心的特点：「一切皆模块」和「按需加载」

与其他构建工具相比，有如下优势：

-   智能解析：对 CommonJS 、 AMD 、ES6 的语法做了兼容
-   万物模块：对 js、css、图片等资源文件都支持打包
-   开箱即用：HRM、Tree-shaking等功能
-   代码分割：可以将代码切割成不同的 chunk，实现按需加载，降低了初始化时间
-   插件系统，具有强大的 Plugin 接口，具有更好的灵活性和扩展性
-   易于调试：支持 SourceUrls 和 SourceMaps
-   快速运行：webpack 使用异步 IO 并具有多级缓存，这使得 webpack 很快且在增量编译上更加快
-   生态环境好：社区更丰富，出现的问题更容易解决


### Turbopack

> Vercel 发布 Turbopack，目前处于 alpha 阶段。Turbopack 由 Webpack 作者 [Tobias Koppers](https://links.jianshu.com/go?to=https%3A%2F%2Ftwitter.com%2FwSokra) 亲自操刀，用 Rust 编写，作者的愿景是替代 Webpack 95% 的功能和扩展性。

对比像 Vite 这样的框架使用了一种技术，它们不会在开发模式下捆绑应用程序源代码。相反，它们依赖于浏览器的原生 ES 模块系统。这种方法导致令人难以置信的响应更新，因为它们只需要转换一个文件。
然而，Vite 可能会遇到由许多模块组成的大型应用程序的扩展问题。浏览器中大量的级联网络请求会导致启动时间相对较慢。对于浏览器来说，如果它能在尽可能少的网络请求中接收到它需要的代码，它会更快——即使是在本地服务器上。
像 webpack 一样，Turbopack 将代码捆绑在开发服务器中。Turbopack 可以更快地完成它，特别是对于大型应用程序，因为它是用 Rust 编写的并且跳过了仅对生产必要的优化工作。


#### 对比vite 和 esbuild[](https://turbo.build/pack/docs/why-turbopack#vite-and-esbuild)

其他工具对“减少工作量”持不同态度。Vite 通过在开发模式下使用 Native ESM 最大限度地减少了工作量。出于上述原因，我们决定不采用这种方法。

在底层，Vite 使用 esbuild 来完成许多任务。esbuild 是一个捆绑器 - 一个超级快的。它不会强制您使用本机 ESM。但出于一些原因，我们决定不采用 esbuild。

esbuild 的代码针对一项任务进行了超优化——快速捆绑。它没有 HMR，我们不想从我们的开发服务器中丢失它。

esbuild 是一个非常快的打包器，但它并没有做太多的缓存。这意味着你最终_会_一次又一次地做同样的工作，即使这项工作是以原生的速度进行的。


Evan Wallace 将 esbuild 称为[下一代捆绑器的概念验证](https://news.ycombinator.com/item?id=22336334). 我们认为他是对的。_我们认为具有_增量计算的 Rust 驱动的捆绑器可以在更大的规模上比 esbuild 表现更好。

Turbopack特性如下：
-   吸取 Webpack 十年来的经验教训，结合 Turborepo 和 Google 的 Bazel 在增量计算方面的创新，创建了一个准备支持未来几十年计算的架构；
-   官方声称热更新比 Vite 快 10 倍，比 Webpack 快 700 倍；
-   内置增量计算引擎(Turbo)，可以达到单个函数级别的缓存；
-   基于请求级别的按需编译；
-  惰性捆绑，只计算呈现页面所需要的代码，然后将其以单个快的形式发送到服务器。在大规模应用情况下，始终比Native ESM 快很多。
-   生态方面支持 JavaScript、TypeScript、CSS、CSS Modules、插件系统会计划支持 SCSS、LESS、Babel 等，流行的前端框架 Svelte、React、Vue.js 等。