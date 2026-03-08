// ==UserScript==
// @name         微信读书划线导出
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  一键导出微信读书当前书籍的划线为Markdown格式。访问微信读书书籍详情页后，点击右上角的"导出划线"按钮即可下载。
// @author       jerryzlz
// @match        https://weread.qq.com/web/reader/*
// @icon         https://weread.qq.com/favicon.ico
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 样式
    const styles = `
        .wr-export-btn {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            padding: 10px 20px;
            background: #07c160;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.3s;
        }
        .wr-export-btn:hover {
            background: #06ad56;
            transform: translateY(-2px);
        }
        .wr-export-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    `;

    GM_addStyle(styles);

    // 获取书籍ID
    function getBookId() {
        const url = window.location.href;
        const match = url.match(/reader\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }

    // 获取书籍信息
    function getBookInfo() {
        const titleEl = document.querySelector('.book-info .book-title, .readerHeader .book-title, [class*="title"]');
        const authorEl = document.querySelector('.book-info .author, .readerHeader .author, [class*="author"]');

        return {
            title: titleEl ? titleEl.textContent.trim() : '未知书名',
            author: authorEl ? authorEl.textContent.trim() : '未知作者'
        };
    }

    // 获取所有划线
    function getHighlights() {
        const highlights = [];
        const seenContent = new Set(); // 用于去重

        // 尝试多种选择器来获取划线
        const highlightSelectors = [
            '.highlight-item',
            '.wr_highlight_item',
            '[class*="highlight"]',
            '.noteItem',
            '.markItem'
        ];

        let highlightElements = [];
        for (const selector of highlightSelectors) {
            highlightElements = document.querySelectorAll(selector);
            if (highlightElements.length > 0) break;
        }

        // 如果没找到，尝试从页面中提取所有划线相关元素
        if (highlightElements.length === 0) {
            // 尝试查找划线容器
            const containerSelectors = [
                '.readerNoteList',
                '.wr_noteList',
                '[class*="noteList"]',
                '[class*="highlightList"]'
            ];

            for (const containerSelector of containerSelectors) {
                const container = document.querySelector(containerSelector);
                if (container) {
                    highlightElements = container.querySelectorAll('[class*="content"], [class*="text"], .abstract');
                    break;
                }
            }
        }

        // 如果还是没找到，尝试更通用的方法
        if (highlightElements.length === 0) {
            // 查找所有可能包含划线的区块
            const allElements = document.querySelectorAll('.wr_thumbLine, .wr_highlight, [data-type="highlight"]');
            if (allElements.length > 0) {
                highlightElements = allElements;
            }
        }

        // 遍历页面中的划线元素
        highlightElements.forEach((el, index) => {
            const text = el.textContent.trim();
            // 过滤掉太短的内容和重复内容
            if (text && text.length > 5 && !seenContent.has(text)) {
                seenContent.add(text);
                highlights.push({
                    index: highlights.length + 1,
                    content: text,
                    chapter: '', // 需要从页面中提取章节信息
                    color: ''   // 需要从页面中提取颜色信息
                });
            }
        });

        return highlights;
    }

    // 尝试从API获取划线数据
    async function fetchHighlightsFromApi(bookId) {
        try {
            // 尝试调用微信读书的API
            const url = `https://weread.qq.com/web/reader/${bookId}/highlights`;

            // 创建一个隐藏的iframe来获取数据
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (e) {
            console.log('API调用失败，使用DOM解析:', e);
        }
        return null;
    }

    // 生成Markdown
    function generateMarkdown(bookInfo, highlights) {
        let md = `# ${bookInfo.title}\n\n`;
        md += `> 作者：${bookInfo.author}\n\n`;
        md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n\n`;
        md += `---\n\n`;
        md += `# 划线内容（共 ${highlights.length} 条）\n\n`;

        // 按章节分组（如果有章节信息）
        const byChapter = {};
        highlights.forEach(h => {
            const chapter = h.chapter || '未分类';
            if (!byChapter[chapter]) {
                byChapter[chapter] = [];
            }
            byChapter[chapter].push(h);
        });

        // 输出
        for (const [chapter, items] of Object.entries(byChapter)) {
            if (chapter !== '未分类') {
                md += `## ${chapter}\n\n`;
            }
            items.forEach(h => {
                md += `> ${h.content}\n\n`;
                if (h.note) {
                    md += `**笔记：** ${h.note}\n\n`;
                }
            });
        }

        return md;
    }

    // 下载Markdown文件
    function downloadMarkdown(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 主导出函数
    async function exportHighlights() {
        const bookId = getBookId();
        if (!bookId) {
            alert('无法获取书籍ID');
            return;
        }

        const btn = document.querySelector('.wr-export-btn');
        btn.disabled = true;
        btn.textContent = '导出中...';

        try {
            // 获取书籍信息
            const bookInfo = getBookInfo();
            console.log('书籍信息:', bookInfo);

            // 获取划线数据
            let highlights = getHighlights();
            console.log('DOM解析到划线:', highlights.length, '条');

            // 如果DOM解析失败，尝试从API获取
            if (highlights.length === 0) {
                const apiData = await fetchHighlightsFromApi(bookId);
                if (apiData && apiData.highlights) {
                    highlights = apiData.highlights.map((h, i) => ({
                        index: i + 1,
                        content: h.content || '',
                        chapter: h.chapterName || '',
                        note: h.note || '',
                        color: h.color || ''
                    }));
                }
            }

            if (highlights.length === 0) {
                alert('未找到划线数据，请确保已打开书籍的划线页面');
                return;
            }

            // 生成Markdown
            const md = generateMarkdown(bookInfo, highlights);

            // 生成文件名
            const filename = `${bookInfo.title}_划线.md`
                .replace(/[\\/:*?"<>|]/g, '_')
                .substring(0, 100);

            // 下载
            downloadMarkdown(md, filename);
            btn.textContent = '导出成功!';

            setTimeout(() => {
                btn.textContent = '导出划线';
                btn.disabled = false;
            }, 2000);

        } catch (e) {
            console.error('导出失败:', e);
            alert('导出失败: ' + e.message);
            btn.disabled = false;
            btn.textContent = '导出划线';
        }
    }

    // 创建导出按钮
    function createExportButton() {
        // 检查按钮是否已存在
        if (document.querySelector('.wr-export-btn')) {
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'wr-export-btn';
        btn.textContent = '导出划线';
        btn.title = '导出当前书籍的划线为Markdown';

        btn.addEventListener('click', exportHighlights);

        document.body.appendChild(btn);
    }

    // 初始化
    function init() {
        // 等待页面加载完成
        if (document.readyState === 'complete') {
            createExportButton();
        } else {
            window.addEventListener('load', createExportButton);
        }

        // 监听URL变化（单页应用）
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                // 页面变化后重新添加按钮
                setTimeout(createExportButton, 1000);
            }
        }).observe(document, { subtree: true, childList: true });
    }

    init();
})();
