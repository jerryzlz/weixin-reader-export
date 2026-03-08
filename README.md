# 微信读书划线导出

<a href="https://greasyfork.org/zh-CN/scripts/568910"><img src="https://img.shields.io/badge/GreasyFork-安装-blue?style=flat-square" alt="GreasyFork"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>

一键导出微信读书当前书籍的划线为 Markdown 格式。

## 简介

微信读书划线导出是一款油猴（Tampermonkey）脚本，帮助用户将微信读书中的书籍划线内容导出为 Markdown 格式，方便备份和整理阅读笔记。

## 功能特性

- 🚀 **一键导出**：点击按钮即可导出，简单快捷
- 📝 **Markdown 格式**：导出为标准 Markdown 文件，便于阅读和转换
- 📚 **自动识别**：自动获取书籍信息和划线内容
- 🔄 **去重过滤**：自动过滤重复内容，保证导出质量
- 🎨 **简洁 UI**：绿色悬浮按钮，不影响阅读体验

## 安装教程

### 前置条件

首先需要安装浏览器扩展 **Tampermonkey（油猴）**：

- [Chrome 应用商店](https://chrome.google.com/webstore/detail/tampermonkey/)
- [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)

### 安装脚本

**方式一：GreasyFork（推荐）**

访问 [GreasyFork 脚本页面](https://greasyfork.org/zh-CN/scripts/568910) 点击安装。

**方式二：手动安装**

1. 点击右上角 **Code** 按钮 → **Download ZIP**
2. 解压后打开油猴扩展
3. 点击 **添加新脚本**
4. 将 `weixin-reader-export.user.js` 文件内容复制粘贴到编辑器中
5. 按 `Ctrl + S` 保存

## 使用方法

1. 登录 [微信读书网页版](https://weread.qq.com/)
2. 打开任意一本有划线的书籍
3. 点击页面右上角的绿色 **「导出划线」** 按钮
4. 浏览器会自动下载 Markdown 文件

## 导出效果示例

```markdown
# 书名

> 作者：作者名

> 导出时间：2024/1/1 00:00:00

---

# 划线内容（共 X 条）

> 这是第一条划线内容...

> 这是第二条划线内容...
```

## 支持的页面

- `https://weread.qq.com/web/reader/*`

## 技术栈

- JavaScript (ES6+)
- Tampermonkey API

## 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 相关链接

- [微信读书](https://weread.qq.com/)
- [Tampermonkey 官网](https://www.tampermonkey.net/)
- [GreasyFork](https://greasyfork.org/)

---

如果觉得好用，欢迎 Star ⭐️ 支持！
