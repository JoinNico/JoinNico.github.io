# 博客操作手册

本文档记录这个 VitePress 博客的日常维护方法，包括本地预览、编译构建、修改文章、调整导航和发布前检查。

## 项目结构

当前博客的主要文件如下：

```text
blog/
├─ package.json
└─ docs/
   ├─ index.md
   ├─ personal/
   ├─ topsfuture/
   ├─ debug/
   └─ .vitepress/
      └─ config.mts
```

常用文件说明：

- `docs/index.md`：博客首页。
- `docs/personal/`：个人笔记目录。
- `docs/topsfuture/`：Topsfuture 相关文档目录。
- `docs/debug/`：调试记录、博客维护和示例页面目录。
- `docs/.vitepress/config.mts`：站点标题、导航栏、侧边栏等配置。
- `package.json`：本地预览、编译、预览构建结果的命令。

## 第一次使用

进入博客目录：

```bash
cd /home/yunhaogu/myproject/blog
```

安装依赖：

```bash
npm install
```

如果依赖已经安装过，后续通常不需要重复执行。

## 编译博客

发布前执行编译：

```bash
npm run docs:build
```

编译成功后，静态文件会生成到：

```text
docs/.vitepress/dist
```

这个目录是构建产物，不建议手动修改。需要改内容时，应修改 `docs/` 下的 Markdown 或 `.vitepress/config.mts`。

## 预览编译结果

如果想检查最终构建出来的网站效果，可以先编译，再预览：

```bash
npm run docs:build
npm run docs:preview -- --host 0.0.0.0
```
启动成功后，浏览器打开命令行提示的地址即可查看：

```text
http://localhost:5173/
```
如果 `5173` 端口被占用，可以换一个端口：

```bash
npm run docs:dev -- --port 5174 --host 0.0.0.0
```

开发服务器运行时，修改 Markdown 或配置文件后刷新浏览器即可看到效果。
## 修改已有文章

直接编辑对应的 Markdown 文件即可。

例如修改 Git/MR 流程文档：

```text
docs/topsfuture/Git-MergeRequest.md
```

修改后建议执行：

```bash
npm run docs:build
```

确认没有 Markdown 或配置错误。

## 添加新文章

在 `docs/` 目录下新建一个 `.md` 文件。

示例：

```text
docs/linux-build.md
```

文章内容示例：

````markdown
# Linux 编译说明

这里写编译环境、编译命令、常见问题等内容。

## 编译命令

```bash
make defconfig
make -j8
```
````

然后在 `docs/.vitepress/config.mts` 里添加入口。链接不需要写 `.md` 后缀：

```ts
nav: [
  { text: 'Home', link: '/' },
  { text: 'Linux 编译', link: '/linux-build' }
]
```

侧边栏示例：

```ts
sidebar: [
  {
    text: '开发文档',
    items: [
      { text: 'Linux 编译说明', link: '/linux-build' }
    ]
  }
]
```

## 修改导航和侧边栏

编辑配置文件：

```text
docs/.vitepress/config.mts
```

常用配置：

- `title`：浏览器标题和站点标题。
- `description`：站点描述。
- `themeConfig.nav`：顶部导航栏。
- `themeConfig.sidebar`：左侧侧边栏。
- `themeConfig.socialLinks`：右上角社交链接。

修改后如果页面没有变化，重启开发服务器再刷新浏览器。

## 修改首页

首页文件是：

```text
docs/index.md
```

首页上方的 `hero` 控制标题、描述和按钮：

```yaml
hero:
  name: "My Blog"
  text: "My technical notes"
  tagline: My great project tagline
```

下面的 `features` 控制首页功能卡片：

```yaml
features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet
```

## 添加图片

建议把图片放到：

```text
docs/public/images/
```

例如：

```text
docs/public/images/build-flow.png
```

在 Markdown 中引用：

```markdown
![编译流程](/images/build-flow.png)
```




## 常见问题

页面 404：

- 检查 `config.mts` 里的 `link` 是否写错。
- Markdown 文件名是 `docs/debug/blog-manual.md` 时，链接应写 `/debug/blog-manual`。

编译失败：

- 先看终端报错提示的文件和行号。
- 检查 Markdown 代码块是否忘记结束。
- 检查 `config.mts` 里逗号、括号是否完整。

修改后浏览器没变化：

- 刷新浏览器。
- 重启 `npm run docs:dev`。
- 确认修改的是 `docs/` 下的源文件，而不是 `docs/.vitepress/dist` 下的构建产物。
