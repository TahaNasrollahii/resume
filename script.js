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
      sec.dataset.railIndex = index - 1;
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
      var rect = sec.getBoundingClientRect();
      // If the top of the section is within the top half of the screen
      if (rect.top <= window.innerHeight * 0.5) {
        currentId = sec.getAttribute("id");
      }
    });

    // Fallback: if we are at the very bottom, make sure the last section is active
    // in case it's too short to reach the 50% threshold
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
    var commands = [
      {
        cmd: "python manage.py runserver",
        out: "Starting development server at http://127.0.0.1:8000/\nQuit the server with CONTROL-C."
      },
      {
        cmd: "celery -A core worker -l info",
        out: "[tasks]\n  . core.tasks.process_data\n  . core.tasks.send_email\ncelery@taha ready."
      },
      {
        cmd: "docker compose up -d",
        out: "✔ Container redis-cache   Started\n✔ Container postgres-db   Started\n✔ Container web-api       Started"
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
