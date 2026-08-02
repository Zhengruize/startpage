/* assets/js/script.js - 完整的JavaScript内容 */

// 默认链接数据 - 地区适应化适配
const defaultLinks = [
    { id: 1, name: 'GitHub 项目仓库', url: 'https://github.com/Zhengruize/startpage', icon: 'fas fa-network-wired' },
    { id: 2, name: '百度', url: 'https://www.baidu.com', icon: 'fas fa-search' },
    { id: 3, name: '淘宝', url: 'https://www.taobao.com', icon: 'fas fa-shopping-cart' },
    { id: 4, name: '京东', url: 'https://www.jd.com', icon: 'fas fa-shopping-bag' },
    { id: 5, name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'fas fa-play-circle' },
    { id: 6, name: '腾讯视频', url: 'https://v.qq.com', icon: 'fas fa-tv' },
    { id: 7, name: '微博', url: 'https://weibo.com', icon: 'fas fa-comments' },
    { id: 8, name: '知乎', url: 'https://www.zhihu.com', icon: 'fas fa-question-circle' },
    { id: 9, name: '网易云音乐', url: 'https://music.163.com', icon: 'fas fa-music' },
    { id: 10, name: '豆瓣', url: 'https://www.douban.com', icon: 'fas fa-film' },
    { id: 11, name: 'GitHub', url: 'https://www.github.com', icon: 'fas fa-code' },
    { id: 12, name: 'Deepseek', url: 'https://chat.deepseek.com/', icon: 'fas fa-robot' },
];

let links = [];
let originalLinks = [];
let isEditing = false;
let hasUserManuallySwitchedTheme = false;

// 高级设置相关变量
let versionClickCount = 0;
let versionClickTimeout = null;

// 高级设置相关变量
let advancedSettingsOriginalState = {};

// ===== 触屏设备检测 =====
const isTouchDevice = (() => {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0) ||
           (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
})();

// 自定义选择框功能
function initCustomSelects() {
    const customSelects = document.querySelectorAll('.custom-select');
    
    customSelects.forEach(selectContainer => {
        const selected = selectContainer.querySelector('.select-selected');
        const itemsContainer = selectContainer.querySelector('.select-items');
        
        // 选中项点击：打开/关闭下拉
        selected.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            const isOpening = itemsContainer.classList.contains('select-hide');
            this.classList.toggle('select-arrow-active');
            itemsContainer.classList.toggle('select-hide');
            
            if (isOpening) {
                // 把下拉框搬到 body 顶层，彻底脱离弹窗 transform 的层叠上下文
                const rect = this.getBoundingClientRect();
                selectContainer.setAttribute('data-dropdown-open', '');
                itemsContainer._ownerSelect = selectContainer;
                document.body.appendChild(itemsContainer);
                itemsContainer.style.position = 'fixed';
                itemsContainer.style.top = (rect.bottom + 6) + 'px';
                itemsContainer.style.left = rect.left + 'px';
                itemsContainer.style.width = rect.width + 'px';
                itemsContainer.style.zIndex = '99999';
                itemsContainer.style.marginTop = '0';
            } else {
                // 关闭时放回原位
                selectContainer.removeAttribute('data-dropdown-open');
                itemsContainer._ownerSelect = null;
                selectContainer.appendChild(itemsContainer);
                itemsContainer.style.cssText = '';
            }
        });
        
        // 点击选项
        itemsContainer.querySelectorAll('div').forEach(item => {
            item.addEventListener('click', function() {
                selected.textContent = this.textContent;
                const event = new Event('change', { bubbles: true });
                selectContainer.dispatchEvent(event);
                // 放回原位并关闭
                selectContainer.removeAttribute('data-dropdown-open');
                selectContainer.appendChild(itemsContainer);
                itemsContainer.style.cssText = '';
                closeAllSelect();
            });
        });
    });
    
    initOrderSelectors();
    document.addEventListener('click', closeAllSelect);
}

// 初始化排序选择器
function initOrderSelectors() {
    const orderSelectors = document.querySelectorAll('.order-selector-custom');
    
    orderSelectors.forEach(selector => {
        const selected = selector.querySelector('.order-selector-selected');
        const itemsContainer = selector.querySelector('.order-selector-items');
        
        // 点击选中项时显示/隐藏下拉列表
        selected.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllOrderSelectors(this);
            const isOpening = itemsContainer.classList.contains('order-selector-hide');
            this.classList.toggle('order-arrow-active');
            itemsContainer.classList.toggle('order-selector-hide');
            
            if (isOpening) {
                // 把下拉框搬到 body 顶层，彻底脱离弹窗 transform 的层叠上下文
                const rect = this.getBoundingClientRect();
                selector.setAttribute('data-order-dropdown-open', '');
                itemsContainer._orderOwner = selector;
                document.body.appendChild(itemsContainer);
                itemsContainer.style.position = 'fixed';
                itemsContainer.style.top = (rect.bottom + 4) + 'px';
                itemsContainer.style.left = rect.left + 'px';
                itemsContainer.style.width = rect.width + 'px';
                itemsContainer.style.zIndex = '99999';
                itemsContainer.style.marginTop = '0';
            } else {
                // 关闭时放回原位
                selector.removeAttribute('data-order-dropdown-open');
                itemsContainer._orderOwner = null;
                selector.appendChild(itemsContainer);
                itemsContainer.style.cssText = '';
            }
        });
        
        // 点击选项时更新选择
        itemsContainer.querySelectorAll('div').forEach(item => {
            item.addEventListener('click', function() {
                // 更新选中显示
                selected.textContent = this.textContent;
                
                // 触发change事件
                const event = new Event('change', { bubbles: true });
                selector.dispatchEvent(event);
                
                // 放回原位并关闭
                selector.removeAttribute('data-order-dropdown-open');
                selector.appendChild(itemsContainer);
                itemsContainer.style.cssText = '';
                
                // 关闭下拉列表
                closeAllOrderSelectors();
            });
        });
    });
}

function closeAllSelect(elmnt) {
    const selectItems = document.querySelectorAll('.select-items');
    const selectSelected = document.querySelectorAll('.select-selected');
    
    selectItems.forEach(item => {
        // 跳过当前正在操作的：通过 _ownerSelect 或 previousElementSibling 判断
        const owner = item._ownerSelect || (item.parentElement.classList && item.parentElement.classList.contains('custom-select') ? item.parentElement : null);
        const isExcluded = elmnt && owner && owner.querySelector('.select-selected') === elmnt;
        
        if (isExcluded) return;
        
        item.classList.add('select-hide');
        // 如果下拉框被移到了 body，放回原容器
        if (item.parentElement === document.body) {
            const bodyOwner = item._ownerSelect || document.querySelector('.custom-select[data-dropdown-open]');
            if (bodyOwner) {
                bodyOwner.appendChild(item);
                bodyOwner.removeAttribute('data-dropdown-open');
            }
        }
        item.style.cssText = '';
    });
    
    selectSelected.forEach(selected => {
        if (elmnt !== selected) {
            selected.classList.remove('select-arrow-active');
        }
    });
}

function closeAllOrderSelectors(elmnt) {
    const selectItems = document.querySelectorAll('.order-selector-items');
    const selectSelected = document.querySelectorAll('.order-selector-selected');
    
    selectItems.forEach(item => {
        // 跳过当前正在操作的：通过 _orderOwner 或 parentElement 判断
        const owner = item._orderOwner || (item.parentElement.classList && item.parentElement.classList.contains('order-selector-custom') ? item.parentElement : null);
        const isExcluded = elmnt && owner && owner.querySelector('.order-selector-selected') === elmnt;
        
        if (isExcluded) return;
        
        item.classList.add('order-selector-hide');
        // 如果下拉框被移到了 body，放回原容器
        if (item.parentElement === document.body) {
            const bodyOwner = item._orderOwner || document.querySelector('.order-selector-custom[data-order-dropdown-open]');
            if (bodyOwner) {
                bodyOwner.appendChild(item);
                bodyOwner.removeAttribute('data-order-dropdown-open');
            }
        }
        item.style.cssText = '';
    });
    
    selectSelected.forEach(selected => {
        if (elmnt !== selected) {
            selected.classList.remove('order-arrow-active');
        }
    });
}

