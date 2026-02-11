/**
 * 《红颜·史记》阅读页面脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    initReading();

    // 初始化AI助手（需要在initReading之后）
    setTimeout(function() {
        if (window.RedBeautyAssistant) {
            // 重新绑定事件确保AI功能正常工作
            window.RedBeautyAssistant.bindEvents();
        }
    }, 100);
});

function initReading() {
    // 导航栏滚动效果
    initNavScroll();

    // 目录侧边栏
    initTocSidebar();

    // 阅读进度
    initReadingProgress();

    // 章节导航
    initChapterNav();

    // 高亮当前章节
    highlightCurrentChapter();

    // 分享功能
    initShare();
}

/**
 * 导航栏滚动效果
 */
function initNavScroll() {
    const nav = document.getElementById('readNav');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 10) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

/**
 * 目录侧边栏
 */
function initTocSidebar() {
    const toggleBtn = document.getElementById('toggleToc');
    const closeBtn = document.getElementById('closeToc');
    const sidebar = document.getElementById('tocSidebar');
    const overlay = document.getElementById('overlay');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

/**
 * 阅读进度
 */
function initReadingProgress() {
    const progressBar = document.getElementById('progressBar');
    const content = document.querySelector('.chapter-content');

    if (!progressBar) return;

    function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

function isChapterFile(filename) {
    return filename !== 'introduction.html' && filename !== 'conclusion.html';
}

function getChapterHref(filename) {
    // Check if current page is in chapters/ subdirectory
    const currentPath = window.location.pathname;
    const inChaptersDir = currentPath.includes('/chapters/');

    // introduction.html and conclusion.html are in the parent directory
    if (filename === 'introduction.html' || filename === 'conclusion.html') {
        return inChaptersDir ? '../' + filename : filename;
    }
    // Standard chapters are in the chapters/ subdirectory
    return inChaptersDir ? filename : 'chapters/' + filename;
}

/**
 * 章节导航
 */
function initChapterNav() {
    // 从 URL 获取当前章节
    const currentPath = window.location.pathname;
    const chapterFiles = getChapterFiles();

    let currentIndex = -1;
    chapterFiles.forEach(function(file, index) {
        if (currentPath.includes(file)) {
            currentIndex = index;
        }
    });

    if (currentIndex === -1) return; // 不在章节列表中

    const prevBtn = document.querySelector('.chapter-nav-btn.prev');
    const nextBtn = document.querySelector('.chapter-nav-btn.next');

    // 上一章
    if (currentIndex > 0 && prevBtn) {
        prevBtn.href = getChapterHref(chapterFiles[currentIndex - 1]);
        prevBtn.classList.remove('disabled');
        const prevTitle = prevBtn.querySelector('.nav-title');
        if (prevTitle) {
            prevTitle.textContent = getChapterTitle(chapterFiles[currentIndex - 1]);
        }
    }

    // 下一章
    if (currentIndex < chapterFiles.length - 1 && nextBtn) {
        nextBtn.href = getChapterHref(chapterFiles[currentIndex + 1]);
        nextBtn.classList.remove('disabled');
        const nextTitle = nextBtn.querySelector('.nav-title');
        if (nextTitle) {
            nextTitle.textContent = getChapterTitle(chapterFiles[currentIndex + 1]);
        }
    }
}

/**
 * 获取章节文件列表
 */
function getChapterFiles() {
    return [
        'introduction.html',
        'v1c01.html', 'v1c02.html', 'v1c03.html',
        'v2c04.html', 'v2c05.html', 'v2c06.html',
        'v3c07.html', 'v3c08.html', 'v3c09.html',
        'v4c10.html', 'v4c11.html', 'v4c12.html', 'v4c13.html', 'v4c14.html', 'v4c15.html',
        'v5c16.html', 'v5c17.html', 'v5c18.html',
        'conclusion.html'
    ];
}

/**
 * 从文件名获取章节标题
 */
function getChapterTitle(filename) {
    const titles = {
        'introduction.html': '导论',
        'v1c01.html': '选妃制度',
        'v1c02.html': '联姻策略',
        'v1c03.html': '婚姻市场',
        'v2c04.html': '文学书写',
        'v2c05.html': '图像生产',
        'v2c06.html': '方志书写',
        'v3c07.html': '妾制度',
        'v3c08.html': '青楼制度',
        'v3c09.html': '教化制度',
        'v4c10.html': '西施',
        'v4c11.html': '王昭君',
        'v4c12.html': '貂蝉',
        'v4c13.html': '杨贵妃',
        'v4c14.html': '陈圆圆',
        'v4c15.html': '柳如是',
        'v5c16.html': '红颜薄命',
        'v5c17.html': '审美生产',
        'v5c18.html': '身体政治',
        'conclusion.html': '结论'
    };
    return titles[filename] || filename;
}

/**
 * 高亮当前章节
 */
function highlightCurrentChapter() {
    const currentPath = window.location.pathname;
    const tocLinks = document.querySelectorAll('.toc-chapters a');

    tocLinks.forEach(function(link) {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
            link.closest('.toc-part') && link.closest('.toc-part').querySelector('.toc-part-title').classList.add('active');
        }
    });
}

/**
 * 加载章节内容（AJAX）
 * 用于单页应用模式
 */
function loadChapter(chapterFile) {
    const content = document.getElementById('chapterContent');

    // introduction.html and conclusion.html are in the parent directory
    const filePath = isChapterFile(chapterFile) ? 'chapters/' + chapterFile : chapterFile;

    fetch(filePath)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Chapter not found');
            }
            return response.text();
        })
        .then(function(html) {
            // 创建临时容器解析 HTML
            var temp = document.createElement('div');
            temp.innerHTML = html;

            // 提取 body 内容
            var chapterBody = temp.querySelector('.chapter-content');
            if (chapterBody) {
                content.innerHTML = chapterBody.innerHTML;

                // 滚动到顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // 更新 URL
                history.pushState({}, '', filePath);

                // 更新章节导航
                initChapterNav();

                // 高亮当前章节
                highlightCurrentChapter();
            }
        })
        .catch(function(error) {
            console.error('Error loading chapter:', error);
        });
}

