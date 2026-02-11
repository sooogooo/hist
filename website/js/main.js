/**
 * 红颜·史记 - 静态网站 JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    initNavbarScroll();

    // 移动端导航菜单
    initMobileNav();

    // 平滑滚动到锚点
    initSmoothScroll();

    // 滚动动画
    initScrollAnimations();

    // AI助手初始化
    initAIAssistant();
});

/**
 * 导航栏滚动效果
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/**
 * AI助手初始化
 */
function initAIAssistant() {
    // AI设置面板HTML注入
    injectAISettingsPanel();

    // AI聊天面板HTML注入（如果在阅读页面）
    if (document.getElementById('chapterContent') || document.querySelector('.reading-mode')) {
        injectAIChatPanel();
        injectAIFloatButton();
    }
}

/**
 * 注入AI设置面板HTML
 */
function injectAISettingsPanel() {
    // 检查是否已存在
    if (document.getElementById('aiSettings')) return;

    const panelHTML = `
        <!-- AI设置面板 -->
        <div id="aiSettings" class="ai-panel-overlay">
            <div class="ai-panel">
                <div class="ai-panel-header">
                    <h3>AI助手设置</h3>
                    <button class="ai-panel-close">&times;</button>
                </div>
                <div class="ai-panel-body">
                    <div class="ai-form-group">
                        <label>选择模型</label>
                        <select id="aiModel">
                            <option value="deepseek">DeepSeek (性价比高)</option>
                            <option value="moonshot">Moonshot Kimi (长文本)</option>
                            <option value="bigmodel">智谱AI BigModel</option>
                        </select>
                    </div>

                    <div class="ai-form-group">
                        <label>API Key</label>
                        <input type="password" id="apiKey" placeholder="输入API Key">
                        <p class="ai-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            API Key仅存储在浏览器本地，不会发送到任何服务器
                        </p>
                        <p class="ai-cost-warning">
                            注意：使用API可能产生费用，请自行承担相应责任
                        </p>
                        <p class="model-cost" id="modelCost"></p>
                    </div>

                    <button id="testApiBtn" class="ai-btn ai-btn-primary">测试连接</button>
                    <div id="apiStatus" class="ai-status"></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
}

/**
 * 注入AI聊天面板HTML
 */
function injectAIChatPanel() {
    // 检查是否已存在
    if (document.getElementById('aiChat')) return;

    const chatHTML = `
        <!-- 红颜助手面板 -->
        <div id="aiChat" class="ai-chat-overlay">
            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <div class="ai-chat-title">
                        <span class="ai-avatar">红</span>
                        <span>红颜助手</span>
                    </div>
                    <div class="ai-chat-controls">
                        <button id="clearChat" class="ai-chat-btn" title="清空对话">&#128465;</button>
                        <button id="closeChat" class="ai-chat-btn">&times;</button>
                    </div>
                </div>
                <div id="chatMessages" class="ai-chat-messages">
                    <div class="ai-message ai-message-welcome">
                        <div class="ai-message-content">
                            您好！我是红颜助手。选中任意文本或章节，我可以帮您解答问题。
                        </div>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <div id="selectedText" class="selected-text-preview" style="display:none">
                        <span>已选择：</span>
                        <span id="selectedContent"></span>
                    </div>
                    <div class="input-row">
                        <button id="selectTextBtn" class="ai-input-btn" title="选择文本">&#128221;</button>
                        <input type="text" id="chatInput" placeholder="输入问题...">
                        <button id="sendMessage" class="ai-send-btn">发送</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

/**
 * 注入AI浮动按钮HTML
 */
function injectAIFloatButton() {
    // 检查是否已存在
    if (document.getElementById('openAiChat')) return;

    const btnHTML = `
        <button id="openAiChat" class="ai-float-btn" title="红颜助手">&#128105;</button>
    `;

    document.body.insertAdjacentHTML('beforeend', btnHTML);
}

/**
 * 移动端导航菜单
 */
function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // 点击导航链接后关闭菜单
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // 点击外部区域关闭菜单
        document.addEventListener('click', function(event) {
            if (!navbarContains(event.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

function navbarContains(element) {
    const navbar = document.getElementById('navbar');
    return navbar && navbar.contains(element);
}

/**
 * 平滑滚动到锚点
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 滚动动画
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // 添加动画类到元素
    const animatedElements = document.querySelectorAll(
        '.feature-card, .question-card, .timeline-item, .volume-card, ' +
        '.theory-category, .figure-card, .principle-card'
    );

    animatedElements.forEach(function(el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease ' + (index * 0.1) + 's, transform 0.6s ease ' + (index * 0.1) + 's';
        observer.observe(el);
    });

    // CSS动画类
    const style = document.createElement('style');
    style.textContent = `
        .is-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 返回顶部按钮（可选功能）
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }
        });

        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * 主动设置导航链接active状态
 */
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}