// 获取自定义选择框的值
function getCustomSelectValue(containerId) {
    const container = document.getElementById(containerId);
    const selected = container.querySelector('.select-selected');
    const items = container.querySelectorAll('.select-items div');
    
    for (let item of items) {
        if (item.textContent === selected.textContent) {
            return item.getAttribute('data-value');
        }
    }
    return null;
}

// 设置自定义选择框的值
function setCustomSelectValue(containerId, value) {
    const container = document.getElementById(containerId);
    const selected = container.querySelector('.select-selected');
    const items = container.querySelectorAll('.select-items div');
    
    for (let item of items) {
        if (item.getAttribute('data-value') === value) {
            selected.textContent = item.textContent;
            break;
        }
    }
}

// 自定义对话框功能
class CustomDialog {
    constructor() {
        this.dialog = document.getElementById('customDialog');
        this.title = document.getElementById('dialogTitle');
        this.message = document.getElementById('dialogMessage');
        this.icon = document.getElementById('dialogIcon');
        this.confirmBtn = document.getElementById('dialogConfirmBtn');
        this.cancelBtn = document.getElementById('dialogCancelBtn');
        this.saveBtn = document.getElementById('dialogSaveBtn');
        
        this.confirmCallback = null;
        this.cancelCallback = null;
        this.saveCallback = null;
        
        this.init();
    }
    
    init() {
        this.confirmBtn.addEventListener('click', () => {
            this.hide();
            if (this.confirmCallback) this.confirmCallback();
        });
        
        this.cancelBtn.addEventListener('click', () => {
            this.hide();
            if (this.cancelCallback) this.cancelCallback();
        });
        
        this.saveBtn.addEventListener('click', () => {
            this.hide();
            if (this.saveCallback) this.saveCallback();
        });
        
        // 点击外部关闭对话框
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.hide();
                if (this.cancelCallback) this.cancelCallback();
            }
        });
    }
    
    show(options) {
        this.title.textContent = options.title || '提示';
        this.message.textContent = options.message || '';
        
        // 设置图标类型
        this.icon.className = 'dialog-icon';
        if (options.type === 'warning') {
            this.icon.classList.add('warning');
            this.icon.innerHTML = '<i class="fas fa-exclamation"></i>';
        } else if (options.type === 'error') {
            this.icon.classList.add('error');
            this.icon.innerHTML = '<i class="fas fa-times"></i>';
        } else if (options.type === 'info') {
            this.icon.classList.add('info');
            this.icon.innerHTML = '<i class="fas fa-info"></i>';
        } else {
            this.icon.classList.add('info');
            this.icon.innerHTML = '<i class="fas fa-info"></i>';
        }
        
        // 设置按钮文本
        this.confirmBtn.textContent = options.confirmText || '确定';
        this.cancelBtn.textContent = options.cancelText || '取消';
        this.saveBtn.textContent = options.saveText || '保存并退出';
        
        // 设置回调函数
        this.confirmCallback = options.onConfirm || null;
        this.cancelCallback = options.onCancel || null;
        this.saveCallback = options.onSave || null;
        
        // 显示/隐藏按钮
        if (options.showSaveButton) {
            this.saveBtn.style.display = 'block';
        } else {
            this.saveBtn.style.display = 'none';
        }
        
        if (!options.cancelText) {
            this.cancelBtn.style.display = 'none';
        } else {
            this.cancelBtn.style.display = 'block';
        }
        
        // 显示对话框
        this.dialog.classList.add('active');
    }
    
    hide() {
        // 添加淡出动画
        this.dialog.classList.add('fade-out');
        setTimeout(() => {
            this.dialog.classList.remove('active', 'fade-out');
            // 重置按钮显示状态
            this.cancelBtn.style.display = 'block';
            this.saveBtn.style.display = 'none';
        }, 300);
    }
    
    confirm(message, title = '确认') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'warning',
                confirmText: '确定',
                cancelText: '取消',
                showSaveButton: false,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
    
    alert(message, title = '提示') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'info',
                confirmText: '确定',
                cancelText: null,
                showSaveButton: false,
                onConfirm: () => resolve(true)
            });
        });
    }
    
    saveConfirm(message, title = '确认关闭') {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                type: 'warning',
                confirmText: '退出不保存',
                cancelText: '继续编辑',
                saveText: '保存并退出',
                showSaveButton: true,
                onConfirm: () => resolve('exit'),
                onCancel: () => resolve('cancel'),
                onSave: () => resolve('save')
            });
        });
    }
}

// 创建自定义对话框实例
const customDialog = new CustomDialog();

// 从本地存储加载链接
function loadLinksFromStorage() {
    const storedLinks = localStorage.getItem('customLinks');
    if (storedLinks) {
        links = JSON.parse(storedLinks);
        originalLinks = JSON.parse(JSON.stringify(links));
    } else {
        resetToDefaultLinks();
    }
}

// 重置为默认链接
function resetToDefaultLinks() {
    links = JSON.parse(JSON.stringify(defaultLinks));
    originalLinks = JSON.parse(JSON.stringify(defaultLinks));
    saveLinksToStorage();
    renderLinksGrid();
    if (document.getElementById('customizeModal').classList.contains('active')) {
        renderLinksList();
    }
}

// 保存链接到本地存储
function saveLinksToStorage() {
    localStorage.setItem('customLinks', JSON.stringify(links));
    originalLinks = JSON.parse(JSON.stringify(links));
    hideSaveCancelButtons();
}

// 渲染链接网格
function renderLinksGrid() {
    const linksGrid = document.getElementById('linksGrid');
    linksGrid.innerHTML = '';
    
    links.forEach(link => {
        const linkCard = document.createElement('a');
        linkCard.href = link.url;
        linkCard.className = 'link-card';
        linkCard.dataset.url = link.url;
        
        // 根据设置决定是否在新标签页打开
        const openInNewTab = localStorage.getItem('quickLinksOpenInNewTab') === 'true';
        if (openInNewTab) {
            linkCard.target = '_blank';
            linkCard.dataset.newTab = 'true';
        }
        
        linkCard.innerHTML = `
            <div class="link-icon">
                <i class="${link.icon}"></i>
            </div>
            <span class="link-name">${link.name}</span>
        `;
        
        linksGrid.appendChild(linkCard);
    });
    
    // 重新绑定 Dock 效果
    setupDockEffect();
}

// macOS Dock 风格放大镜效果（仅快捷卡片，触屏设备跳过悬停放大）
function setupDockEffect() {
    const linksGrid = document.getElementById('linksGrid');
    if (!linksGrid) return;
    
    const cards = linksGrid.querySelectorAll('.link-card');
    if (cards.length === 0) return;
    
    const container = document.querySelector('.container');
    if (!container) return;
    
    // ===== 鼠标悬停放大效果（触屏设备跳过） =====
    if (!isTouchDevice) {
        const maxScale = 1.3;
        const maxLift = -14;
        const iconMaxScale = 1.22;
        const innerIconMaxScale = 1.28;
        const radius = 180;
        const sigma = radius / 4.5;
        let rafId = null;
        
        function resetAll() {
            cards.forEach(card => {
                card.style.transform = '';
                card.classList.remove('dock-hover');
                const icon = card.querySelector('.link-icon');
                const innerIcon = icon ? icon.querySelector('i') : null;
                if (icon) icon.style.transform = '';
                if (innerIcon) innerIcon.style.transform = '';
            });
        }
        
        function updateCards(mouseX, mouseY, containerRect) {
            let closestCard = null;
            let closestDist = Infinity;
            
            cards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
                const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;
                
                const dx = mouseX - cardCenterX;
                const dy = mouseY - cardCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const influence = Math.exp(-(dist * dist) / (2 * sigma * sigma));
                const cardScale = 1 + (maxScale - 1) * influence;
                const lift = maxLift * influence;
                
                card.style.transform = `scale(${cardScale})`;
                
                const icon = card.querySelector('.link-icon');
                const innerIcon = icon ? icon.querySelector('i') : null;
                if (icon) {
                    const iconScale = 1 + (iconMaxScale - 1) * influence;
                    icon.style.transform = `translateY(${lift}px) scale(${iconScale})`;
                }
                if (innerIcon) {
                    const iScale = 1 + (innerIconMaxScale - 1) * influence;
                    innerIcon.style.transform = `scale(${iScale})`;
                }
                
                if (dist < closestDist) {
                    closestDist = dist;
                    closestCard = card;
                }
            });
            
            cards.forEach(card => {
                if (card === closestCard && closestDist < radius * 0.5) {
                    card.classList.add('dock-hover');
                } else {
                    card.classList.remove('dock-hover');
                }
            });
        }
        
        container.addEventListener('mousemove', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            const containerRect = container.getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;
            const mouseY = e.clientY - containerRect.top;
            rafId = requestAnimationFrame(() => {
                updateCards(mouseX, mouseY, containerRect);
            });
        });
        
        container.addEventListener('mouseleave', () => {
            if (rafId) cancelAnimationFrame(rafId);
            resetAll();
        });
        
        // 触摸设备标尺事件
        container.addEventListener('touchmove', (e) => {
            if (rafId) cancelAnimationFrame(rafId);
            const containerRect = container.getBoundingClientRect();
            const touchX = e.touches[0].clientX - containerRect.left;
            const touchY = e.touches[0].clientY - containerRect.top;
            rafId = requestAnimationFrame(() => {
                updateCards(touchX, touchY, containerRect);
            });
        }, { passive: true });
        
        container.addEventListener('touchend', () => {
            if (rafId) cancelAnimationFrame(rafId);
            resetAll();
        });
    }
    
    // 点击涟漪：光晕散开效果 + 延迟跳转（所有设备通用）
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.link-card');
        if (!card) return;
        
        // 阻止默认跳转，先让动画播放
        e.preventDefault();
        
        const ripple = document.createElement('span');
        ripple.className = 'dock-ripple';
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.5;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        card.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
        
        // 延迟 400ms 后跳转，让用户看到光晕散开的动画
        const url = card.dataset.url || card.href;
        const openInNewTab = card.dataset.newTab === 'true';
        setTimeout(() => {
            if (openInNewTab) {
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = url;
            }
        }, 200);
    });
    
    // ===== 全局光标光晕 =====
    setupGlobalCursorGlow();
}

