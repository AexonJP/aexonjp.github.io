(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasIO = "IntersectionObserver" in window;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  /* Run `start`/`stop` as an element enters and leaves the viewport (and the tab hides). */
  function whileVisible(target, start, stop) {
    let inView = !hasIO;
    const sync = () => (inView && !document.hidden ? start() : stop());
    if (hasIO) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        sync();
      }).observe(target);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
  }

  $$("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

  /* Rolling button labels: the text is duplicated with text-shadow and slides up on hover. */
  $$(".btn .label").forEach((label) => label.replaceChildren(el("span", "", label.textContent)));

  /* ------------------------------------------------------------------
     Founder profile (assets/js/profile.js)
     ------------------------------------------------------------------ */
  function renderProfile(profile) {
    if (!profile) return;

    if (profile.headline) $('[data-profile="headline"]').textContent = profile.headline;

    if (profile.about) {
      const paragraphs = profile.about.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean).map((t) => el("p", "", t));
      $('[data-profile="about"]').replaceChildren(...paragraphs);
    }

    const renderers = {
      experience: (item) => {
        const li = el("li");
        li.append(el("div", "tl-date", item.period), el("div", "tl-role", item.role), el("div", "tl-org", item.company));
        if (item.description) li.append(el("p", "tl-desc", item.description));
        return li;
      },
      certifications: (item) => {
        const li = el("li");
        li.append(el("strong", "", item.name), el("span", "", [item.issuer, item.year].filter(Boolean).join(" · ")));
        if (item.url) {
          const a = el("a", "", "Show credential ↗");
          a.href = item.url;
          a.target = "_blank";
          a.rel = "noopener";
          li.append(" ", a);
        }
        return li;
      },
      education: (item) => {
        const li = el("li");
        li.append(el("strong", "", item.school), el("span", "", [item.degree, item.period].filter(Boolean).join(" · ")));
        return li;
      },
      skills: (item) => el("li", "", item),
    };

    let any = false;
    Object.entries(renderers).forEach(([key, render]) => {
      const items = Array.isArray(profile[key]) ? profile[key].filter(Boolean) : [];
      const block = $(`[data-cred="${key}"]`);
      if (!items.length || !block) return;
      $("ol, ul", block).replaceChildren(...items.map(render));
      block.hidden = false;
      any = true;
    });
    if (any) $("[data-credentials]").hidden = false;
  }

  renderProfile(window.AEXON_PROFILE);

  /* ------------------------------------------------------------------
     Nav: scrolled state, hide on scroll down, progress bar
     ------------------------------------------------------------------ */
  const nav = $("[data-nav]");
  const progress = $(".scroll-progress");
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : "0");
    nav.classList.toggle("is-scrolled", y > 10);
    if (!document.body.classList.contains("nav-open") && Math.abs(y - lastY) > 4) {
      nav.classList.toggle("is-hidden", y > lastY && y > 480);
      lastY = y;
    }
    updateProcess();
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* Mobile menu */
  const toggle = $("[data-nav-toggle]");
  const menu = $("#nav-menu");

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) nav.classList.remove("is-hidden");
  }

  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* Current section in nav */
  if (hasIO) {
    const links = $$('.nav-links a[href^="#"]:not(.btn)');
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-current"));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add("is-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach((s) => sectionIO.observe(s));
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  const wordmark = $("[data-wordmark]");
  if (wordmark) $$("span", wordmark).forEach((s, i) => s.style.setProperty("--i", i));

  const revealEls = [...$$("[data-reveal]"), wordmark].filter(Boolean);
  if (reduceMotion || !hasIO) {
    revealEls.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealIO.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((node) => revealIO.observe(node));
  }

  /* ------------------------------------------------------------------
     Hero: rolling word
     ------------------------------------------------------------------ */
  const rotator = $("[data-rotator]");
  if (rotator && !reduceMotion) {
    const words = $$(".rot", rotator);
    let index = 0;
    setTimeout(() => {
      setInterval(() => {
        if (document.hidden) return;
        const current = words[index];
        index = (index + 1) % words.length;
        const next = words[index];
        current.classList.replace("is-in", "is-out");
        next.classList.add("is-in");
        setTimeout(() => {
          // Park the old word below the line again without animating through the slot.
          current.style.transition = "none";
          current.classList.remove("is-out");
          void current.offsetWidth;
          current.style.transition = "";
        }, 800);
      }, 2600);
    }, 2000);
  }

  /* ------------------------------------------------------------------
     Hero: split-flap departures board
     ------------------------------------------------------------------ */
  const FLAPS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-";
  const SERVICES = ["CHECKOUT", "AUTH-API", "WEB-APP", "WORKER", "PAYMENTS", "SEARCH", "ADMIN", "MAILER", "REPORTS", "GATEWAY", "BILLING", "MOBILE-API"];
  const STATUSES = ["QUEUED", "BUILDING", "TESTING", "SHIPPED"];
  const WIDTHS = { svc: 10, env: 4, st: 8 };

  function initBoard(board) {
    const rowsEl = $("[data-board-rows]", board);
    const clock = $("[data-clock]", board);
    const pending = new Set();

    const rows = $$("li", rowsEl).map((li) => {
      const row = { lamp: $(".lamp", li) };
      Object.entries(WIDTHS).forEach(([key, width]) => {
        const group = $(`.cell-group.${key}`, li);
        const text = group.textContent.trim();
        row[key] = text;
        row[`${key}Cells`] = Array.from({ length: width }, () => {
          const node = el("span", "flap");
          const ch = el("span", "ch");
          node.append(ch);
          return { node, ch, cur: " ", target: " " };
        });
        group.replaceChildren(...row[`${key}Cells`].map((c) => c.node));
      });
      row.status = STATUSES.indexOf(row.st);
      return row;
    });
    rowsEl.setAttribute("aria-hidden", "true");

    function show(cells, text, animate) {
      const padded = text.toUpperCase().padEnd(cells.length).slice(0, cells.length);
      cells.forEach((cell, i) => {
        const ch = FLAPS.includes(padded[i]) ? padded[i] : " ";
        cell.target = ch;
        if (!animate) {
          cell.cur = ch;
          cell.ch.textContent = ch.trim();
          pending.delete(cell);
        } else if (cell.cur !== ch) {
          pending.add(cell);
        }
      });
    }

    function paintRow(row, animate) {
      show(row.svcCells, row.svc, animate);
      show(row.envCells, row.env, animate);
      show(row.stCells, STATUSES[row.status], animate);
      row.lamp.className = `lamp${row.status === 3 ? " is-shipped" : row.status > 0 ? " is-busy" : ""}`;
    }

    function updateClock() {
      const now = new Date();
      clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
    updateClock();
    setInterval(updateClock, 15000);

    if (reduceMotion) {
      rows.forEach((row) => paintRow(row, false));
      return;
    }

    // Flip every pending cell one character forward, like a real split-flap.
    function tick() {
      pending.forEach((cell) => {
        const next = FLAPS[(FLAPS.indexOf(cell.cur) + 1) % FLAPS.length];
        cell.cur = next;
        cell.ch.textContent = next.trim();
        cell.node.classList.toggle("odd");
        if (next === cell.target) pending.delete(cell);
      });
    }

    let turn = 0;
    function advance() {
      const row = rows[turn % rows.length];
      turn++;
      if (row.status === STATUSES.length - 1) {
        const onBoard = new Set(rows.map((r) => r.svc));
        const free = SERVICES.filter((s) => !onBoard.has(s));
        row.svc = free[(Math.random() * free.length) | 0];
        row.env = Math.random() < 0.7 ? "PROD" : "STAG";
        row.status = 0;
      } else {
        row.status++;
      }
      paintRow(row, true);
    }

    let flapTimer = 0;
    let stepTimer = 0;
    whileVisible(board, () => {
      if (flapTimer) return;
      flapTimer = setInterval(tick, 42);
      stepTimer = setInterval(advance, 1900);
    }, () => {
      clearInterval(flapTimer);
      clearInterval(stepTimer);
      flapTimer = 0;
      stepTimer = 0;
    });

    // Opening flourish: every cell flips in from blank.
    setTimeout(() => rows.forEach((row) => paintRow(row, true)), 600);
  }

  const board = $("[data-board]");
  if (board) initBoard(board);

  /* ------------------------------------------------------------------
     Band: marquee that speeds up and follows your scroll direction
     ------------------------------------------------------------------ */
  function initBand(track) {
    const group = track.firstElementChild;
    let width = group.offsetWidth;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let raf = 0;
    let last = 0;
    let lastScroll = window.scrollY;

    window.addEventListener("scroll", () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (dy) dir = dy > 0 ? -1 : 1;
      boost = Math.min(boost + Math.abs(dy) * 0.004, 1.6);
    }, { passive: true });
    window.addEventListener("resize", () => { width = group.offsetWidth; });

    function frame(now) {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      x += dir * (0.05 + boost) * dt;
      boost *= 0.93;
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      raf = requestAnimationFrame(frame);
    }

    whileVisible(track, () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }, () => {
      cancelAnimationFrame(raf);
      raf = 0;
    });
  }

  const band = $("[data-band]");
  if (band && !reduceMotion) initBand(band);

  /* ------------------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------------
     Before / after comparison
     ------------------------------------------------------------------ */
  const compare = $("[data-compare]");
  if (compare) {
    const buttons = $$("[data-compare-btn]", compare);
    const before = $$(".face.before", compare);
    const after = $$(".face.after", compare);
    let touched = false;

    const setCompare = (isAfter) => {
      compare.classList.toggle("is-after", isAfter);
      buttons.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.compareBtn === "after") === isAfter)));
      before.forEach((f) => f.setAttribute("aria-hidden", String(isAfter)));
      after.forEach((f) => f.setAttribute("aria-hidden", String(!isAfter)));
    };
    setCompare(false);

    buttons.forEach((b) => b.addEventListener("click", () => {
      touched = true;
      setCompare(b.dataset.compareBtn === "after");
    }));

    if (hasIO) {
      const compareIO = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        compareIO.disconnect();
        setTimeout(() => { if (!touched) setCompare(true); }, 1600);
      }, { threshold: 0.6 });
      compareIO.observe(compare);
    }
  }

  /* ------------------------------------------------------------------
     Process: sticky stage card driven by scroll
     ------------------------------------------------------------------ */
  const processEl = $("[data-process]");
  const steps = processEl ? $$("[data-step]", processEl) : [];
  const pvNum = $("[data-pv-num]");
  const pvTitle = $("[data-pv-title]");
  const pvFill = $("[data-pv-fill]");
  const pvDots = $$(".pv-rail i");
  const pvCode = $$(".pv-code pre");
  let activeStep = 0;

  function retrigger(node) {
    node.classList.remove("is-swap");
    void node.offsetWidth;
    node.classList.add("is-swap");
  }

  function setStep(index) {
    activeStep = index;
    steps.forEach((s, i) => s.classList.toggle("is-active", i === index));
    pvDots.forEach((d, i) => d.classList.toggle("is-on", i <= index));
    pvCode.forEach((p, i) => p.classList.toggle("is-on", i === index));
    pvNum.textContent = String(index + 1).padStart(2, "0");
    pvTitle.textContent = $("h3", steps[index]).textContent;
    retrigger(pvNum);
    retrigger(pvTitle);
  }

  function updateProcess() {
    if (!steps.length || window.innerWidth <= 960) return;
    const mid = window.innerHeight * 0.5;
    const centers = steps.map((s) => {
      const r = s.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    let best = 0;
    centers.forEach((c, i) => {
      if (Math.abs(c - mid) < Math.abs(centers[best] - mid)) best = i;
    });
    const first = centers[0];
    const last = centers[centers.length - 1];
    pvFill.style.setProperty("--pp", clamp((mid - first) / (last - first)).toFixed(4));
    if (best !== activeStep) setStep(best);
  }

  /* ------------------------------------------------------------------
     FAQ: animated accordion
     ------------------------------------------------------------------ */
  $$(".faq details").forEach((details) => {
    const summary = $("summary", details);
    const body = $(".faq-body", details);
    let anim = null;

    summary.addEventListener("click", (e) => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      const easing = "cubic-bezier(.16, 1, .3, 1)";

      if (details.open) {
        details.classList.add("is-closing");
        anim = body.animate(
          [{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 380, easing }
        );
        anim.onfinish = () => {
          details.open = false;
          details.classList.remove("is-closing");
          anim = null;
        };
      } else {
        details.classList.remove("is-closing");
        details.open = true;
        anim = body.animate(
          [{ height: "0px", opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }],
          { duration: 520, easing }
        );
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ------------------------------------------------------------------
     Copy code button
     ------------------------------------------------------------------ */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText($("pre", btn.closest(".code-card")).textContent);
        btn.textContent = "Copied ✓";
        btn.classList.add("is-copied");
      } catch {
        btn.textContent = "Copy failed";
      }
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("is-copied");
      }, 1800);
    });
  });

  onScroll();
  window.addEventListener("resize", updateProcess);
})();
