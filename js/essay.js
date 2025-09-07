(function () {
  // ----------------------
  // 相对时间功能
  // ----------------------
  function formatRelativeTime(dateStr) {
    const now = new Date();
    const past = new Date(dateStr);
    const diff = (now - past) / 1000; // 秒

    if (diff < 60) return `${Math.floor(diff)}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

    const year = past.getFullYear();
    const month = past.getMonth() + 1;
    const day = past.getDate();
    if (year !== now.getFullYear()) {
      return `${year}年${month}月${day}日`;
    }
    return `${month}月${day}日`;
  }

  function updateRelativeTime(container = document) {
    container.querySelectorAll('.datetime').forEach(el => {
      const timeStr = el.getAttribute('datetime');
      if (timeStr) el.textContent = formatRelativeTime(timeStr);
    });
  }

  // ----------------------
  // Waline 评论逻辑 (仿 Butterfly)
  // ----------------------
  window.addCommentToEssay = function (event) {
    const btn = event.target.closest('.essay-comment-btn');
    if (!btn) return;

    const card = btn.closest('.card');
    if (!card) return;

    // 找到或创建评论容器
    let container = card.querySelector('.essay-comment-wrap');
    const isHidden = !container;

    // 先销毁其他评论框
    document.querySelectorAll('.essay-comment-wrap').forEach(wrap => {
      wrap.remove();
    });

    if (isHidden) {
      // 插入评论容器 DOM
      container = document.createElement('div');
      container.className = 'essay-comment-wrap';
      container.innerHTML = `
        <hr class="custom-hr"/>
        <div id="waline-${card.dataset.key}" class="waline-container"></div>
      `;
      card.appendChild(container);

      // 构造唯一 path 作为 key
      const uniquePath = `${location.pathname}?moment=${card.dataset.key}`;

      // 初始化 Waline
      if (window.Waline) {
        Waline.init(Object.assign({}, CONFIG.waline, {
          el: `#waline-${card.dataset.key}`,
          path: uniquePath
        }));

        // 自动在输入框插入引用文本
        setTimeout(() => {
          const textarea = container.querySelector('textarea');
          if (textarea) {
            const text = btn.getAttribute('data-moment-text') || '';
            textarea.value = `> ${text}\n\n`;
            textarea.focus();
          }
        }, 500);
      } else {
        console.error('Waline is not defined');
      }
    }
  };

  // ----------------------
  // 初始化函数
  // ----------------------
  function init(container = document) {
    updateRelativeTime(container);

    container.querySelectorAll('.essay-comment-btn').forEach(btn => {
      btn.removeEventListener('click', window.addCommentToEssay);
      btn.addEventListener('click', window.addCommentToEssay);
    });
  }

  // 页面首次加载
  init(document);

  // PJAX 兼容
  document.addEventListener('pjax:success', () => {
    init(document);
  });
})();