// 全局光标光晕：鼠标在哪，光晕跟随到哪（仅暗色模式下生效，触屏设备跳过）
function setupGlobalCursorGlow() {
    // 触屏设备没有鼠标，不需要光晕
    if (isTouchDevice) return;
    
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    
    let rafId = null;
    
    function updateGlow(x, y) {
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
    }
    
    document.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            updateGlow(e.clientX, e.clientY);
        });
    });
    
    // 鼠标离开页面时隐藏光晕
    document.addEventListener('mouseleave', () => {
        glow.classList.add('glow-hidden');
    });
    
    // 鼠标进入页面时显示光晕
    document.addEventListener('mouseenter', () => {
        glow.classList.remove('glow-hidden');
    });
}

// 渲染链接列表（在模态框中）
function renderLinksList() {
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';
    
    links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.dataset.id = link.id;
        linkItem.dataset.index = index;
        
        // 创建自定义排序选择器
        const orderSelector = document.createElement('div');
        orderSelector.className = 'order-selector-custom';
        
        // 创建选项
        const orderItems = document.createElement('div');
        orderItems.className = 'order-selector-items order-selector-hide';
        
        // 填充选项
        for (let i = 1; i <= links.length; i++) {
            const item = document.createElement('div');
            item.textContent = i;
            orderItems.appendChild(item);
        }
        
        // 创建选中显示
        const orderSelected = document.createElement('div');
        orderSelected.className = 'order-selector-selected';
        orderSelected.textContent = index + 1;
        
        // 组装排序选择器
        orderSelector.appendChild(orderSelected);
        orderSelector.appendChild(orderItems);
        
        // 添加排序选择器变化事件
        orderSelector.addEventListener('change', function() {
            const newPosition = parseInt(orderSelected.textContent) - 1;
            const currentIndex = index;
            
            if (newPosition !== currentIndex) {
                // 移动链接到新位置
                const [movedLink] = links.splice(currentIndex, 1);
                links.splice(newPosition, 0, movedLink);
                
                // 重新渲染列表
                renderLinksList();
                showSaveCancelButtons();
            }
        });
        
        linkItem.innerHTML = `
            <div class="link-info">
                <div class="link-name-small">${link.name}</div>
            </div>
            <div class="link-actions">
                <button class="btn btn-icon btn-edit edit-link">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-delete delete-link">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 在链接信息前插入排序选择器
        linkItem.querySelector('.link-info').prepend(orderSelector);
        linksList.appendChild(linkItem);
    });
    
    // 初始化排序选择器
    initOrderSelectors();
    
    // 编辑链接按钮事件
    document.querySelectorAll('.edit-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const linkId = parseInt(this.closest('.link-item').dataset.id);
            const link = links.find(l => l.id === linkId);
            
            document.getElementById('linkName').value = link.name;
            document.getElementById('linkUrl').value = link.url;
            setCustomSelectValue('linkIconContainer', link.icon);
            updateIconPreview();
            
            document.getElementById('addLinkBtn').dataset.editingId = linkId;
            document.getElementById('addLinkBtn').textContent = '更新网站';
            document.getElementById('addLinkModalTitle').textContent = '编辑网站';
            
            // 显示子模态框
            document.getElementById('addLinkModal').classList.add('active');
            
            // 标记为编辑状态
            isEditing = true;
        });
    });
    
    // 删除链接按钮事件
    document.querySelectorAll('.delete-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const linkId = parseInt(this.closest('.link-item').dataset.id);
            
            customDialog.confirm(`确定要删除"${links.find(l => l.id === linkId).name}"吗？`, '删除网站')
                .then(result => {
                    if (result) {
                        links = links.filter(link => link.id !== linkId);
                        renderLinksList();
                        showSaveCancelButtons();
                    }
                });
        });
    });
}

// 显示保存和取消按钮
function showSaveCancelButtons() {
    document.getElementById('saveCancelButtons').style.display = 'flex';
}

// 隐藏保存和取消按钮
function hideSaveCancelButtons() {
    document.getElementById('saveCancelButtons').style.display = 'none';
}

// 检查是否有更改
function hasChanges() {
    return JSON.stringify(links) !== JSON.stringify(originalLinks);
}

// 更新图标预览
function updateIconPreview() {
    const iconValue = getCustomSelectValue('linkIconContainer');
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.innerHTML = `<i class="${iconValue}"></i>`;
}

// 优化的风力描述翻译
function getWindLevel(windSpeed) {
    if (windSpeed < 1) return "无风 (0级)";
    if (windSpeed <= 5) return "软风 (1级)";
    if (windSpeed <= 11) return "轻风 (2级)";
    if (windSpeed <= 19) return "微风 (3级)";
    if (windSpeed <= 28) return "和风 (4级)";
    if (windSpeed <= 38) return "清风 (5级)";
    if (windSpeed <= 49) return "强风 (6级)";
    if (windSpeed <= 61) return "疾风 (7级)";
    if (windSpeed <= 74) return "大风 (8级)";
    if (windSpeed <= 88) return "烈风 (9级)";
    if (windSpeed <= 102) return "狂风 (10级)";
    if (windSpeed <= 117) return "暴风 (11级)";
    return "飓风 (12级)";
}

// URL格式验证函数 - 取消特殊豁免
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// 加载主题设置
function loadThemeFromStorage() {
    const storedTheme = localStorage.getItem('theme');
    const systemThemeEnabled = localStorage.getItem('systemTheme') === 'true';
    
    // 如果启用了跟随系统主题，则根据系统主题设置
    if (systemThemeEnabled) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            document.getElementById('darkModeToggle').checked = true;
        } else {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            document.getElementById('darkModeToggle').checked = false;
        }
    } else {
        // 否则使用用户保存的主题设置
        if (storedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            document.getElementById('darkModeToggle').checked = true;
        } else {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            document.getElementById('darkModeToggle').checked = false;
        }
    }
    
    // 检查用户是否手动切换过主题
    hasUserManuallySwitchedTheme = localStorage.getItem('userManuallySwitchedTheme') === 'true';
}

// 保存主题设置
function saveThemeToStorage() {
    const currentTheme = document.body.getAttribute('data-theme');
    localStorage.setItem('theme', currentTheme || 'light');
}

// 设置主题切换功能
function setupThemeSwitching() {
    const systemThemeToggle = document.getElementById('systemThemeToggle');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // 标志位：防止 loadSettings 等程序化设置触发 change 事件
    let isProgrammaticThemeChange = false;
    
    // 监听系统主题变化
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function handleSystemThemeChange(e) {
        const systemThemeEnabled = localStorage.getItem('systemTheme') === 'true';
        
        // 如果开启了跟随系统主题
        if (systemThemeEnabled) {
            if (e.matches) {
                // 系统切换到深色模式
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                darkModeToggle.checked = true;
                saveThemeToStorage();
            } else {
                // 系统切换到浅色模式
                document.body.removeAttribute('data-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                darkModeToggle.checked = false;
                saveThemeToStorage();
            }
        }
    }
    
    // 初始化监听
    darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // 系统主题开关事件
    systemThemeToggle.addEventListener('change', () => {
        localStorage.setItem('systemTheme', systemThemeToggle.checked);
        
        if (systemThemeToggle.checked) {
            // 标记用户已启用系统主题跟随
            hasUserManuallySwitchedTheme = false;
            localStorage.setItem('userManuallySwitchedTheme', 'false');
            
            // 立即应用系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                darkModeToggle.checked = true;
            } else {
                document.body.removeAttribute('data-theme');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                darkModeToggle.checked = false;
            }
            saveThemeToStorage();
        } else {
            // 禁用系统主题跟随，保持当前视觉状态，仅解除锁定
            localStorage.setItem('userManuallySwitchedTheme', 'false');
        }
    });
    
    // 深色模式开关事件
    darkModeToggle.addEventListener('change', () => {
        // 如果是程序化设置（如 loadSettings），跳过处理
        if (isProgrammaticThemeChange) return;
        
        // 手动切换时自动关闭跟随系统主题
        localStorage.setItem('systemTheme', 'false');
        if (systemThemeToggle) systemThemeToggle.checked = false;
        
        hasUserManuallySwitchedTheme = true;
        localStorage.setItem('userManuallySwitchedTheme', 'true');
        
        if (darkModeToggle.checked) {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        saveThemeToStorage();
    });
    
    // 手动主题切换按钮事件
    themeToggle.addEventListener('click', () => {
        // 手动切换时自动关闭跟随系统主题
        localStorage.setItem('systemTheme', 'false');
        if (systemThemeToggle) systemThemeToggle.checked = false;
        
        hasUserManuallySwitchedTheme = true;
        localStorage.setItem('userManuallySwitchedTheme', 'true');
        
        const currentTheme = document.body.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            darkModeToggle.checked = false;
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            darkModeToggle.checked = true;
        }
        
        saveThemeToStorage();
    });
    
    // 暴露程序化设置主题的方法（供 loadSettings 使用）
    window._setDarkModeToggleProgrammatic = function(checked) {
        isProgrammaticThemeChange = true;
        darkModeToggle.checked = checked;
        isProgrammaticThemeChange = false;
    };
    
    // 初始检查系统主题
    handleSystemThemeChange(darkModeMediaQuery);
    
    // 光晕开关事件
    const glowLightToggle = document.getElementById('glowLightToggle');
    const glowDarkToggle = document.getElementById('glowDarkToggle');
    
    glowLightToggle.addEventListener('change', () => {
        localStorage.setItem('glowLight', glowLightToggle.checked);
        applyGlowSettings();
    });
    
    glowDarkToggle.addEventListener('change', () => {
        localStorage.setItem('glowDark', glowDarkToggle.checked);
        applyGlowSettings();
    });
    
    // 玻璃效果开关
    const glassEffectToggle = document.getElementById('glassEffectToggle');
    glassEffectToggle.addEventListener('change', () => {
        localStorage.setItem('glassEffect', glassEffectToggle.checked);
        applyGlassSettings();
    });
}

// 时间更新功能
function updateTime() {
    const now = new Date();
    
    const timeElement = document.getElementById('currentTime');
    timeElement.textContent = now.toLocaleTimeString('zh-CN');
    
    const dateElement = document.getElementById('currentDate');
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateElement.textContent = now.toLocaleDateString('zh-CN', options);
}

// 获取天气信息
async function getWeather() {
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherDetails = document.getElementById('weatherDetails');
    const locationText = document.getElementById('locationText');
    
    // 获取设置的位置
    const locationValue = localStorage.getItem('weatherLocation') || '34.2612,108.9423';
    const [latitude, longitude] = locationValue.split(',').map(Number);
    
    // 更新位置显示
    const locationContainer = document.getElementById('locationSelectContainer');
    const selectedOption = locationContainer.querySelector('.select-selected');
    locationText.textContent = `${selectedOption.textContent}, 中国`;
    
    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('天气数据获取失败');
        }
        
        const weatherData = await weatherResponse.json();
        
        const currentWeather = weatherData.current_weather;
        weatherTemp.textContent = `${Math.round(currentWeather.temperature)}°C`;
        
        const weatherDescriptions = {
            0: '晴朗',
            1: '晴',
            2: '少云',
            3: '多云',
            45: '雾',
            48: '雾',
            51: '毛毛雨',
            53: '毛毛雨',
            55: '毛毛雨',
            56: '冻毛毛雨',
            57: '冻毛毛雨',
            61: '小雨',
            63: '中雨',
            65: '大雨',
            66: '冻雨',
            67: '冻雨',
            71: '小雪',
            73: '中雪',
            75: '大雪',
            77: '雪粒',
            80: '阵雨',
            81: '阵雨',
            82: '强阵雨',
            85: '阵雪',
            86: '阵雪',
            95: '雷暴',
            96: '雷暴',
            99: '雷暴',
        };
        
        const weatherDesc = weatherDescriptions[currentWeather.weathercode] || '未知';
        const windLevel = getWindLevel(currentWeather.windspeed);
        
        weatherDetails.innerHTML = `
            <div>${weatherDesc}</div>
            <div>${windLevel}</div>
            <div>风向: ${currentWeather.winddirection}°</div>
        `;
        
    } catch (error) {
        console.error('获取天气失败:', error);
        weatherTemp.textContent = '--°C';
        weatherDetails.innerHTML = '<div>天气数据获取失败</div>';
    }
}

// 模态框功能
const settingsToggle = document.getElementById('settingsToggle');
const customizeModal = document.getElementById('customizeModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addBtn = document.getElementById('addBtn');
const resetLinksBtn = document.getElementById('resetLinksBtn');
const saveBtn = document.getElementById('saveBtn');

const addLinkModal = document.getElementById('addLinkModal');
const closeAddLinkModal = document.getElementById('closeAddLinkModal');
const addLinkBtn = document.getElementById('addLinkBtn');
const backFromAddLinkBtn = document.getElementById('backFromAddLinkBtn');
const linkIconContainer = document.getElementById('linkIconContainer');

// 图标选择器变化时更新预览
linkIconContainer.addEventListener('change', updateIconPreview);

// 设置相关元素
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const openCustomizeBtnInSection = document.getElementById('openCustomizeBtnInSection');
const openCustomizeBtn = document.getElementById('openCustomizeBtn');

// 高级设置相关元素
const advancedSettingsModal = document.getElementById('advancedSettingsModal');
const closeAdvancedSettingsModal = document.getElementById('closeAdvancedSettingsModal');
const saveAdvancedSettingsBtn = document.getElementById('saveAdvancedSettingsBtn');
const cancelAdvancedSettingsBtn = document.getElementById('cancelAdvancedSettingsBtn');
const resetAdvancedSettingsBtn = document.getElementById('resetAdvancedSettingsBtn');

// 关于相关元素
const aboutBtn = document.getElementById('aboutBtn');
const aboutModal = document.getElementById('aboutModal');
const closeAboutModal = document.getElementById('closeAboutModal');
const backFromAboutBtn = document.getElementById('backFromAboutBtn');
const versionNumber = document.getElementById('versionNumber');

// 圆角控制按钮
const dialogBorderRadiusDecrease = document.getElementById('dialogBorderRadiusDecrease');
const dialogBorderRadiusIncrease = document.getElementById('dialogBorderRadiusIncrease');
const dialogBorderRadiusValue = document.getElementById('dialogBorderRadiusValue');

const selectBorderRadiusDecrease = document.getElementById('selectBorderRadiusDecrease');
const selectBorderRadiusIncrease = document.getElementById('selectBorderRadiusIncrease');
const selectBorderRadiusValue = document.getElementById('selectBorderRadiusValue');

const inputBorderRadiusDecrease = document.getElementById('inputBorderRadiusDecrease');
const inputBorderRadiusIncrease = document.getElementById('inputBorderRadiusIncrease');
const inputBorderRadiusValue = document.getElementById('inputBorderRadiusValue');

const buttonBorderRadiusDecrease = document.getElementById('buttonBorderRadiusDecrease');
const buttonBorderRadiusIncrease = document.getElementById('buttonBorderRadiusIncrease');
const buttonBorderRadiusValue = document.getElementById('buttonBorderRadiusValue');

const cardBorderRadiusDecrease = document.getElementById('cardBorderRadiusDecrease');
const cardBorderRadiusIncrease = document.getElementById('cardBorderRadiusIncrease');
const cardBorderRadiusValue = document.getElementById('cardBorderRadiusValue');

const iconBorderRadiusDecrease = document.getElementById('iconBorderRadiusDecrease');
const iconBorderRadiusIncrease = document.getElementById('iconBorderRadiusIncrease');
const iconBorderRadiusValue = document.getElementById('iconBorderRadiusValue');

// 天气更新间隔控制按钮
const weatherUpdateIntervalDecrease = document.getElementById('weatherUpdateIntervalDecrease');
const weatherUpdateIntervalIncrease = document.getElementById('weatherUpdateIntervalIncrease');
const weatherUpdateIntervalValue = document.getElementById('weatherUpdateIntervalValue');

// 卡片显示控制开关
const showTimeCardToggle = document.getElementById('showTimeCardToggle');
const showWeatherCardToggle = document.getElementById('showWeatherCardToggle');

// 天气卡片跳转（带光晕散开效果）
const weatherWidget = document.getElementById('weatherWidget');
weatherWidget.addEventListener('click', (e) => {
    // 添加涟漪效果
    const ripple = document.createElement('span');
    ripple.className = 'dock-ripple';
    const rect = weatherWidget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.5;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    weatherWidget.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
    
    const weatherCardUrl = localStorage.getItem('weatherCardUrl') || 'https://www.weather.com.cn/weathern/101110101.shtml';
    const openInNewTab = localStorage.getItem('searchOpenInNewTab') === 'true';
    setTimeout(() => {
        if (openInNewTab) {
            window.open(weatherCardUrl, '_blank');
        } else {
            window.location.href = weatherCardUrl;
        }
    }, 200);
});

// 时间卡片跳转（带光晕散开效果）
const timeWidget = document.getElementById('timeWidget');
timeWidget.addEventListener('click', (e) => {
    // 添加涟漪效果
    const ripple = document.createElement('span');
    ripple.className = 'dock-ripple';
    const rect = timeWidget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.5;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    timeWidget.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
    
    const timeCardUrl = localStorage.getItem('timeCardUrl') || 'https://time.is/';
    const openInNewTab = localStorage.getItem('searchOpenInNewTab') === 'true';
    setTimeout(() => {
        if (openInNewTab) {
            window.open(timeCardUrl, '_blank');
        } else {
            window.location.href = timeCardUrl;
        }
    }, 200);
});

// 设置图标点击事件
settingsToggle.addEventListener('click', () => {
    settingsModal.classList.add('active');
    loadSettings();
});

// 版本号点击计数器（用于打开高级设置）
versionNumber.addEventListener('click', () => {
    versionClickCount++;
    
    // 清除之前的超时
    if (versionClickTimeout) {
        clearTimeout(versionClickTimeout);
    }
    
    // 设置新的超时（2秒内连续点击）
    versionClickTimeout = setTimeout(() => {
        versionClickCount = 0;
    }, 2000);
    
    // 如果点击次数达到10次，打开高级设置
    if (versionClickCount >= 10) {
        versionClickCount = 0;
        openAdvancedSettings();
    }
});

// 打开高级设置
function openAdvancedSettings() {
    aboutModal.classList.remove('active');
    advancedSettingsModal.classList.add('active');
    loadAdvancedSettings();
}

// 关闭模态框函数
function closeModalWithAnimation(modal) {
    modal.classList.add('fade-out');
    setTimeout(() => {
        modal.classList.remove('active', 'fade-out');
        // 关闭自定义链接对话框时，同时关闭二级添加对话框
        if (modal === customizeModal) {
            addLinkModal.classList.remove('active', 'fade-out');
        }
    }, 300);
}

closeModal.addEventListener('click', () => {
    if (hasChanges()) {
        customDialog.saveConfirm('您有未保存的更改，确定要关闭吗？', '确认关闭')
            .then(result => {
                if (result === 'save') {
                    saveLinksToStorage();
                    renderLinksGrid();
                    closeModalWithAnimation(customizeModal);
                } else if (result === 'exit') {
                    closeModalWithAnimation(customizeModal);
                    loadLinksFromStorage();
                    renderLinksGrid();
                    hideSaveCancelButtons();
                }
                // 如果result是'cancel'，则不做任何操作，保持对话框打开
            });
    } else {
        closeModalWithAnimation(customizeModal);
    }
});

cancelBtn.addEventListener('click', () => {
    if (hasChanges()) {
        customDialog.saveConfirm('您有未保存的更改，确定要取消吗？', '确认取消')
            .then(result => {
                if (result === 'save') {
                    saveLinksToStorage();
                    renderLinksGrid();
                    closeModalWithAnimation(customizeModal);
                } else if (result === 'exit') {
                    links = JSON.parse(JSON.stringify(originalLinks));
                    renderLinksGrid();
                    closeModalWithAnimation(customizeModal);
                    hideSaveCancelButtons();
                }
                // 如果result是'cancel'，则不做任何操作，保持对话框打开
            });
    } else {
        closeModalWithAnimation(customizeModal);
    }
});

// 恢复默认按钮
resetLinksBtn.addEventListener('click', () => {
    customDialog.confirm('确定要恢复默认网站列表吗？这将丢失所有自定义设置。', '恢复默认设置')
        .then(result => {
            if (result) {
                resetToDefaultLinks();
                // 因为resetToDefaultLinks中已经调用了saveLinksToStorage，所以已经保存了，应该隐藏保存和取消按钮
                hideSaveCancelButtons();
            }
        });
});

saveBtn.addEventListener('click', () => {
    saveLinksToStorage();
    renderLinksGrid();
    closeModalWithAnimation(customizeModal);
});

closeAddLinkModal.addEventListener('click', () => {
    closeModalWithAnimation(addLinkModal);
    resetForm();
    // 如果是编辑状态但没有实际修改，不显示保存按钮
    if (isEditing && !hasChanges()) {
        hideSaveCancelButtons();
    }
    isEditing = false;
});

// 返回按钮事件
backFromAddLinkBtn.addEventListener('click', () => {
    closeModalWithAnimation(addLinkModal);
    resetForm();
    // 如果是编辑状态但没有实际修改，不显示保存按钮
    if (isEditing && !hasChanges()) {
        hideSaveCancelButtons();
    }
    isEditing = false;
});

// 设置对话框功能
closeSettingsModal.addEventListener('click', () => {
    closeModalWithAnimation(settingsModal);
});

// 高级设置对话框功能
closeAdvancedSettingsModal.addEventListener('click', () => {
    closeModalWithAnimation(advancedSettingsModal);
});

cancelAdvancedSettingsBtn.addEventListener('click', () => {
    closeModalWithAnimation(advancedSettingsModal);
});

saveAdvancedSettingsBtn.addEventListener('click', () => {
    saveAdvancedSettings();
    closeModalWithAnimation(advancedSettingsModal);
});

resetAdvancedSettingsBtn.addEventListener('click', () => {
    customDialog.confirm('确定要恢复所有高级设置为默认值吗？', '恢复默认设置')
        .then(result => {
            if (result) {
                resetAdvancedSettings();
                loadAdvancedSettings();
            }
        });
});

// 高级设置：切换开关右边标签实时更新
document.getElementById('searchOpenInNewTabToggle').addEventListener('change', function() {
    document.getElementById('searchOpenModeLabel').textContent = this.checked ? '新标签页' : '当前页面';
});
document.getElementById('quickLinksOpenInNewTabToggle').addEventListener('change', function() {
    document.getElementById('quickLinksOpenModeLabel').textContent = this.checked ? '新标签页' : '当前页面';
});

// 关于对话框功能 - 使用新样式
aboutBtn.addEventListener('click', () => {
    aboutModal.classList.add('active');
});

closeAboutModal.addEventListener('click', () => {
    aboutModal.classList.remove('active');
});

backFromAboutBtn.addEventListener('click', () => {
    aboutModal.classList.remove('active');
});

// 圆角控制功能
function setupBorderRadiusControls() {
    // 对话框圆角控制
    dialogBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(dialogBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            dialogBorderRadiusValue.textContent = value;
        }
    });
    
    dialogBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(dialogBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            dialogBorderRadiusValue.textContent = value;
        }
    });
    
    // 选择框圆角控制
    selectBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(selectBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            selectBorderRadiusValue.textContent = value;
        }
    });
    
    selectBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(selectBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            selectBorderRadiusValue.textContent = value;
        }
    });
    
    // 输入框圆角控制
    inputBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(inputBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            inputBorderRadiusValue.textContent = value;
        }
    });
    
    inputBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(inputBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            inputBorderRadiusValue.textContent = value;
        }
    });
    
    // 按钮圆角控制
    buttonBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(buttonBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            buttonBorderRadiusValue.textContent = value;
        }
    });
    
    buttonBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(buttonBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            buttonBorderRadiusValue.textContent = value;
        }
    });
    
    // 卡片圆角控制
    cardBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(cardBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            cardBorderRadiusValue.textContent = value;
        }
    });
    
    cardBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(cardBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            cardBorderRadiusValue.textContent = value;
        }
    });
    
    // 图标圆角控制
    iconBorderRadiusDecrease.addEventListener('click', () => {
        let value = parseInt(iconBorderRadiusValue.textContent);
        if (value > 0) {
            value--;
            iconBorderRadiusValue.textContent = value;
        }
    });
    
    iconBorderRadiusIncrease.addEventListener('click', () => {
        let value = parseInt(iconBorderRadiusValue.textContent);
        if (value < 50) {
            value++;
            iconBorderRadiusValue.textContent = value;
        }
    });
    
    // 天气更新间隔控制
    weatherUpdateIntervalDecrease.addEventListener('click', () => {
        let value = parseInt(weatherUpdateIntervalValue.textContent);
        if (value > 1) {
            value--;
            weatherUpdateIntervalValue.textContent = value;
        }
    });
    
    weatherUpdateIntervalIncrease.addEventListener('click', () => {
        let value = parseInt(weatherUpdateIntervalValue.textContent);
        if (value < 60) {
            value++;
            weatherUpdateIntervalValue.textContent = value;
        }
    });
}

// 加载设置
function loadSettings() {
    const searchEngine = localStorage.getItem('searchEngine') || 'baidu';
    setCustomSelectValue('searchEngineContainer', searchEngine);
    
    const darkMode = localStorage.getItem('theme') === 'dark';
    // 使用程序化设置方法，避免触发 change 事件导致 systemTheme 被意外关闭
    if (window._setDarkModeToggleProgrammatic) {
        window._setDarkModeToggleProgrammatic(darkMode);
    } else {
        document.getElementById('darkModeToggle').checked = darkMode;
    }
    
    const systemTheme = localStorage.getItem('systemTheme') === 'true';
    document.getElementById('systemThemeToggle').checked = systemTheme;
    
    const location = localStorage.getItem('weatherLocation') || '34.2612,108.9423';
    setCustomSelectValue('locationSelectContainer', location);
    
    // 光晕设置
    const glowLight = localStorage.getItem('glowLight') === 'true';
    document.getElementById('glowLightToggle').checked = glowLight;
    
    const glowDark = localStorage.getItem('glowDark') !== 'false';
    document.getElementById('glowDarkToggle').checked = glowDark;
    
    applyGlowSettings();
    
    // 玻璃效果设置
    const glassEffect = localStorage.getItem('glassEffect') !== 'false';
    document.getElementById('glassEffectToggle').checked = glassEffect;
    applyGlassSettings();
}

// 加载高级设置
function loadAdvancedSettings() {
    // 打开方式设置
    const searchOpenInNewTab = localStorage.getItem('searchOpenInNewTab') === 'true';
    document.getElementById('searchOpenInNewTabToggle').checked = searchOpenInNewTab;
    document.getElementById('searchOpenModeLabel').textContent = searchOpenInNewTab ? '新标签页' : '当前页面';
    
    const quickLinksOpenInNewTab = localStorage.getItem('quickLinksOpenInNewTab') === 'true';
    document.getElementById('quickLinksOpenInNewTabToggle').checked = quickLinksOpenInNewTab;
    document.getElementById('quickLinksOpenModeLabel').textContent = quickLinksOpenInNewTab ? '新标签页' : '当前页面';
    
    // 卡片跳转网址
    const weatherCardUrl = localStorage.getItem('weatherCardUrl') || 'https://www.weather.com.cn/weathern/101110101.shtml';
    document.getElementById('weatherCardUrl').value = weatherCardUrl;
    
    const timeCardUrl = localStorage.getItem('timeCardUrl') || 'https://time.is/';
    document.getElementById('timeCardUrl').value = timeCardUrl;
    
    // 圆角大小 - 细分设置
    const dialogBorderRadius = localStorage.getItem('dialogBorderRadius') || '20';
    dialogBorderRadiusValue.textContent = dialogBorderRadius;
    
    const selectBorderRadius = localStorage.getItem('selectBorderRadius') || '16';
    selectBorderRadiusValue.textContent = selectBorderRadius;
    
    const inputBorderRadius = localStorage.getItem('inputBorderRadius') || '16';
    inputBorderRadiusValue.textContent = inputBorderRadius;
    
    const buttonBorderRadius = localStorage.getItem('buttonBorderRadius') || '20';
    buttonBorderRadiusValue.textContent = buttonBorderRadius;
    
    const cardBorderRadius = localStorage.getItem('cardBorderRadius') || '20';
    cardBorderRadiusValue.textContent = cardBorderRadius;
    
    // 图标圆角
    const iconBorderRadius = localStorage.getItem('iconBorderRadius') || '50';
    iconBorderRadiusValue.textContent = iconBorderRadius;
    
    // 卡片显示设置
    const showTimeCard = localStorage.getItem('showTimeCard') !== 'false';
    document.getElementById('showTimeCardToggle').checked = showTimeCard;
    
    const showWeatherCard = localStorage.getItem('showWeatherCard') !== 'false';
    document.getElementById('showWeatherCardToggle').checked = showWeatherCard;
    
    // 应用卡片显示设置
    applyCardVisibility();
    
    // 天气更新间隔
    const weatherUpdateInterval = localStorage.getItem('weatherUpdateInterval') || '2';
    weatherUpdateIntervalValue.textContent = weatherUpdateInterval;
    
    // 数据源设置
    const weatherSource = localStorage.getItem('weatherSource') || 'open-meteo';
    setCustomSelectValue('weatherSourceContainer', weatherSource);
    
    const timeSource = localStorage.getItem('timeSource') || 'local';
    setCustomSelectValue('timeSourceContainer', timeSource);
    
    // 保存原始状态用于比较
    saveAdvancedSettingsOriginalState();
}

// 保存高级设置原始状态
function saveAdvancedSettingsOriginalState() {
    advancedSettingsOriginalState = {
        searchOpenInNewTab: document.getElementById('searchOpenInNewTabToggle').checked,
        quickLinksOpenInNewTab: document.getElementById('quickLinksOpenInNewTabToggle').checked,
        weatherCardUrl: document.getElementById('weatherCardUrl').value,
        timeCardUrl: document.getElementById('timeCardUrl').value,
        dialogBorderRadius: dialogBorderRadiusValue.textContent,
        selectBorderRadius: selectBorderRadiusValue.textContent,
        inputBorderRadius: inputBorderRadiusValue.textContent,
        buttonBorderRadius: buttonBorderRadiusValue.textContent,
        cardBorderRadius: cardBorderRadiusValue.textContent,
        iconBorderRadius: iconBorderRadiusValue.textContent,
        showTimeCard: document.getElementById('showTimeCardToggle').checked,
        showWeatherCard: document.getElementById('showWeatherCardToggle').checked,
        weatherUpdateInterval: weatherUpdateIntervalValue.textContent,
        weatherSource: getCustomSelectValue('weatherSourceContainer'),
        timeSource: getCustomSelectValue('timeSourceContainer')
    };
}

// 检查高级设置是否有更改
function hasAdvancedSettingsChanges() {
    const currentState = {
        searchOpenInNewTab: document.getElementById('searchOpenInNewTabToggle').checked,
        quickLinksOpenInNewTab: document.getElementById('quickLinksOpenInNewTabToggle').checked,
        weatherCardUrl: document.getElementById('weatherCardUrl').value,
        timeCardUrl: document.getElementById('timeCardUrl').value,
        dialogBorderRadius: dialogBorderRadiusValue.textContent,
        selectBorderRadius: selectBorderRadiusValue.textContent,
        inputBorderRadius: inputBorderRadiusValue.textContent,
        buttonBorderRadius: buttonBorderRadiusValue.textContent,
        cardBorderRadius: cardBorderRadiusValue.textContent,
        iconBorderRadius: iconBorderRadiusValue.textContent,
        showTimeCard: document.getElementById('showTimeCardToggle').checked,
        showWeatherCard: document.getElementById('showWeatherCardToggle').checked,
        weatherUpdateInterval: weatherUpdateIntervalValue.textContent,
        weatherSource: getCustomSelectValue('weatherSourceContainer'),
        timeSource: getCustomSelectValue('timeSourceContainer')
    };
    
    return JSON.stringify(currentState) !== JSON.stringify(advancedSettingsOriginalState);
}

// 保存高级设置
function saveAdvancedSettings() {
    // 打开方式设置
    const searchOpenInNewTab = document.getElementById('searchOpenInNewTabToggle').checked;
    localStorage.setItem('searchOpenInNewTab', searchOpenInNewTab);
    
    const quickLinksOpenInNewTab = document.getElementById('quickLinksOpenInNewTabToggle').checked;
    localStorage.setItem('quickLinksOpenInNewTab', quickLinksOpenInNewTab);
    
    // 卡片跳转网址
    const weatherCardUrl = document.getElementById('weatherCardUrl').value.trim();
    if (weatherCardUrl && isValidUrl(weatherCardUrl)) {
        localStorage.setItem('weatherCardUrl', weatherCardUrl);
    }
    
    const timeCardUrl = document.getElementById('timeCardUrl').value.trim();
    if (timeCardUrl && isValidUrl(timeCardUrl)) {
        localStorage.setItem('timeCardUrl', timeCardUrl);
    }
    
    // 圆角大小 - 细分设置
    const dialogBorderRadius = dialogBorderRadiusValue.textContent;
    if (dialogBorderRadius >= 0 && dialogBorderRadius <= 50) {
        localStorage.setItem('dialogBorderRadius', dialogBorderRadius);
    }
    
    const selectBorderRadius = selectBorderRadiusValue.textContent;
    if (selectBorderRadius >= 0 && selectBorderRadius <= 50) {
        localStorage.setItem('selectBorderRadius', selectBorderRadius);
    }
    
    const inputBorderRadius = inputBorderRadiusValue.textContent;
    if (inputBorderRadius >= 0 && inputBorderRadius <= 50) {
        localStorage.setItem('inputBorderRadius', inputBorderRadius);
    }
    
    const buttonBorderRadius = buttonBorderRadiusValue.textContent;
    if (buttonBorderRadius >= 0 && buttonBorderRadius <= 50) {
        localStorage.setItem('buttonBorderRadius', buttonBorderRadius);
    }
    
    const cardBorderRadius = cardBorderRadiusValue.textContent;
    if (cardBorderRadius >= 0 && cardBorderRadius <= 50) {
        localStorage.setItem('cardBorderRadius', cardBorderRadius);
    }
    
    // 图标圆角
    const iconBorderRadius = iconBorderRadiusValue.textContent;
    if (iconBorderRadius >= 0 && iconBorderRadius <= 50) {
        localStorage.setItem('iconBorderRadius', iconBorderRadius);
    }
    
    // 应用所有圆角设置
    applyAllBorderRadius();
    
    // 卡片显示设置
    const showTimeCard = document.getElementById('showTimeCardToggle').checked;
    localStorage.setItem('showTimeCard', showTimeCard);
    
    const showWeatherCard = document.getElementById('showWeatherCardToggle').checked;
    localStorage.setItem('showWeatherCard', showWeatherCard);
    
    // 应用卡片显示设置
    applyCardVisibility();
    
    // 天气更新间隔
    const weatherUpdateInterval = weatherUpdateIntervalValue.textContent;
    if (weatherUpdateInterval >= 1 && weatherUpdateInterval <= 60) {
        localStorage.setItem('weatherUpdateInterval', weatherUpdateInterval);
    }
    
    // 数据源设置
    const weatherSource = getCustomSelectValue('weatherSourceContainer');
    localStorage.setItem('weatherSource', weatherSource);
    
    const timeSource = getCustomSelectValue('timeSourceContainer');
    localStorage.setItem('timeSource', timeSource);
    
    // 更新界面显示
    document.getElementById('searchOpenModeLabel').textContent = searchOpenInNewTab ? '新标签页' : '当前页面';
    document.getElementById('quickLinksOpenModeLabel').textContent = quickLinksOpenInNewTab ? '新标签页' : '当前页面';
    
    // 重新渲染链接网格以应用新设置
    renderLinksGrid();
    
    // 重新设置天气更新间隔
    setupWeatherUpdateInterval();
    
    // 保存新的原始状态
    saveAdvancedSettingsOriginalState();
    
    customDialog.alert('高级设置已保存', '设置已更新');
}

// 重置高级设置
function resetAdvancedSettings() {
    localStorage.removeItem('searchOpenInNewTab');
    localStorage.removeItem('quickLinksOpenInNewTab');
    localStorage.removeItem('weatherCardUrl');
    localStorage.removeItem('timeCardUrl');
    localStorage.removeItem('dialogBorderRadius');
    localStorage.removeItem('selectBorderRadius');
    localStorage.removeItem('inputBorderRadius');
    localStorage.removeItem('buttonBorderRadius');
    localStorage.removeItem('cardBorderRadius');
    localStorage.removeItem('iconBorderRadius');
    localStorage.removeItem('showTimeCard');
    localStorage.removeItem('showWeatherCard');
    localStorage.removeItem('weatherUpdateInterval');
    localStorage.removeItem('weatherSource');
    localStorage.removeItem('timeSource');
    
    // 应用默认圆角
    applyDefaultBorderRadius();
    
    // 应用默认卡片显示设置
    applyCardVisibility();
    
    // 设置默认天气更新间隔
    setupWeatherUpdateInterval();
    
    // 重新加载设置
    loadAdvancedSettings();
    
    customDialog.alert('高级设置已恢复为默认值', '设置已重置');
}

// 应用卡片显示设置
function applyCardVisibility() {
    const showTimeCard = localStorage.getItem('showTimeCard') !== 'false';
    const showWeatherCard = localStorage.getItem('showWeatherCard') !== 'false';
    
    const timeWidget = document.getElementById('timeWidget');
    const weatherWidget = document.getElementById('weatherWidget');
    
    if (showTimeCard) {
        timeWidget.style.display = 'block';
    } else {
        timeWidget.style.display = 'none';
    }
    
    if (showWeatherCard) {
        weatherWidget.style.display = 'block';
    } else {
        weatherWidget.style.display = 'none';
    }
}

// 应用光晕设置
function applyGlowSettings() {
    const glowLight = localStorage.getItem('glowLight') === 'true';
    const glowDark = localStorage.getItem('glowDark') !== 'false'; // 默认开启
    
    if (glowLight) {
        document.body.classList.add('glow-light-on');
    } else {
        document.body.classList.remove('glow-light-on');
    }
    
    if (!glowDark) {
        document.body.classList.add('glow-dark-off');
    } else {
        document.body.classList.remove('glow-dark-off');
    }
}

// 应用玻璃效果设置
function applyGlassSettings() {
    const glassEffect = localStorage.getItem('glassEffect') !== 'false'; // 默认开启
    if (glassEffect) {
        document.body.classList.remove('no-glass');
    } else {
        document.body.classList.add('no-glass');
    }
}

// 设置天气更新间隔
function setupWeatherUpdateInterval() {
    const weatherUpdateInterval = parseInt(localStorage.getItem('weatherUpdateInterval') || '2');
    const intervalMs = weatherUpdateInterval * 60 * 1000; // 转换为毫秒
    
    // 清除现有的天气更新间隔
    if (window.weatherUpdateIntervalId) {
        clearInterval(window.weatherUpdateIntervalId);
    }
    
    // 设置新的天气更新间隔
    window.weatherUpdateIntervalId = setInterval(getWeather, intervalMs);
}

// 应用所有圆角设置
function applyAllBorderRadius() {
    const dialogBorderRadius = localStorage.getItem('dialogBorderRadius') || '20';
    const selectBorderRadius = localStorage.getItem('selectBorderRadius') || '16';
    const inputBorderRadius = localStorage.getItem('inputBorderRadius') || '16';
    const buttonBorderRadius = localStorage.getItem('buttonBorderRadius') || '20';
    const cardBorderRadius = localStorage.getItem('cardBorderRadius') || '20';
    const iconBorderRadius = localStorage.getItem('iconBorderRadius') || '50';
    
    document.documentElement.style.setProperty('--border-radius-dialog', `${dialogBorderRadius}px`);
    document.documentElement.style.setProperty('--border-radius-select', `${selectBorderRadius}px`);
    document.documentElement.style.setProperty('--border-radius-input', `${inputBorderRadius}px`);
    document.documentElement.style.setProperty('--border-radius-button', `${buttonBorderRadius}px`);
    document.documentElement.style.setProperty('--border-radius-card', `${cardBorderRadius}px`);
    document.documentElement.style.setProperty('--border-radius-icon', `${iconBorderRadius}px`);
}

// 应用默认圆角设置
function applyDefaultBorderRadius() {
    document.documentElement.style.setProperty('--border-radius-dialog', '20px');
    document.documentElement.style.setProperty('--border-radius-select', '16px');
    document.documentElement.style.setProperty('--border-radius-input', '16px');
    document.documentElement.style.setProperty('--border-radius-button', '20px');
    document.documentElement.style.setProperty('--border-radius-card', '20px');
    document.documentElement.style.setProperty('--border-radius-icon', '50px');
}

// 保存搜索引擎设置
document.getElementById('searchEngineContainer').addEventListener('change', () => {
    const searchEngineValue = getCustomSelectValue('searchEngineContainer');
    localStorage.setItem('searchEngine', searchEngineValue);
});

// 保存天气地区设置
document.getElementById('locationSelectContainer').addEventListener('change', () => {
    const locationValue = getCustomSelectValue('locationSelectContainer');
    localStorage.setItem('weatherLocation', locationValue);
    getWeather(); // 更新天气信息
});

// 打开编辑对话框（从常用网站区域）
openCustomizeBtnInSection.addEventListener('click', () => {
    customizeModal.classList.add('active');
    renderLinksList();
    hideSaveCancelButtons();
});

// 打开编辑对话框（从设置中）
openCustomizeBtn.addEventListener('click', () => {
    closeModalWithAnimation(settingsModal);
    customizeModal.classList.add('active');
    renderLinksList();
    hideSaveCancelButtons();
});

// 添加按钮点击事件
addBtn.addEventListener('click', () => {
    addLinkModal.classList.add('active');
    resetForm();
    // 标记为非编辑状态
    isEditing = false;
});

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
        if (hasChanges()) {
            customDialog.saveConfirm('您有未保存的更改，确定要关闭吗？', '确认关闭')
                .then(result => {
                    if (result === 'save') {
                        saveLinksToStorage();
                        renderLinksGrid();
                        closeModalWithAnimation(customizeModal);
                    } else if (result === 'exit') {
                        closeModalWithAnimation(customizeModal);
                        loadLinksFromStorage();
                        renderLinksGrid();
                        hideSaveCancelButtons();
                    }
                    // 如果result是'cancel'，则不做任何操作，保持对话框打开
                });
        } else {
            closeModalWithAnimation(customizeModal);
        }
    }
    
    if (e.target === settingsModal) {
        closeModalWithAnimation(settingsModal);
    }
    
    if (e.target === advancedSettingsModal) {
        if (hasAdvancedSettingsChanges()) {
            customDialog.saveConfirm('您有未保存的更改，确定要关闭吗？', '确认关闭')
                .then(result => {
                    if (result === 'save') {
                        saveAdvancedSettings();
                        closeModalWithAnimation(advancedSettingsModal);
                    } else if (result === 'exit') {
                        closeModalWithAnimation(advancedSettingsModal);
                        loadAdvancedSettings();
                    }
                    // 如果result是'cancel'，则不做任何操作，保持对话框打开
                });
        } else {
            closeModalWithAnimation(advancedSettingsModal);
        }
    }
    
    if (e.target === aboutModal) {
        aboutModal.classList.remove('active');
    }
    
    if (e.target === customDialog.dialog) {
        customDialog.hide();
        if (customDialog.cancelCallback) customDialog.cancelCallback();
    }
});

// 添加/更新链接
addLinkBtn.addEventListener('click', () => {
    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const icon = getCustomSelectValue('linkIconContainer');
    
    if (!name || !url) {
        customDialog.alert('请输入网站名称和地址', '输入错误');
        return;
    }
    
    // URL格式检查 - 使用改进的验证函数，取消特殊豁免
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
    }
    
    if (!isValidUrl(formattedUrl)) {
        customDialog.alert('请输入有效的网站地址，例如：https://www.example.com', 'URL格式错误');
        return;
    }
    
    const editingId = addLinkBtn.dataset.editingId;
    if (editingId) {
        const linkIndex = links.findIndex(link => link.id === parseInt(editingId));
        if (linkIndex !== -1) {
            links[linkIndex].name = name;
            links[linkIndex].url = formattedUrl;
            links[linkIndex].icon = icon;
        }
        
        delete addLinkBtn.dataset.editingId;
        addLinkBtn.textContent = '添加网站';
        document.getElementById('addLinkModalTitle').textContent = '添加网站';
    } else {
        const newId = links.length > 0 ? Math.max(...links.map(link => link.id)) + 1 : 1;
        links.push({
            id: newId,
            name: name,
            url: formattedUrl,
            icon: icon
        });
    }
    
    closeModalWithAnimation(addLinkModal);
    renderLinksList();
    resetForm();
    showSaveCancelButtons();
    isEditing = false;
});

// 重置表单
function resetForm() {
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    setCustomSelectValue('linkIconContainer', 'fas fa-globe');
    updateIconPreview();
    delete addLinkBtn.dataset.editingId;
    addLinkBtn.textContent = '添加网站';
    document.getElementById('addLinkModalTitle').textContent = '添加网站';
}

// 搜索功能 - 支持多搜索引擎
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', () => {
    performSearch();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
        const searchEngine = localStorage.getItem('searchEngine') || 'baidu';
        let searchUrl;
        
        if (query.includes('.') && !query.includes(' ')) {
            // 如果是网址，直接跳转
            const searchOpenInNewTab = localStorage.getItem('searchOpenInNewTab') === 'true';
            const url = query.startsWith('http') ? query : `https://${query}`;
            
            if (searchOpenInNewTab) {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }
        } else {
            // 如果是搜索关键词
            switch (searchEngine) {
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'sogou':
                    searchUrl = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
                    break;
                case '360':
                    searchUrl = `https://www.so.com/s?q=${encodeURIComponent(query)}`;
                    break;
                case 'baidu':
                default:
                    searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
            }
            
            const searchOpenInNewTab = localStorage.getItem('searchOpenInNewTab') === 'true';
            if (searchOpenInNewTab) {
                window.open(searchUrl, '_blank');
            } else {
                window.location.href = searchUrl;
            }
        }
    }
}

// 初始化
function init() {
    // 触屏设备标记（供 CSS 适配）
    if (isTouchDevice) {
        document.body.setAttribute('data-touch', '');
    }
    
    loadLinksFromStorage();
    renderLinksGrid();
    updateTime();
    setInterval(updateTime, 1000);
    // 天气实时更新
    getWeather();
    setupWeatherUpdateInterval();
    updateIconPreview();
    loadThemeFromStorage();
    
    // 设置主题切换功能
    setupThemeSwitching();
    
    // 加载设置
    loadSettings();
    
    // 加载高级设置
    loadAdvancedSettings();
    
    // 应用保存的圆角设置
    applyAllBorderRadius();
    
    // 应用卡片显示设置
    applyCardVisibility();
    
    // 初始化自定义选择框
    initCustomSelects();
    
    // 初始化圆角控制
    setupBorderRadiusControls();
}

// 启动初始化
init();
