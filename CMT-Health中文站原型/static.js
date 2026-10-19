/* Medora (CMT Health) 静态版交互脚本
 * 实现：滚动显现动画、移动菜单、咨询抽屉、抽屉表单、滚动提示、
 *       医院筛选、治疗项目搜索、案例视频弹窗、Toast 提示
 */
(function () {
  'use strict';

  // 仅在交互脚本已成功加载时启用依赖 JS 的显现状态；脚本失败时内容仍可见。
  document.documentElement.classList.add('reveal-ready');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 滚动显现动画 ---------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (reducedMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var pending = Array.prototype.slice.call(items);
    var ticking = false;

    function revealVisible() {
      var h = window.innerHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.94) {
          el.classList.add('is-visible');
          return false;
        }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        revealVisible();
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    revealVisible();
  }

  /* ---------- 2. Toast ---------- */
  var toastEl = document.querySelector('.toast');
  var toastTimer = null;
  function showToast(message, isError) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3600);
  }

  /* ---------- 3. 移动菜单 ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    function closeMenu(returnFocus) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开菜单');
      toggle.setAttribute('title', '打开菜单');
      menu.inert = true;
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      if (!open) { closeMenu(true); return; }
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '关闭菜单');
      toggle.setAttribute('title', '关闭菜单');
      menu.inert = false;
      requestAnimationFrame(function () {
        var first = menu.querySelector('a, button');
        if (first) first.focus();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu(true);
      }
    });
    menu.querySelectorAll('a, button').forEach(function (control) {
      control.addEventListener('click', function () {
        closeMenu(false);
      });
    });
  }

  /* ---------- 4. 咨询抽屉 ---------- */
  function initDrawer() {
    var drawer = document.querySelector('.consultation-drawer');
    var backdrop = document.querySelector('.drawer-backdrop');
    if (!drawer || !backdrop) return;
    var lastTrigger = null;

    function setBackgroundInert(active) {
      Array.prototype.forEach.call(document.body.children, function (el) {
        if (el === drawer || el === backdrop || el.classList.contains('toast') || el.tagName === 'SCRIPT') return;
        if (active) {
          el.setAttribute('data-drawer-inert', el.inert ? 'true' : 'false');
          el.inert = true;
        } else if (el.hasAttribute('data-drawer-inert')) {
          el.inert = el.getAttribute('data-drawer-inert') === 'true';
          el.removeAttribute('data-drawer-inert');
        }
      });
    }
    function openDrawer(trigger) {
      lastTrigger = trigger;
      var menu = document.getElementById('mobile-menu');
      var toggle = document.querySelector('.menu-toggle');
      if (trigger && menu && menu.contains(trigger) && toggle) lastTrigger = toggle;
      if (menu && toggle) {
        menu.classList.remove('is-open');
        menu.inert = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '打开菜单');
        toggle.setAttribute('title', '打开菜单');
      }
      setBackgroundInert(true);
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      drawer.inert = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(function () {
        var closeBtn = drawer.querySelector('.consultation-close');
        if (closeBtn) closeBtn.focus();
      });
    }
    function closeDrawer(returnFocus) {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      drawer.inert = true;
      document.body.classList.remove('is-locked');
      setBackgroundInert(false);
      if (returnFocus && lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('.consultation-open').forEach(function (btn) {
      btn.addEventListener('click', function () { openDrawer(btn); });
    });

    var closeBtn = drawer.querySelector('.consultation-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { closeDrawer(true); });
    backdrop.addEventListener('click', function () { closeDrawer(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !drawer.classList.contains('is-open')) return;
      var dialog = document.querySelector('.video-dialog');
      if (dialog && dialog.open) return;
      closeDrawer(true);
    });

    // 焦点锁定
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
      var focusables = drawer.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- 5. 抽屉表单 ---------- */
  function initDrawerForm() {
    var form = document.querySelector('.chat-form');
    if (!form) return;
    form.addEventListener('invalid', function (e) {
      e.target.setAttribute('aria-invalid', 'true');
      showToast('请检查必填项和邮箱格式。', true);
    }, true);
    form.addEventListener('input', function (e) {
      if (e.target.checkValidity && e.target.checkValidity()) e.target.removeAttribute('aria-invalid');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // 当前客户确认版没有后端接口：只做本地格式校验，绝不伪报“已收到”。
      showToast('信息填写无误。当前为演示页面，内容不会发送或保存。');
    });
  }

  /* ---------- 6. 静态版未交付入口 ---------- */
  function initStaticNotices() {
    document.querySelectorAll('[data-language-notice]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showToast('英文版正在准备中，目前仅提供中文内容。');
      });
    });
    document.querySelectorAll('[data-unavailable-notice]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var name = link.textContent || '该内容';
        var badge = link.querySelector('.link-status');
        if (badge) name = name.replace(badge.textContent, '').trim();
        showToast(name + '页面正在准备中，即将上线。');
      });
    });
  }

  /* ---------- 7. 首页滚动提示 ---------- */
  function initScrollCue() {
    var cue = document.querySelector('.scroll-cue');
    if (!cue) return;
    cue.addEventListener('click', function () {
      var next = document.querySelector('.journey-ribbon') ||
        document.querySelector('main section + section') ||
        document.querySelector('main section');
      if (next) next.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ---------- 7. 医院筛选 ---------- */
  function initHospitalFilter() {
    var search = document.getElementById('hospital-search');
    var city = document.getElementById('hospital-city');
    var specialty = document.getElementById('hospital-specialty');
    var grid = document.querySelector('.hospital-grid');
    if (!search || !city || !specialty || !grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.hospital-card'));
    var status = document.createElement('p');
    status.className = 'sr-only filter-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    grid.parentNode.insertBefore(status, grid);

    function apply() {
      var q = search.value.trim().toLowerCase();
      var c = city.value;
      var s = specialty.value;
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.querySelector('h3') || {}).textContent || '';
        var desc = (card.querySelector('p') || {}).textContent || '';
        var loc = (card.querySelector('.hospital-location') || {}).textContent || '';
        var tags = Array.prototype.map.call(card.querySelectorAll('.tag'), function (t) { return t.textContent; }).join(' ');
        var text = (title + ' ' + desc + ' ' + loc + ' ' + tags).toLowerCase();
        var show = true;
        if (q && text.indexOf(q) === -1) show = false;
        if (show && c && loc.indexOf(c) === -1) show = false;
        if (show && s && tags.indexOf(s) === -1) show = false;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      var note = grid.querySelector('.filter-empty');
      if (visible === 0) {
        if (!note) {
          note = document.createElement('p');
          note.className = 'filter-empty';
          note.textContent = '没有找到符合条件的医院，请尝试调整筛选条件。';
          grid.appendChild(note);
        }
        note.style.display = '';
      } else if (note) {
        note.style.display = 'none';
      }
      grid.setAttribute('aria-busy', 'false');
      status.textContent = '筛选结果：共 ' + visible + ' 家医院。';
    }

    [search, city, specialty].forEach(function (el) {
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
  }

  /* ---------- 9. 案例视频弹窗 ---------- */
  function initVideoDialog() {
    var dialog = document.querySelector('.video-dialog');
    if (!dialog) return;
    document.querySelectorAll('.story-play[data-video-url]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-video-url');
        if (!url) return;
        var card = btn.closest('.story-card, .story-feature');
        var heading = card ? card.querySelector('h2, h3') : null;
        var title = heading ? heading.textContent.trim() : '用户案例视频';
        dialog.setAttribute('aria-label', title);
        dialog.setAttribute('aria-describedby', 'video-access-note');
        dialog.innerHTML =
          '<button class="video-close" type="button" aria-label="关闭视频"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>' +
          '<div class="modal-player-stage modal-player-stage-video"><video class="modal-player-video" aria-label="' + title.replace(/"/g, '&quot;') + '" controls autoplay playsinline preload="metadata" src="' + url + '"></video></div>' +
          '<p class="video-access-note" id="video-access-note">视频要点见卡片文字说明；当前演示视频暂未提供逐字字幕。</p>';
        dialog.showModal();
        var close = dialog.querySelector('.video-close');
        if (close) close.addEventListener('click', function () { dialog.close(); });
      });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      var video = dialog.querySelector('video');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
      dialog.innerHTML = '';
    });
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initMobileMenu();
    initDrawer();
    initDrawerForm();
    initStaticNotices();
    initScrollCue();
    initHospitalFilter();
    initVideoDialog();
  });
})();
