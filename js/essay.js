(function() {
  // =====================
  // 时间转换：微信朋友圈风格
  // =====================
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
    return `${year}年${month}月${day}日`;
  }

  function updateRelativeTime(container = document) {
    container.querySelectorAll('.datetime').forEach(el => {
      const timeStr = el.getAttribute('datetime');
      if (timeStr) el.textContent = formatRelativeTime(timeStr);
    });
  }

  // =====================
  // Waline 懒加载封装
  // =====================
  function loadWaline() {
    return new Promise((resolve, reject) => {
      if (window.Waline) return resolve(window.Waline);

      if (document.getElementById("waline-script")) {
        document.getElementById("waline-script").addEventListener("load", () => {
          resolve(window.Waline);
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "waline-script";
      script.src = "https://waline.fufu.ink"; // 替换成你的 Waline 地址
      script.onload = () => resolve(window.Waline);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // =====================
  // 初始化指定说说的评论区
  // =====================
  function initWalineForMoment(momentId, quoteText) {
    loadWaline().then(Waline => {
      const walineInstance = Waline.init({
        el: `#comment-container-${momentId}`,
        serverURL: "https://waline.fufu.ink",
        path: `/essay/${momentId}`,
        comment: true,
        pageview: false
      });

      if (quoteText) {
        walineInstance.commentBox.value = `> "${quoteText}"\n`;
        walineInstance.commentBox.focus();
      }
    }).catch(err => {
      console.error("加载 Waline 失败：", err);
    });
  }

  // =====================
  // 绑定按钮事件（单一评论框展开 + 引用）
  // =====================
  function bindCommentButtons() {
    document.querySelectorAll(".essay-comment-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const momentId = btn.dataset.momentId;
        const quoteText = btn.dataset.momentText;
        let container = document.querySelector(`#comment-container-${momentId}`);

        // ---------------------
        // 自动收起其他评论框
        // ---------------------
        document.querySelectorAll("[id^='comment-container-']").forEach(c => {
          if (c.id !== `comment-container-${momentId}`) {
            c.style.display = "none";
          }
        });

        // ---------------------
        // 创建评论容器
        // ---------------------
        if (!container) {
          container = document.createElement("div");
          container.id = `comment-container-${momentId}`;
          container.style.marginTop = "10px";
          btn.closest(".card-content").appendChild(container);
        }

        // ---------------------
        // 展示或初始化评论
        // ---------------------
        if (container.style.display === "none" || !container.hasChildNodes()) {
          container.style.display = "block";
          if (!container.hasChildNodes()) {
            initWalineForMoment(momentId, quoteText);
          } else if (quoteText) {
            const commentBox = container.querySelector(".wl-textarea");
            if (commentBox) {
              commentBox.value = `> "${quoteText}"\n`;
              commentBox.focus();
            }
          }
        } else {
          container.style.display = "none";
        }

        // 平滑滚动到评论框
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // =====================
  // 初始化函数
  // =====================
  function init(container = document) {
    updateRelativeTime(container);
    bindCommentButtons();
  }

  // 页面首次加载
  init(document);

  // PJAX 切换页面兼容
  document.addEventListener('pjax:success', () => {
    init(document);
  });

})();
