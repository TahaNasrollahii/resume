(function () {
  "use strict";

  /* ---------- theme toggle (default: Dark) ---------- */
  var root = document.documentElement;
  var body = document.body;
  var themeBtn = document.getElementById("themeToggle");
  var THEME_KEY = "taha-site-theme";

  function applyTheme(theme, persist, animate) {
    var next = theme === "light" ? "light" : "dark";
    if (animate) {
      root.classList.add("theme-animating");
      clearTimeout(root._themeTimer);
      root._themeTimer = setTimeout(function () {
        root.classList.remove("theme-animating");
      }, 320);
    }
    root.setAttribute("data-theme", next);
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        next === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(savedTheme === "light" ? "light" : "dark", false, false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      applyTheme(cur === "light" ? "dark" : "light", true, true);
    });
  }

  /* ---------- language toggle (default: English) ---------- */
  var toggleBtn = document.getElementById("langToggle");
  var STORAGE_KEY = "taha-site-lang-v2";

  function applyLang(lang, persist) {
    var next = lang === "fa" ? "fa" : "en";
    root.setAttribute("data-lang", next);
    body.setAttribute("data-lang", next);
    root.setAttribute("lang", next);
    root.setAttribute("dir", next === "fa" ? "rtl" : "ltr");
    document.title = next === "fa" ? "طاها نصرالهی | مهندس نرم‌افزار" : "Taha Nasrollahi | Software Engineer";
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    }

    // adjust nav pill when language changes
    setTimeout(updateNav, 100);
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  applyLang(saved === "fa" ? "fa" : "en", false);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-lang") === "fa" ? "fa" : "en";
      applyLang(current === "fa" ? "en" : "fa", true);
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- subtle one-time reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            if (entry.target.classList.contains("section-label")) {
              entry.target.classList.add("typing");
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- navigation tracking ---------- */
  var sections = document.querySelectorAll("section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a[data-target]");
  var navPill = document.getElementById("navPill");
  var railFill = document.getElementById("railFill");
  var railTrack = document.querySelector(".rail-track");
  var isRtl = () => root.getAttribute("dir") === "rtl";

  var railNodes = [];

  // Create rail nodes dynamically based on sections
  if (railTrack) {
    sections.forEach(function(sec, index) {
      if(sec.id === 'top') return; // skip hero for nodes
      var node = document.createElement("div");
      node.className = "rail-node";
      node.style.top = ((index) / (sections.length - 1) * 100) + "%";
      node.innerHTML = '<span class="rail-label">/' + sec.id + '</span>';
      node.addEventListener("click", function() {
        sec.scrollIntoView({ behavior: 'smooth' });
      });
      railTrack.appendChild(node);
      sec.dataset.railIndex = index - 1;
    });
    railNodes = document.querySelectorAll(".rail-node");
  }

  function updateNav() {
    var scrollY = window.scrollY;
    var currentId = "";
    var isMobile = window.innerWidth <= 640;
    var isTabletOrMobile = window.innerWidth <= 980;

    // Adjust rail fill height only when rail is visible on desktop
    if (!isTabletOrMobile && railFill) {
      var docHeight = document.body.clientHeight - window.innerHeight;
      if (docHeight > 0) {
        var scrolled = (scrollY / docHeight) * 100;
        railFill.style.height = scrolled + "%";
      }
    }

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) {
        currentId = sec.getAttribute("id");
      }
    });

    // Fallback: if we are at the very bottom, make sure the last section is active
    if (Math.ceil(window.innerHeight + scrollY) >= document.body.offsetHeight - 20) {
      currentId = sections[sections.length - 1].getAttribute("id");
    }

    var activeAnchor = null;
    navAnchors.forEach(function (a) {
      a.classList.remove("active");
      if (a.getAttribute("data-target") === currentId) {
        a.classList.add("active");
        activeAnchor = a;
      }
    });

    // Move nav pill only on desktop (on mobile nav-pill is hidden)
    if (!isMobile && navPill && activeAnchor) {
      navPill.style.width = activeAnchor.offsetWidth + "px";
      if (isRtl()) {
        var parentW = activeAnchor.parentElement.offsetWidth;
        var offsetR = parentW - (activeAnchor.offsetLeft + activeAnchor.offsetWidth);
        navPill.style.left = 'auto';
        navPill.style.right = offsetR + "px";
      } else {
        navPill.style.right = 'auto';
        navPill.style.left = activeAnchor.offsetLeft + "px";
      }
      navPill.style.opacity = 1;
    } else if (navPill) {
      navPill.style.opacity = 0;
    }

    // Update rail nodes only when rail is visible
    if (!isTabletOrMobile && railNodes.length > 0) {
      sections.forEach(function(sec) {
        if(sec.id === currentId && sec.dataset.railIndex !== undefined) {
          railNodes.forEach(n => n.classList.remove("active"));
          if(railNodes[sec.dataset.railIndex]) {
            railNodes[sec.dataset.railIndex].classList.add("active");
          }
        }
      });
    }
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // initial call
  setTimeout(updateNav, 100);


  /* ---------- Spotlight & mouse effects ---------- */
  var cards = document.querySelectorAll(".skill-card, .contact-item");
  
  document.addEventListener("mousemove", function(e) {
    var x = e.clientX;
    var y = e.clientY;

    cards.forEach(function(card) {
      var rect = card.getBoundingClientRect();
      var cx = x - rect.left;
      var cy = y - rect.top;
      card.style.setProperty("--mx", cx + "px");
      card.style.setProperty("--my", cy + "px");
    });
  });

  /* ---------- Canvas Background ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var w, h;
    
    function resizeCanvas() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for(var i=0; i<40; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var isLight = root.getAttribute("data-theme") === "light";
      ctx.fillStyle = isLight ? "rgba(200, 125, 20, 0.35)" : "rgba(232, 163, 61, 0.4)";
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if(p.x < 0 || p.x > w) p.dx *= -1;
        if(p.y < 0 || p.y > h) p.dy *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- Terminal Typing Animation ---------- */
  var termBody = document.getElementById("termBody");
  if (termBody) {
    var commands = [
      {
        cmd: "pnpm check && pytest -q",
        out: "✔ 385 Pytest + 88 Playwright E2E checks green\n✔ Lighthouse Performance 95 · SEO 100"
      },
      {
        cmd: "celery -A core worker -l info",
        out: "[tasks]\n  . agents.index_pgvector\n  . billing.settle_ledger\ncelery@taha ready."
      },
      {
        cmd: "docker compose up -d",
        out: "✔ Container postgres-17   Started\n✔ Container redis-cache   Started\n✔ Container api-gateway   Started"
      }
    ];

    var cmdIdx = 0;
    var charIdx = 0;
    var isDeleting = false;
    
    // Create static prompt line
    var lineEl = document.createElement("div");
    lineEl.className = "line-fade line-fade-in line";
    lineEl.innerHTML = '<span class="prompt">user@taha:~$ </span><span class="text"></span><span class="cursor"></span>';
    termBody.appendChild(lineEl);
    
    var textSpan = lineEl.querySelector(".text");
    var outEl = null;

    function typeTerminal() {
      var currentCmd = commands[cmdIdx];

      if (isDeleting) {
        // Backspacing
        if (outEl) {
           outEl.remove(); // clear output instantly
           outEl = null;
        }
        
        if (charIdx > 0) {
          charIdx--;
          textSpan.textContent = currentCmd.cmd.substring(0, charIdx);
          setTimeout(typeTerminal, 30);
        } else {
          isDeleting = false;
          cmdIdx = (cmdIdx + 1) % commands.length;
          setTimeout(typeTerminal, 500);
        }
      } else {
        // Typing
        if (charIdx < currentCmd.cmd.length) {
          textSpan.textContent += currentCmd.cmd.charAt(charIdx);
          charIdx++;
          setTimeout(typeTerminal, Math.random() * 50 + 40);
        } else {
          // Done typing command, show output
          outEl = document.createElement("div");
          outEl.className = "line-fade line-fade-in out";
          outEl.innerHTML = '<span class="text">' + currentCmd.out.replace(/\n/g, '<br>') + '</span>';
          termBody.appendChild(outEl);
          
          setTimeout(function() {
            isDeleting = true;
            typeTerminal();
          }, 3000); // Wait 3 seconds before deleting
        }
      }
    }
    
    setTimeout(typeTerminal, 1500);
  }

  /* ---------- Project Horizontal Drag & Scroll ---------- */
  var scrollLeftBtn = document.getElementById("scrollLeft");
  var scrollRightBtn = document.getElementById("scrollRight");
  var projectScroller = document.getElementById("projectScroller");

  if (projectScroller) {
    var scrollAmount = 440;
    if (scrollLeftBtn && scrollRightBtn) {
      scrollLeftBtn.addEventListener("click", function () {
        projectScroller.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });
      scrollRightBtn.addEventListener("click", function () {
        projectScroller.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    }

    // Prevent native HTML5 ghost dragging on links and images inside the scroller
    projectScroller.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    var isDown = false;
    var hasDragged = false;
    var suppressClick = false;
    var startX = 0;
    var startScrollLeft = 0;
    var lastX = 0;
    var lastTime = 0;
    var velocity = 0;
    var momentumId = null;

    function stopMomentum() {
      if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
      }
    }

    projectScroller.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      stopMomentum();
      isDown = true;
      hasDragged = false;
      startX = e.clientX;
      lastX = e.clientX;
      lastTime = performance.now();
      velocity = 0;
      startScrollLeft = projectScroller.scrollLeft;
    });

    window.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (!hasDragged && Math.abs(dx) > 5) {
        hasDragged = true;
        suppressClick = true;
        projectScroller.classList.add("is-dragging");
      }
      if (!hasDragged) return;

      e.preventDefault();
      var now = performance.now();
      var dt = Math.max(1, now - lastTime);
      var instantVel = (e.clientX - lastX) / dt;
      velocity = velocity * 0.6 + instantVel * 0.4;
      lastX = e.clientX;
      lastTime = now;

      projectScroller.scrollLeft = startScrollLeft - dx;
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      projectScroller.classList.remove("is-dragging");

      // Only glide if mouse was still moving right before release
      var idleMs = performance.now() - lastTime;
      if (hasDragged && idleMs < 65 && Math.abs(velocity) > 0.2) {
        var vx = velocity * 15;
        function glide() {
          projectScroller.scrollLeft -= vx;
          vx *= 0.92;
          if (Math.abs(vx) > 0.5) {
            momentumId = requestAnimationFrame(glide);
          } else {
            momentumId = null;
          }
        }
        momentumId = requestAnimationFrame(glide);
      }

      if (hasDragged) {
        setTimeout(function () {
          suppressClick = false;
        }, 80);
      }
    }

    window.addEventListener("mouseup", endDrag);
    window.addEventListener("blur", endDrag);

    // Block accidental card link navigation right after dragging
    projectScroller.addEventListener(
      "click",
      function (e) {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick = false;
        }
      },
      true
    );
  }

})();
