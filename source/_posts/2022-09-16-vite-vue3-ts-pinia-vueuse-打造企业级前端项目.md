---
title: vite + vue3 + ts + pinia + vueuse 打造企业级前端项目
author: jiaming
authorLink: https://github.com/First-Jim/vite-vue3-ts-pinia-starter
excerpt: 本文主要讲解基于 Vue3.x setup + TypeScript + Vite + Pinia + Element Plus等流行技术栈的项目搭建。
cover:  2022/09/16/vite-vue3-ts-pinia-vueuse-打造企业级前端项目/cover.png
thumbnail: 2022/09/16/vite-vue3-ts-pinia-vueuse-打造企业级前端项目/cover.png
categories:
  - - Vue3 + vite + pinia
    - 企业级Vue3项目
tags:
  - Vue3
  - pinia
toc: true
date: 2022-09-16 13:33:15
---




# 前言

- 通过这篇文章你可以学到
  - 如何使用使用 Vite 搭建项目
  - 如何在 Vite 中集成 typescript
  - 如何在 Vite 中集成 vue-router4 和 pinia
  - 如何使用 vue3 的伴侣 vueuse
  - 如何在项目中集成 eslint 和 prettier 保证代码质量
  - 如何规范化 git 提交信息
  - 如何为团队开发专属的项目模板
  