/**
 * 分享功能
 */
function initShare() {
    const shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sharePage();
    });
}

/**
 * 分享页面
 */
function sharePage() {
    // 获取页面信息
    const title = document.title || '红颜·史记';
    const description = document.querySelector('meta[name="description"]')?.content || '一部另类的中国女性史';
    const url = window.location.href;
    const logoUrl = 'images/logo.png';

    // 检查是否支持 Web Share API
    if (navigator.share) {
        navigator.share({
            title: title,
            text: description,
            url: url
        }).catch(function(error) {
            if (error.name !== 'AbortError') {
                console.log('Share cancelled:', error);
            }
        });
    } else {
        // 降级方案：显示分享面板
        showSharePanel(title, description, url, logoUrl);
    }
}

/**
 * 显示分享面板（降级方案）
 */
function showSharePanel(title, description, url, logoUrl) {
    // 移除已存在的面板
    const existingPanel = document.getElementById('sharePanel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // 创建分享面板
    const panel = document.createElement('div');
    panel.id = 'sharePanel';
    panel.className = 'share-panel-overlay';

    // 微信分享链接格式
    const wechatShareUrl = 'https://service.wechat.com/share/link?shareid=1&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&desc=' + encodeURIComponent(description) + '&imgurl=' + encodeURIComponent(logoUrl);

    panel.innerHTML = `
        <div class="share-panel">
            <div class="share-panel-header">
                <h3>分享到微信</h3>
                <button class="share-panel-close" id="sharePanelClose">&times;</button>
            </div>
            <div class="share-panel-content">
                <p class="share-url-label">本页链接：</p>
                <div class="share-url-box">
                    <input type="text" value="${url}" readonly id="shareUrlInput">
                    <button class="copy-btn" id="copyShareUrl">复制链接</button>
                </div>
                <p class="share-hint">复制链接后，发送给您微信好友或分享到朋友圈</p>
                <div class="share-wechat-btn">
                    <a href="${wechatShareUrl}" target="_blank" class="wechat-link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.326-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.771-5.853-6.333-6.12H16.94zm-2.28 3.206c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.76 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/>
                        </svg>
                        在微信中打开分享
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(panel);

    // 添加样式
    addSharePanelStyles();

    // 关闭按钮事件
    const closeBtn = document.getElementById('sharePanelClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            panel.remove();
        });
    }

    // 点击外部关闭
    panel.addEventListener('click', function(e) {
        if (e.target === panel) {
            panel.remove();
        }
    });

    // 复制链接功能
    const copyBtn = document.getElementById('copyShareUrl');
    const urlInput = document.getElementById('shareUrlInput');
    if (copyBtn && urlInput) {
        copyBtn.addEventListener('click', function() {
            urlInput.select();
            document.execCommand('copy');
            copyBtn.textContent = '已复制';
            setTimeout(function() {
                copyBtn.textContent = '复制链接';
            }, 2000);
        });
    }
}

/**
 * 添加分享面板样式
 */
function addSharePanelStyles() {
    const styleId = 'sharePanelStyles';
    if (document.getElementById(styleId)) return;

    const styles = document.createElement('style');
    styles.id = styleId;
    styles.textContent = `
        .share-panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        }
        .share-panel {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            animation: slideUp 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .share-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
        }
        .share-panel-header h3 {
            margin: 0;
            font-size: 16px;
            color: #333;
        }
        .share-panel-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            line-height: 1;
        }
        .share-panel-close:hover {
            color: #333;
        }
        .share-panel-content {
            padding: 20px;
        }
        .share-url-label {
            font-size: 13px;
            color: #666;
            margin: 0 0 8px 0;
        }
        .share-url-box {
            display: flex;
            gap: 8px;
        }
        .share-url-box input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 13px;
            color: #333;
            background: #f9f9f9;
        }
        .copy-btn {
            padding: 10px 16px;
            background: #07c160;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            white-space: nowrap;
        }
        .copy-btn:hover {
            background: #06ad56;
        }
        .share-hint {
            font-size: 12px;
            color: #999;
            margin: 12px 0 0 0;
            text-align: center;
        }
        .share-wechat-btn {
            margin-top: 20px;
            text-align: center;
        }
        .wechat-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: #07c160;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
        }
        .wechat-link:hover {
            background: #06ad56;
        }
        .wechat-link svg {
            width: 20px;
            height: 20px;
        }
    `;
    document.head.appendChild(styles);
}
