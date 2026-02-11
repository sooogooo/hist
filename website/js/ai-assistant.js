/**
 * 红颜·史记 - AI助手核心功能
 * 支持 DeepSeek、Moonshot (Kimi)、智谱AI (BigModel)
 */

(function() {
    'use strict';

    // AI模型配置
    const AI_MODELS = {
        deepseek: {
            name: 'DeepSeek',
            apiUrl: 'https://api.deepseek.com/chat/completions',
            model: 'deepseek-chat',
            cost: '低 (约 $0.14/1M tokens)',
            description: '性价比高，响应快速'
        },
        moonshot: {
            name: 'Moonshot (Kimi)',
            apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
            model: 'moonshot-v1-8k',
            cost: '中 (约 $0.60/1M tokens)',
            description: '长文本处理能力强'
        },
        bigmodel: {
            name: '智谱AI (BigModel)',
            apiUrl: 'https://open.bigmodel.cn/api/paas/v3/chat/completions',
            model: 'glm-4',
            cost: '中',
            description: '中文理解能力强'
        }
    };

    // 系统提示词
    const SYSTEM_PROMPT = `你是《红颜·史记》的专业阅读助手，精通中国古代女性史。

你的职责：
1. 解答读者关于章节内容的疑问
2. 提供历史背景和制度分析
3. 帮助理解复杂的学术概念
4. 保持学术严谨性

请用简洁、专业的语言回答。如果涉及史料，请注明来源。`;

    // 存储键名
    const STORAGE_KEYS = {
        API_KEY: 'red_beauty_api_key',
        MODEL: 'red_beauty_model',
        CHAT_HISTORY: 'red_beauty_chat_history'
    };

    // 红颜助手类
    class RedBeautyAssistant {
        constructor() {
            this.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
            this.model = localStorage.getItem(STORAGE_KEYS.MODEL) || 'deepseek';
            this.chatHistory = this.loadChatHistory();
            this.currentSelectedText = '';
            this.currentChapter = this.getCurrentChapter();
            this.isLoading = false;
            this.abortController = null;

            this.init();
        }

        init() {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.bindEvents());
            } else {
                this.bindEvents();
            }
        }

        bindEvents() {
            // AI设置面板事件
            this.bindSettingsEvents();

            // AI聊天面板事件
            this.bindChatEvents();

            // 文本选择事件
            this.bindTextSelectionEvents();
        }

        // ==================== 设置面板 ====================

        bindSettingsEvents() {
            const openBtn = document.getElementById('openAiSettings');
            const closeBtn = document.querySelector('.ai-panel-close');
            const panel = document.getElementById('aiSettings');
            const modelSelect = document.getElementById('aiModel');
            const apiKeyInput = document.getElementById('apiKey');
            const testBtn = document.getElementById('testApiBtn');
            const saveBtn = document.getElementById('saveAiSettings');

            if (openBtn && panel) {
                openBtn.addEventListener('click', () => this.openSettings());
            }

            if (closeBtn && panel) {
                closeBtn.addEventListener('click', () => this.closeSettings());
            }

            if (panel) {
                panel.addEventListener('click', (e) => {
                    if (e.target === panel) this.closeSettings();
                });
            }

            if (modelSelect) {
                modelSelect.addEventListener('change', (e) => {
                    this.model = e.target.value;
                    this.updateCostDisplay();
                });
            }

            if (apiKeyInput) {
                // 加载保存的API Key
                if (this.apiKey) {
                    apiKeyInput.value = this.apiKey;
                }

                apiKeyInput.addEventListener('input', () => {
                    // 实时验证
                    const isValid = this.validateApiKey(apiKeyInput.value, this.model);
                    this.updateApiStatus(isValid ? '' : '', '');
                });
            }

            if (testBtn) {
                testBtn.addEventListener('click', () => this.testConnection());
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveSettings());
            }

            // 初始化显示
            this.updateCostDisplay();
        }

        openSettings() {
            const panel = document.getElementById('aiSettings');
            const modelSelect = document.getElementById('aiModel');
            const apiKeyInput = document.getElementById('apiKey');

            if (panel) {
                // 恢复设置值
                if (modelSelect) modelSelect.value = this.model;
                if (apiKeyInput) apiKeyInput.value = this.apiKey;

                panel.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        closeSettings() {
            const panel = document.getElementById('aiSettings');
            if (panel) {
                panel.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        updateCostDisplay() {
            const costEl = document.getElementById('modelCost');
            const descEl = document.getElementById('modelDescription');
            const modelInfo = AI_MODELS[this.model];

            if (costEl && modelInfo) {
                costEl.textContent = `费用参考：${modelInfo.cost}`;
            }
            if (descEl && modelInfo) {
                descEl.textContent = modelInfo.description;
            }
        }

        validateApiKey(key, model) {
            // 基本的格式验证
            if (!key || key.length < 10) return false;

            // 不同服务商的格式要求
            switch (model) {
                case 'deepseek':
                    return key.startsWith('sk-') && key.length > 20;
                case 'moonshot':
                    return key.startsWith('k-') && key.length > 20;
                case 'bigmodel':
                    return key.length > 20;
                default:
                    return key.length > 10;
            }
        }

        async testConnection() {
            const modelSelect = document.getElementById('aiModel');
            const apiKeyInput = document.getElementById('apiKey');
            const statusEl = document.getElementById('apiStatus');
            const testBtn = document.getElementById('testApiBtn');

            const model = modelSelect ? modelSelect.value : this.model;
            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : this.apiKey;

            if (!apiKey) {
                this.updateApiStatus('请输入 API Key', 'error');
                return;
            }

            this.updateApiStatus('正在测试连接...', 'loading');
            testBtn.disabled = true;

            try {
                const response = await fetch(AI_MODELS[model].apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: AI_MODELS[model].model,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: '测试连接' }
                        ],
                        max_tokens: 50
                    })
                });

                if (response.ok) {
                    this.updateApiStatus('连接成功！', 'success');
                    this.apiKey = apiKey;
                    this.model = model;
                    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
                    localStorage.setItem(STORAGE_KEYS.MODEL, model);
                } else {
                    const error = await response.json().catch(() => ({}));
                    this.updateApiStatus(`连接失败：${error.error?.message || response.statusText}`, 'error');
                }
            } catch (error) {
                this.updateApiStatus(`连接错误：${error.message}`, 'error');
            } finally {
                testBtn.disabled = false;
            }
        }

        saveSettings() {
            const modelSelect = document.getElementById('aiModel');
            const apiKeyInput = document.getElementById('apiKey');

            const model = modelSelect ? modelSelect.value : this.model;
            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

            if (!apiKey) {
                this.updateApiStatus('请输入 API Key', 'error');
                return;
            }

            this.model = model;
            this.apiKey = apiKey;

            localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
            localStorage.setItem(STORAGE_KEYS.MODEL, model);

            this.updateApiStatus('设置已保存！', 'success');

            setTimeout(() => this.closeSettings(), 1000);
        }

        updateApiStatus(message, type) {
            const statusEl = document.getElementById('apiStatus');
            if (statusEl) {
                statusEl.textContent = message;
                statusEl.className = 'ai-status ' + type;
            }
        }

        // ==================== 聊天面板 ====================

        bindChatEvents() {
            const openBtn = document.getElementById('openAiChat');
            const closeBtn = document.getElementById('closeChat');
            const clearBtn = document.getElementById('clearChat');
            const sendBtn = document.getElementById('sendMessage');
            const input = document.getElementById('chatInput');
            const selectTextBtn = document.getElementById('selectTextBtn');
            const chatPanel = document.getElementById('aiChat');

            if (openBtn && chatPanel) {
                openBtn.addEventListener('click', () => this.openChat());
            }

            if (closeBtn && chatPanel) {
                closeBtn.addEventListener('click', () => this.closeChat());
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearChat());
            }

            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendMessage());
            }

            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
            }

            if (selectTextBtn) {
                selectTextBtn.addEventListener('click', () => this.toggleTextSelection());
            }

            if (chatPanel) {
                chatPanel.addEventListener('click', (e) => {
                    if (e.target === chatPanel) this.closeChat();
                });
            }
        }

        openChat() {
            const chatPanel = document.getElementById('aiChat');
            if (chatPanel) {
                chatPanel.classList.add('active');
                document.body.style.overflow = 'hidden';

                // 聚焦输入框
                setTimeout(() => {
                    const input = document.getElementById('chatInput');
                    if (input) input.focus();
                }, 100);
            }
        }

        closeChat() {
            const chatPanel = document.getElementById('aiChat');
            if (chatPanel) {
                chatPanel.classList.remove('active');
                document.body.style.overflow = '';

                // 退出选择模式
                this.exitSelectionMode();
            }
        }

        clearChat() {
            this.chatHistory = [];
            localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);

            const messagesContainer = document.getElementById('chatMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="ai-message ai-message-welcome">
                        对话已清空。您好！我是红颜助手。选中任意文本或章节，我可以帮您解答问题。
                    </div>
                `;
            }
        }

        // ==================== 消息处理 ====================

        async sendMessage() {
            const input = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendMessage');

            if (!input) return;

            const message = input.value.trim();
            if (!message || this.isLoading) return;

            // 检查API Key
            if (!this.apiKey) {
                this.addMessage('assistant', '请先在设置中配置 API Key。点击右上角"AI设置"按钮进行配置。');
                this.openSettings();
                return;
            }

            // 添加用户消息
            this.addMessage('user', message);
            input.value = '';

            // 清空选中文本显示
            this.clearSelectedText();

            // 显示加载状态
            this.setLoading(true);

            try {
                // 构建消息
                const messages = this.buildMessages(message);

                // 发送请求
                const response = await this.makeApiRequest(messages, message);

                // 处理响应
                if (response) {
                    this.addMessage('assistant', response);
                }
            } catch (error) {
                this.addMessage('assistant', `抱歉，发生错误：${error.message}`);
            } finally {
                this.setLoading(false);
            }
        }

        buildMessages(userMessage) {
            const messages = [];

            // 系统提示
            messages.push({ role: 'system', content: SYSTEM_PROMPT });

            // 当前章节信息
            if (this.currentChapter) {
                messages.push({
                    role: 'system',
                    content: `当前阅读章节：${this.currentChapter.title}（${this.currentChapter.volume}）`
                });
            }

            // 选中文本
            if (this.currentSelectedText) {
                messages.push({
                    role: 'system',
                    content: `用户选中的文本："${this.currentSelectedText}"`
                });
            }

            // 历史记录（最近10轮）
            const recentHistory = this.chatHistory.slice(-10);
            messages.push(...recentHistory);

            // 当前消息
            messages.push({ role: 'user', content: userMessage });

            return messages;
        }

        async makeApiRequest(messages, userMessage) {
            const modelConfig = AI_MODELS[this.model];
            if (!modelConfig) throw new Error('未配置模型');

            this.abortController = new AbortController();

            const response = await fetch(modelConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: modelConfig.model,
                    messages: messages,
                    stream: true,
                    max_tokens: 2000,
                    temperature: 0.7
                }),
                signal: this.abortController.signal
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `HTTP ${response.status}`);
            }

            // 处理流式响应
            return this.handleStreamResponse(response, messages, userMessage);
        }

        async handleStreamResponse(response, messages, userMessage) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            // 创建加载消息
            const loadingId = this.addLoadingMessage();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    result += content;
                                    this.updateLoadingMessage(loadingId, result);
                                }
                            } catch (e) {
                                // 忽略解析错误
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('请求已取消');
                }
                throw error;
            }

            // 移除加载消息，添加最终结果
            this.removeLoadingMessage(loadingId);

            if (result) {
                // 保存到历史记录
                this.saveToHistory('user', userMessage);
                this.saveToHistory('assistant', result);
            }

            return result;
        }

        addMessage(role, content) {
            const container = document.getElementById('chatMessages');
            if (!container) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `ai-message ai-message-${role}`;

            // 格式化内容
            const formattedContent = this.formatMessage(content);

            messageDiv.innerHTML = `
                <div class="ai-message-content">${formattedContent}</div>
                <div class="ai-message-time">${this.getTimeString()}</div>
            `;

            container.appendChild(messageDiv);
            this.scrollToBottom(container);

            return messageDiv;
        }

        addLoadingMessage() {
            const container = document.getElementById('chatMessages');
            if (!container) return null;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message ai-message-loading';
            messageDiv.id = 'ai-loading-' + Date.now();
            messageDiv.innerHTML = `
                <div class="ai-message-content">
                    <span class="typing-indicator">
                        <span></span><span></span><span></span>
                    </span>
                    <span class="loading-text">正在思考...</span>
                </div>
            `;

            container.appendChild(messageDiv);
            this.scrollToBottom(container);

            return messageDiv.id;
        }

        updateLoadingMessage(id, content) {
            const messageDiv = document.getElementById(id);
            if (!messageDiv) return;

            const contentDiv = messageDiv.querySelector('.ai-message-content');
            if (contentDiv) {
                // 移除加载指示器，添加实际内容
                contentDiv.innerHTML = this.formatMessage(content);
            }
        }

        removeLoadingMessage(id) {
            const messageDiv = document.getElementById(id);
            if (messageDiv) {
                messageDiv.remove();
            }
        }

        formatMessage(text) {
            if (!text) return '';

            // 转义HTML
            let formatted = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // 格式化换行
            formatted = formatted.replace(/\n/g, '<br>');

            // 格式化粗体
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // 格式化斜体
            formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

            // 格式化列表
            formatted = formatted.replace(/^- (.*$)/gm, '<li>$1</li>');
            formatted = formatted.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

            // 格式化引用
            formatted = formatted.replace(/> (.*$)/gm, '<blockquote>$1</blockquote>');

            return formatted;
        }

        scrollToBottom(container) {
            container.scrollTop = container.scrollHeight;
        }

        getTimeString() {
            const now = new Date();
            return now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');
        }

        setLoading(loading) {
            this.isLoading = loading;
            const sendBtn = document.getElementById('sendMessage');
            const input = document.getElementById('chatInput');

            if (sendBtn) {
                sendBtn.disabled = loading;
                sendBtn.textContent = loading ? '...' : '发送';
            }

            if (input) {
                input.disabled = loading;
            }
        }

        // ==================== 文本选择 ====================

        bindTextSelectionEvents() {
            document.addEventListener('mouseup', () => this.handleTextSelection());
        }

        handleTextSelection() {
            if (!document.body.classList.contains('text-selecting')) return;

            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0) {
                this.currentSelectedText = text;
                this.showSelectedText(text);
                this.exitSelectionMode();
            }
        }

        toggleTextSelection() {
            if (document.body.classList.contains('text-selecting')) {
                this.exitSelectionMode();
            } else {
                this.enterSelectionMode();
            }
        }

        enterSelectionMode() {
            document.body.classList.add('text-selecting');
            this.showSelectionTooltip();
        }

        exitSelectionMode() {
            document.body.classList.remove('text-selecting');
            this.hideSelectionTooltip();
        }

        showSelectionTooltip() {
            this.removeSelectionTooltip();

            const tooltip = document.createElement('div');
            tooltip.id = 'selectionTooltip';
            tooltip.className = 'selection-tooltip';
            tooltip.textContent = '请用鼠标选择文本';
            document.body.appendChild(tooltip);

            // 动画
            setTimeout(() => tooltip.classList.add('visible'), 10);
        }

        removeSelectionTooltip() {
            const tooltip = document.getElementById('selectionTooltip');
            if (tooltip) tooltip.remove();
        }

        hideSelectionTooltip() {
            this.removeSelectionTooltip();
        }

        showSelectedText(text) {
            const preview = document.getElementById('selectedText');
            const content = document.getElementById('selectedContent');

            if (preview && content) {
                content.textContent = text.length > 50 ? text.substring(0, 50) + '...' : text;
                preview.style.display = 'flex';
            }

            // 添加到输入框
            const input = document.getElementById('chatInput');
            if (input) {
                input.value = `关于这段文本："${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"，我想了解：`;
                input.focus();
            }
        }

        clearSelectedText() {
            const preview = document.getElementById('selectedText');
            if (preview) {
                preview.style.display = 'none';
            }
            this.currentSelectedText = '';
        }

        // ==================== 历史记录 ====================

        loadChatHistory() {
            try {
                const history = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
                return history ? JSON.parse(history) : [];
            } catch (e) {
                console.error('加载聊天历史失败:', e);
                return [];
            }
        }

        saveToHistory(role, content) {
            this.chatHistory.push({ role, content });

            // 限制历史长度
            if (this.chatHistory.length > 50) {
                this.chatHistory = this.chatHistory.slice(-50);
            }

            // 保存到本地存储
            try {
                localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(this.chatHistory));
            } catch (e) {
                console.error('保存聊天历史失败:', e);
            }
        }

        // ==================== 章节信息 ====================

        getCurrentChapter() {
            // 从页面元素获取章节信息
            const titleEl = document.querySelector('.chapter-content h1');
            const volumeEl = document.querySelector('.chapter-content h2');

            if (titleEl) {
                // 从URL推断卷信息
                const path = window.location.pathname;
                let volume = '';

                if (path.includes('v1')) volume = '第一卷 · 美的政治经济学';
                else if (path.includes('v2')) volume = '第二卷 · 话语的生产';
                else if (path.includes('v3')) volume = '第三卷 · 制度的剥削';
                else if (path.includes('v4')) volume = '第四卷 · 个案的深度';
                else if (path.includes('v5')) volume = '第五卷 · 综合与反思';
                else if (path.includes('introduction')) volume = '导论';
                else if (path.includes('conclusion')) volume = '结论';

                return {
                    title: titleEl.textContent,
                    volume: volume
                };
            }

            return null;
        }
    }

    // 初始化
    window.RedBeautyAssistant = new RedBeautyAssistant();

})();
