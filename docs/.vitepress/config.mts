import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Blog",
  description: "My technical notes",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Personal', link: '/personal/' },
      { text: 'Topsfuture', link: '/topsfuture/' },
      { text: 'Debug', link: '/debug/' }
    ],

    sidebar: {
      '/personal/': [
        {
          text: 'Personal',
          items: [
            { text: 'Personal 首页', link: '/personal/' }
          ]
        }
      ],
      '/topsfuture/': [
        {
          text: 'Topsfuture',
          items: [
            { text: 'Topsfuture 首页', link: '/topsfuture/' },
            { text: 'rpi-imager / tps-imager 构建指南', link: '/topsfuture/rpi-imager-build-guide' },
            { text: 'Git 提交与 MR 流程', link: '/topsfuture/Git-MergeRequest' }
          ]
        }
      ],
      '/debug/': [
        {
          text: 'Debug',
          items: [
            { text: 'Debug 首页', link: '/debug/' },
            { text: '博客操作手册', link: '/debug/blog-manual' },
            { text: 'Markdown Examples', link: '/debug/markdown-examples' },
            { text: 'Runtime API Examples', link: '/debug/api-examples' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