# 环境依赖版本
- [node](hhttps://github.com/nodejs/node): v16.14.0 
- [vite](https://github.com/vitejs/vite): ^3.1.0
- [@vue/cli](github.com/vuejs/vue-cli): 5.0.0-alpha.2
- [vue](https://github.com/vuejs/vue): ^3.2.37
- [typescript](https://github.com/microsoft/TypeScript): ^4.6.4
- [pinia](https://github.com/vuejs/pinia): ^2.0.22
- [vue-router](https://github.com/vuejs/router): ^4.1.5
- [vueuse](https://github.com/vueuse/vueuse): ^9.2.0
- [eslint](https://github.com/eslint/eslint): ^8.23.1
- [prettier](https://github.com/prettier/prettier): ^2.7.1
- [commitizen](https://github.com/commitizen/cz-cli): ^4.2.5
- [husky](https://github.com/typicode/husky): ^8.0.1


## 快速查看
- [仓库地址](https://github.com/First-Jim/vite-vue3-ts-pinia-starter)


# 初始化项目

## 按步骤提示初始化:

1. 使用 vite-cli 命令

```js
# pnpm
pnpm create vite

# npm
npm init vite@latest

# yarn
yarn create vite
```
2. 输入项目名：

```js
? Project name:  vite-vue3-ts-pinia-vueuse
```

3. 选择一个框架（vue）

```js
? Select a framework: » - Use arrow-keys. Return to submit.
     vanilla // 原生js
 >   vue     // 默认就是 vue3
     react   // react
     preact  // 轻量化react框架
     lit     // 轻量级web组件
     svelte  // svelte框架
```

4. 使用 TypeScript

```js
? Select a variant: › - Use arrow-keys. Return to submit.
     vue
 ❯   vue-ts
```

5. 启动项目

```js
cd vite-vue3-ts-pinia-vueuse && pnpm install && pnpm run dev
```


### 集成配置

1. 为保证 node 的使用

```js
pnpm i @types/node --save-dev
```

2. 修改 tsconfig.json

```js
{
  "compilerOptions": {
    "typeRoots": [
      "node_modules/@types", // 默认值
      "src/types"
   ],
    "target": "esnext",
    "useDefineForClassFields": true,
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom"],
    "baseUrl": "./",
    "paths":{
      "@": ["src"],
      "@/*": ["src/*"],
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

3. 修改 vite.config.ts

```js
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import type { UserConfig, ConfigEnv, ProxyOptions } from 'vite';
const pathResolve = (dir: string): any => {
  return resolve(__dirname, '.', dir);
};

// https://vitejs.cn/config/
const viteConfig = ({ mode }: ConfigEnv): UserConfig => {
  const { VITE_PORT, VITE_OPEN, VITE_BASE_PATH, VITE_OUT_DIR, VITE_PROXY_URL } =
    loadEnv(mode);

  const alias: Record<string, string> = {
    '@': pathResolve('./src'),
  };

  let proxy: Record<string, string | ProxyOptions> = {};
  if (VITE_PROXY_URL) {
    proxy = {
      '/api': {
        target: VITE_PROXY_URL,
        changeOrigin: true,
      },
    };
  }

  return {
    plugins: [vue()],
    root: process.cwd(),
    resolve: { alias },
    base: VITE_BASE_PATH,
    server: {
      host: '0.0.0.0',
      port: VITE_PORT,
      open: VITE_OPEN,
      proxy: proxy,
    },
    build: {
      sourcemap: false,
      outDir: VITE_OUT_DIR,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
  };
};

export default viteConfig;

```

# 代码质量风格的统一

## 集成 eslint

1. 安装

```js
pnpm i eslint eslint-plugin-vue --save-dev
```

由于 ESLint 默认使用 Espree 进行语法解析，无法识别 TypeScript 的一些语法，故我们需要安装 @typescript-eslint/parser 替代掉默认的解析器

```js
pnpm install @typescript-eslint/parser --save-dev
```

2. 创建配置文件： `.eslintrc.js` 或 `.eslintrc.json`

```js
module.exports = {
    parser: 'vue-eslint-parser',

    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022,
        ecmaFeatures: {
            jsx: true
        }
    },

    extends: [
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
    ],

    rules: {
        // override/add rules settings here, such as:
    }
};
```

3. 创建忽略文件：.eslintignore

```js
node_modules/
dist/
index.html
```

4. 命令行式运行：修改 package.json

```js
{
    ...
    "scripts": {
        ...
        "eslint:comment": "使用 ESLint 检查并自动修复 src 目录下所有扩展名为 .js 和 .vue 的文件",
        "eslint": "eslint --ext .js,.vue --ignore-path .gitignore --fix src",
    }
    ...
}
```

## 集成 prettier

1. 安装

```js
pnpm i prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

2. 创建配置文件： `prettier.config.js` 或 `.prettierrc.js`

```js
module.exports = {
    // 一行最多 80 字符
    printWidth: 80,
    // 使用 4 个空格缩进
    tabWidth: 2,
    // 不使用 tab 缩进，而使用空格
    useTabs: false,
    // 行尾需要有分号
    semi: true,
    // 使用单引号代替双引号
    singleQuote: true,
    // 对象的 key 仅在必要时用引号
    quoteProps: 'as-needed',
    // jsx 不使用单引号，而使用双引号
    jsxSingleQuote: false,
    // 末尾使用逗号
    trailingComma: 'all',
    // 大括号内的首尾需要空格 { foo: bar }
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 箭头函数，只有一个参数的时候，也需要括号
    arrowParens: 'always',
    // 每个文件格式化的范围是文件的全部内容
    rangeStart: 0,
    rangeEnd: Infinity,
    // 不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准
    proseWrap: 'preserve',
    // 根据显示样式决定 html 要不要折行
    htmlWhitespaceSensitivity: 'css',
    // 换行符使用 lf
    endOfLine: 'auto'
}
```

3. 修改 .eslintrc.js 配置

```js
module.exports = {
    ...

    extends: [
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
    ],

    ...
};
```

4. 命令行式运行：修改 package.json

```js
{
    ...
    "scripts": {
        ...
        "prettier:comment": "自动格式化当前目录下的所有文件",
        "prettier": "prettier --write"
    }
    ...
}
```

# 集成 pinia

`Pinia` 读音：['piːnə]，是 Vue 官方团队推荐代替`Vuex`的一款轻量级状态管理库。
#### Pinia 有如下特点：

- 完整的 typescript 的支持；
- 足够轻量，压缩后的体积只有1.6kb;
- 去除 mutations，只有 state，getters，actions（这是我最喜欢的一个特点）；
- actions 支持同步和异步；
- 没有模块嵌套，只有 store 的概念，store 之间可以自由使用，更好的代码分割；
- 无需手动添加 store，store 一旦创建便会自动添加；


1. 安装

```js
 pnpm i pinia --save
```

2. 使用

  - 新建 src/store 目录并在其下面创建 index.ts，导出 store

```js
 import { createPinia } from 'pinia'

 const store = createPinia()

 export default store
```

  - 在 main.ts 中引入并使用

```js
 import { createApp } from 'vue'
 import App from './App.vue'
 import store from './store'
 ​
 // 创建vue实例
 const app = createApp(App)
 ​
 // 挂载pinia
 app.use(store)
 ​
 // 挂载实例
 app.mount('#app');
```

- 定义State： 在 src/store 下面创建一个 user.ts

```js
 import { defineStore } from 'pinia'

 export const useUserStore = defineStore({
   id: 'user', // id必填，且需要唯一
   state: () => {
     return {
       name: 'jiaming',
       role: 'admin'
     }
   },
   actions: {
     updateName(name) {
       this.name = name
     }
   }
 })
```

- 获取State： 在 src/components/usePinia.vue 中使用

```js
 <template>
   <div>{{ userStore.name }}</div>
 </template>

 <script lang="ts" setup>
 import { useUserStore } from '@/store/user'

 const userStore = useUserStore()
 </script>
```

- 修改State

```js
 // 1. 直接修改 state （不建议）
 userStore.name = 'coderjim'

 // 2. 通过 actions 去修改
 <script lang="ts" setup>
 import { useUserStore } from '@/store/user'

 const userStore = useUserStore()
 userStore.updateName('coderjim')
 </script>
```

> 更详细上手指南：[链接]()官方文档：[pinia](https://pinia.vuejs.org/introduction.html)


# 集成 vue-router4

1. 安装

```js
 pnpm i vue-router --save
```

2. 使用

- 新建 src/router 目录并在其下面创建 index.ts，导出 router

```js
 import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

 const routes: Array<RouteRecordRaw> = [
   {
     path: '/login',
     name: 'Login',
     meta: {
         title: '登录',
         keepAlive: true,
         requireAuth: false
     },
     component: () => import('@/pages/login.vue')
   },
   {
       path: '/',
       name: 'Index',
       meta: {
           title: '首页',
           keepAlive: true,
           requireAuth: true
       },
       component: () => import('@/pages/index.vue')
   }
 ]

 const router = createRouter({
   history: createWebHistory(),
   routes
 });
 export default router;
```

- 在main.ts 中引入使用

```js
 import { createApp } from 'vue'
 import App from './App.vue'
 import store from './store'
 import router from '@/router';

 // 创建vue实例
 const app = createApp(App);

 app.use(router);

 // 挂载实例
 app.mount('#app');
```

- 修改 App.vue

```js
 <template>
  <router-view><router-view/>
 </template>
```


# 集成 vueuse

> `VueUse` 是一个基于 `Composition API` 的实用函数集合。

1. 安装

```js
 pnpm i @vueuse/core
```

2. 使用

- 创建一个新的 src/page/vueUse.vue 页面来做一个简单的 Demo

```js
 <template>
   <h1> 测试 vueUse 的鼠标坐标 </h1>
   <h3>Mouse: {{x}} x {{y}}</h3>
 </template>

 <script lang="ts">
     import { defineComponent } from 'vue';
     import { useMouse } from '@vueuse/core'

     export default defineComponent({
         name: 'VueUse',
         setup() {
           const { x, y } = useMouse()

           return {
             x, y
           }
         }
     });
 </script>
```


更多函数官方文档：[链接](https://vueuse.org/)



# CSS 的集成

### 主流方案 scss 或 less：

1. 安装

```js
 # .scss and .sass
 pnpm add -D sass

 # .less
 pnpm add -D less
```


2. 使用在 .vue 文件模板中

```js
// .scss
 <template>
     <div class="root">
         <h3>欢迎使用 scss</h3>
     </div>
 </template>
 <style lang="scss">
   .root {}
 </style>

// .less
 <template>
     <div class="root">
         <h3>欢迎使用 less</h3>
     </div>
 </template>
 <style lang="less">
   .root {}
 </style>
```

# 集成 axios

axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。

1. 安装

```js
 pnpm i axios
```

2. 使用

- 新建 src/utils/axios.ts

```js
 import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

 const service = axios.create();

 // Request interceptors
 service.interceptors.request.use(
     (config: AxiosRequestConfig) => {
         // do something
         return config;
     },
     (error: any) => {
         Promise.reject(error);
     }
 );

 // Response interceptors
 service.interceptors.response.use(
     async (response: AxiosResponse) => {
         // do something
     },
     (error: any) => {
         // do something
         return Promise.reject(error);
     }
 );

 export default service;
```

- 在页面中使用即可

```js
<script lang="ts">
    import request from '@/utils/axios';
    const requestRes = async () => {
        let result = await request({
                    url: '/api/xxx',
                    method: 'get'
                  });
    }

</script>
```

3. 由于使用了 typescript，所以需新增 src/types/shims-axios.d.ts

```js
import { AxiosRequestConfig } from 'axios';
/**
 * 自定义扩展axios模块
 * @author Maybe
 */
declare module 'axios' {
    export interface AxiosInstance {
        <T = any>(config: AxiosRequestConfig): Promise<T>;
        request<T = any>(config: AxiosRequestConfig): Promise<T>;
        get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    }
}

```


# css 的 UI 样式库



# 使用 commitizen 规范git提交



# 安装 husky（依赖 husky v8.0.1版本）




# 项目模板地址

> [快速点击](https://github.com/First-Jim/vite-vue3-ts-pinia-starter)