(function () {
  "use strict";

  /* ---------- language toggle ---------- */
  var root = document.documentElement;
  var body = document.body;
  var toggleBtn = document.getElementById("langToggle");
  var STORAGE_KEY = "taha-site-lang";

  function applyLang(lang) {
    root.setAttribute("data-lang", lang);
    body.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "fa" ? "fa" : "en");
    root.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    
    // adjust nav pill when language changes
    setTimeout(updateNav, 100);
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === "en" || saved === "fa") applyLang(saved);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-lang") === "fa" ? "fa" : "en";
      applyLang(current === "fa" ? "en" : "fa");
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
      sec.dataset.railIndex = index;
    });
  }

  function updateNav() {
    var scrollY = window.scrollY;
    var currentId = "";

    // Adjust rail fill height
    var docHeight = document.body.clientHeight - window.innerHeight;
    if (railFill && docHeight > 0) {
      var scrolled = (scrollY / docHeight) * 100;
      railFill.style.height = scrolled + "%";
    }

    sections.forEach(function (sec) {
      var top = sec.offsetTop - 150;
      if (scrollY >= top) {
        currentId = sec.getAttribute("id");
      }
    });

    var activeAnchor = null;
    navAnchors.forEach(function (a) {
      a.classList.remove("active");
      if (a.getAttribute("data-target") === currentId) {
        a.classList.add("active");
        activeAnchor = a;
      }
    });

    // Move nav pill
    if (navPill && activeAnchor) {
      navPill.style.width = activeAnchor.offsetWidth + "px";
      if (isRtl()) {
         var parentRight = activeAnchor.parentElement.getBoundingClientRect().right;
         var activeRight = activeAnchor.getBoundingClientRect().right;
         navPill.style.left = 'auto';
         navPill.style.right = (parentRight - activeRight) + "px";
      } else {
         navPill.style.right = 'auto';
         navPill.style.left = activeAnchor.offsetLeft + "px";
      }
      navPill.style.opacity = 1;
    } else if (navPill) {
      navPill.style.opacity = 0;
    }

    // Update rail nodes
    var railNodes = document.querySelectorAll(".rail-node");
    sections.forEach(function(sec) {
      if(sec.id === currentId && sec.dataset.railIndex !== undefined) {
         railNodes.forEach(n => n.classList.remove("active"));
         if(railNodes[sec.dataset.railIndex]) {
            railNodes[sec.dataset.railIndex].classList.add("active");
         }
      }
    });
  }

  window.addEventListener("scroll", updateNav);
  window.addEventListener("resize", updateNav);
  // initial call
  setTimeout(updateNav, 100);


  /* ---------- Spotlight & mouse effects ---------- */
  var spotlight = document.getElementById("heroSpotlight");
  var cards = document.querySelectorAll(".skill-card, .contact-item");
  
  if (spotlight) {
    document.addEventListener("mousemove", function(e) {
      var x = e.clientX;
      var y = e.clientY;
      spotlight.style.setProperty("--mx", x + "px");
      spotlight.style.setProperty("--my", y + "px");
      if(!spotlight.classList.contains("active")) spotlight.classList.add("active");

      cards.forEach(function(card) {
        var rect = card.getBoundingClientRect();
        var cx = x - rect.left;
        var cy = y - rect.top;
        card.style.setProperty("--mx", cx + "px");
        card.style.setProperty("--my", cy + "px");
      });
    });
  }

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
      ctx.fillStyle = "rgba(232, 163, 61, 0.4)";
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
    var lines = [
      { prompt: "user@taha:~$ ", text: "python manage.py runserver", type: "cmd" },
      { text: "Starting development server at http://127.0.0.1:8000/", type: "out" },
      { text: "Quit the server with CONTROL-C.", type: "out" },
      { prompt: "user@taha:~$ ", text: "celery -A core worker -l info", type: "cmd" },
      { text: "[tasks]\n  . core.tasks.process_data\n  . core.tasks.send_email", type: "out" },
      { text: "celery@taha ready.", type: "out" }
    ];
    
    var lineIdx = 0;
    var charIdx = 0;
    var currentEl = null;

    function typeTerminal() {
      if (lineIdx >= lines.length) return;
      
      var lineData = lines[lineIdx];
      
      if (!currentEl) {
        currentEl = document.createElement("div");
        currentEl.className = "line-fade";
        if (lineData.type === "cmd") {
          currentEl.className += " line";
          currentEl.innerHTML = '<span class="prompt">' + lineData.prompt + '</span><span class="text"></span>';
        } else {
          currentEl.className += " out";
          currentEl.innerHTML = '<span class="text"></span>';
        }
        termBody.appendChild(currentEl);
        
        // Trigger fade in
        setTimeout(function() {
          currentEl.classList.add("line-fade-in");
        }, 50);
      }

      if (lineData.type === "cmd") {
        var textSpan = currentEl.querySelector(".text");
        if (charIdx < lineData.text.length) {
          textSpan.textContent += lineData.text.charAt(charIdx);
          charIdx++;
          setTimeout(typeTerminal, Math.random() * 50 + 30);
        } else {
          lineIdx++;
          charIdx = 0;
          currentEl = null;
          setTimeout(typeTerminal, 400);
        }
      } else {
        var textSpan = currentEl.querySelector(".text");
        textSpan.textContent = lineData.text;
        lineIdx++;
        charIdx = 0;
        currentEl = null;
        setTimeout(typeTerminal, 600);
      }
    }
    
    // Add cursor
    var cursor = document.createElement("span");
    cursor.className = "cursor";
    
    // Start after delay
    setTimeout(typeTerminal, 1800);
  }

  /* ---------- Project Horizontal Scrolling ---------- */
  var scrollLeftBtn = document.getElementById("scrollLeft");
  var scrollRightBtn = document.getElementById("scrollRight");
  var projectScroller = document.getElementById("projectScroller");

  if (scrollLeftBtn && scrollRightBtn && projectScroller) {
    var scrollAmount = 400;
    scrollLeftBtn.addEventListener("click", function() {
      var mult = isRtl() ? 1 : -1;
      projectScroller.scrollBy({ left: scrollAmount * mult, behavior: "smooth" });
    });
    scrollRightBtn.addEventListener("click", function() {
      var mult = isRtl() ? -1 : 1;
      projectScroller.scrollBy({ left: scrollAmount * mult, behavior: "smooth" });
    });
  }

})();
