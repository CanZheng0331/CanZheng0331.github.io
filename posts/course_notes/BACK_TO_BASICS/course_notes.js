(() => {
  "use strict";

  const TIER_ORDER = [
    "Advanced Topics",
    "Graduate Major Courses",
    "Undergraduate Major Courses",
    "Foundational Science"
  ];

  const TIER_Y = {
    "Advanced Topics": 112,
    "Graduate Major Courses": 272,
    "Undergraduate Major Courses": 432,
    "Foundational Science": 592
  };

  const STATE_META = {
    empty: { symbol: "\u{1F342}", label: "No resources", className: "status-empty" },
    "v1.0": { symbol: "\u{1F343}", label: "v1.0", className: "status-v10" },
    "v1.1": { symbol: "\u{1F338}", label: "v1.1", className: "status-v11" },
    "v1.2": { symbol: "\u{1F34A}", label: "v1.2", className: "status-v12" }
  };

  // Used only when the page is opened directly with file://, where browsers block fetch(courses.json).
  // GitHub Pages and local HTTP preview always use courses.json as the source of truth.
  const LOCAL_PREVIEW_DATA = {
    "workflow": [
      {
        "number": "01",
        "icon": "01",
        "title": "Select a strong course",
        "description": "Evaluate teaching quality through course structure, audience feedback, and the instructor's clarity and depth."
      },
      {
        "number": "02",
        "icon": "02",
        "title": "Collect the full learning set",
        "description": "Gather lectures, slides, textbooks, references, and simpler substitutes when key materials are unavailable."
      },
      {
        "number": "03",
        "icon": "03",
        "title": "Build the first draft",
        "description": "Use AI to synthesize the materials into a structured initial set of notes.",
        "version": "v1.0"
      },
      {
        "number": "04",
        "icon": "04",
        "title": "Refine and re-derive",
        "description": "Revise during study, then rebuild the course independently from beginning to end.",
        "versions": [
          "v1.1",
          "v1.2"
        ]
      }
    ],
    "courses": [
      {
        "id": "calculus",
        "title": "Calculus",
        "tier": "Foundational Science",
        "state": "v1.0",
        "prerequisites": [],
        "insights": "Calculus provides the language of continuous change, approximation, optimization, and accumulation used throughout engineering, physics, and machine learning.",
        "notes": [
          {
            "title": "Core Concepts",
            "description": "Limits, derivatives, integrals, and series.",
            "format": "HTML",
            "url": "notes/calculus.html"
          },
          {
            "title": "Derivation Checklist",
            "description": "Key results to reconstruct without references.",
            "format": "HTML",
            "url": "notes/calculus-derivations.html"
          }
        ],
        "recommendations": [
          {
            "title": "MIT 18.01SC Single Variable Calculus",
            "provider": "MIT OpenCourseWare",
            "description": "A complete single-variable calculus course with lectures, problem sets, and exams.",
            "links": [
              {
                "label": "Course homepage",
                "url": "https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"
              },
              {
                "label": "MIT OpenCourseWare",
                "url": "https://ocw.mit.edu/"
              }
            ]
          },
          {
            "title": "Essence of Calculus",
            "provider": "3Blue1Brown",
            "description": "A visual series focused on intuition behind the central ideas of calculus.",
            "links": [
              {
                "label": "Series homepage",
                "url": "https://www.3blue1brown.com/topics/calculus"
              }
            ]
          }
        ]
      },
      {
        "id": "signals-and-systems",
        "title": "Signals and Systems",
        "tier": "Undergraduate Major Courses",
        "state": "v1.1",
        "prerequisites": [
          "calculus"
        ],
        "insights": "This course connects mathematical foundations with communication and signal-processing systems. Its real value lies in developing time-domain, frequency-domain, and system-level intuition.",
        "notes": [
          {
            "title": "Lecture Notes",
            "description": "Continuous- and discrete-time signals, LTI systems, convolution, and transforms.",
            "format": "HTML",
            "url": "notes/signals-and-systems.html"
          },
          {
            "title": "Version History",
            "description": "Changes made while studying the course.",
            "format": "HTML",
            "url": "notes/signals-and-systems-history.html"
          },
          {
            "title": "Independent Derivations",
            "description": "Transform pairs, system properties, and reconstruction exercises.",
            "format": "HTML",
            "url": "notes/signals-and-systems-derivations.html"
          }
        ],
        "recommendations": [
          {
            "title": "Signals and Systems",
            "provider": "MIT OpenCourseWare",
            "description": "An undergraduate treatment of continuous- and discrete-time signals, systems, convolution, and Fourier analysis.",
            "links": [
              {
                "label": "Course homepage",
                "url": "https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/"
              },
              {
                "label": "MIT OpenCourseWare",
                "url": "https://ocw.mit.edu/"
              }
            ]
          },
          {
            "title": "EE102A Signals and Systems",
            "provider": "Stanford Engineering Everywhere",
            "description": "A Stanford course emphasizing linear systems, transforms, and engineering applications.",
            "links": [
              {
                "label": "Course homepage",
                "url": "https://see.stanford.edu/Course/EE102A"
              }
            ]
          }
        ]
      },
      {
        "id": "wireless-communications",
        "title": "Wireless Communications",
        "tier": "Graduate Major Courses",
        "state": "empty",
        "prerequisites": [
          "signals-and-systems"
        ],
        "insights": "Wireless communications extends communication-system reasoning into fading, diversity, channel uncertainty, and multi-user environments.",
        "notes": [
          {
            "title": "Material Queue",
            "description": "Course selection and reference collection are still in progress.",
            "format": "HTML",
            "url": "notes/wireless-communications.html"
          }
        ],
        "recommendations": [
          {
            "title": "Fundamentals of Wireless Communication",
            "provider": "David Tse and Pramod Viswanath",
            "description": "A graduate-level text and resource set covering fading, diversity, capacity, and multiuser systems.",
            "links": [
              {
                "label": "Book homepage",
                "url": "https://web.stanford.edu/~dntse/wireless_book.html"
              }
            ]
          },
          {
            "title": "Wireless Communications",
            "provider": "Andrea Goldsmith",
            "description": "A comprehensive reference on wireless channel models, capacity, modulation, coding, and diversity.",
            "links": [
              {
                "label": "Author homepage",
                "url": "https://web.stanford.edu/~andrea/"
              }
            ]
          }
        ]
      },
      {
        "id": "ai-for-wireless",
        "title": "AI for Wireless Communications",
        "tier": "Advanced Topics",
        "state": "v1.2",
        "prerequisites": [
          "signals-and-systems",
          "wireless-communications"
        ],
        "insights": "This topic examines where learning-based methods genuinely improve communication systems and where model-driven structure remains indispensable.",
        "notes": [
          {
            "title": "Course Synthesis",
            "description": "A consolidated map of model-driven and data-driven methods.",
            "format": "HTML",
            "url": "notes/ai-for-wireless.html"
          },
          {
            "title": "Independent Reconstruction",
            "description": "End-to-end derivations and critical reflections completed after the course.",
            "format": "HTML",
            "url": "notes/ai-for-wireless-reconstruction.html"
          }
        ],
        "recommendations": [
          {
            "title": "Machine Learning for Communications",
            "provider": "Selected graduate lectures",
            "description": "A curated set of lectures and tutorials on learning-assisted communication systems.",
            "links": [
              {
                "label": "Resource collection",
                "url": "https://arxiv.org/search/?query=machine+learning+for+communications&searchtype=all"
              }
            ]
          },
          {
            "title": "Model-Driven Deep Learning",
            "provider": "Tutorial and survey collection",
            "description": "Resources on combining domain models with trainable components for communication and signal-processing tasks.",
            "links": [
              {
                "label": "Search resources",
                "url": "https://arxiv.org/search/?query=model-driven+deep+learning&searchtype=all"
              }
            ]
          }
        ]
      }
    ]
  };

  const elements = {
    workflow: document.getElementById("workflow-grid"),
    viewport: document.getElementById("graph-viewport"),
    world: document.getElementById("graph-world"),
    edges: document.getElementById("graph-edges"),
    nodes: document.getElementById("graph-nodes"),
    loading: document.getElementById("loading-state"),
    search: document.getElementById("course-search"),
    treeView: document.getElementById("tree-view-button"),
    listView: document.getElementById("list-view-button"),
    list: document.getElementById("course-list"),
    zoomIn: document.getElementById("zoom-in-button"),
    zoomOut: document.getElementById("zoom-out-button"),
    zoomLabel: document.getElementById("zoom-label"),
    fit: document.getElementById("fit-button"),
    reset: document.getElementById("reset-button"),
    dialog: document.getElementById("course-dialog"),
    dialogContent: document.getElementById("dialog-content"),
    year: document.getElementById("year")
  };

  const state = {
    data: null,
    courseById: new Map(),
    positions: new Map(),
    edges: [],
    scale: 1,
    tx: 0,
    ty: 0,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    activeCourseId: null,
    view: "tree"
  };

  async function loadData() {
    try {
      const response = await fetch("courses.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`courses.json returned ${response.status}`);
      return await response.json();
    } catch (error) {
      if (location.protocol === "file:") {
        console.info("Using built-in preview data because file:// blocks JSON fetch.");
        return LOCAL_PREVIEW_DATA;
      }
      throw error;
    }
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.courses) || !Array.isArray(data.workflow)) {
      throw new Error("courses.json must contain workflow[] and courses[].");
    }

    const ids = new Set();
    data.courses.forEach((course) => {
      if (!course.id || !course.title || !course.tier) throw new Error("Each course needs id, title, and tier.");
      if (ids.has(course.id)) throw new Error(`Duplicate course id: ${course.id}`);
      ids.add(course.id);
      if (!Array.isArray(course.prerequisites)) course.prerequisites = [];
    });

    data.courses.forEach((course) => {
      course.prerequisites.forEach((id) => {
        if (!ids.has(id)) throw new Error(`${course.title} references missing prerequisite: ${id}`);
        if (id === course.id) throw new Error(`${course.title} cannot be its own prerequisite.`);
      });
    });

    detectCycles(data.courses);
    return data;
  }

  function detectCycles(courses) {
    const byId = new Map(courses.map((course) => [course.id, course]));
    const visiting = new Set();
    const visited = new Set();

    function visit(id) {
      if (visiting.has(id)) throw new Error(`Prerequisite cycle detected at ${id}.`);
      if (visited.has(id)) return;
      visiting.add(id);
      byId.get(id).prerequisites.forEach(visit);
      visiting.delete(id);
      visited.add(id);
    }

    courses.forEach((course) => visit(course.id));
  }

  function renderWorkflow(items) {
    elements.workflow.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "workflow-item";
      const versions = [item.version, ...(item.versions || [])].filter(Boolean);
      card.innerHTML = `
        <span class="workflow-number">${escapeHtml(item.number)}</span>
        <div class="workflow-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${versions.length ? `<div class="workflow-versions">${versions.map(statusBadge).join("")}</div>` : ""}
      `;
      elements.workflow.appendChild(card);
    });
  }

  function calculateLayout(courses) {
    const groups = new Map(TIER_ORDER.map((tier) => [tier, []]));
    courses.forEach((course) => {
      if (!groups.has(course.tier)) groups.set(course.tier, []);
      groups.get(course.tier).push(course);
    });

    const positions = new Map();
    groups.forEach((group, tier) => {
      if (!group.length) return;
      group.sort((a, b) => {
        const aParents = a.prerequisites.length;
        const bParents = b.prerequisites.length;
        return aParents - bParents || a.title.localeCompare(b.title);
      });

      const usableStart = 155;
      const usableEnd = 945;
      const spacing = group.length === 1 ? 0 : (usableEnd - usableStart) / (group.length - 1);
      group.forEach((course, index) => {
        const x = group.length === 1 ? 550 : usableStart + spacing * index;
        const y = TIER_Y[tier] ?? 350;
        positions.set(course.id, { x, y });
      });
    });

    improveMultiParentPlacement(courses, positions);
    return positions;
  }

  function improveMultiParentPlacement(courses, positions) {
    for (let pass = 0; pass < 3; pass += 1) {
      courses.forEach((course) => {
        if (!course.prerequisites.length) return;
        const parentPositions = course.prerequisites.map((id) => positions.get(id)).filter(Boolean);
        if (!parentPositions.length) return;
        const targetX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
        const current = positions.get(course.id);
        current.x = current.x * 0.55 + targetX * 0.45;
      });
      separateNodesByTier(courses, positions);
    }
  }

  function separateNodesByTier(courses, positions) {
    const byTier = new Map();
    courses.forEach((course) => {
      if (!byTier.has(course.tier)) byTier.set(course.tier, []);
      byTier.get(course.tier).push(course);
    });

    byTier.forEach((group) => {
      group.sort((a, b) => positions.get(a.id).x - positions.get(b.id).x);
      const minGap = 195;
      for (let i = 1; i < group.length; i += 1) {
        const previous = positions.get(group[i - 1].id);
        const current = positions.get(group[i].id);
        if (current.x - previous.x < minGap) current.x = previous.x + minGap;
      }
      if (group.length) {
        const first = positions.get(group[0].id);
        const last = positions.get(group[group.length - 1].id);
        const centerShift = 550 - (first.x + last.x) / 2;
        group.forEach((course) => {
          positions.get(course.id).x = clamp(positions.get(course.id).x + centerShift, 110, 990);
        });
      }
    });
  }

  function buildGraph(courses) {
    elements.nodes.innerHTML = "";
    elements.edges.innerHTML = "";
    state.courseById = new Map(courses.map((course) => [course.id, course]));
    state.positions = calculateLayout(courses);
    state.edges = [];

    courses.forEach((course) => {
      const position = state.positions.get(course.id);
      const meta = STATE_META[course.state] || STATE_META.empty;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "course-node";
      button.dataset.courseId = course.id;
      button.style.left = `${position.x}px`;
      button.style.top = `${position.y}px`;
      button.innerHTML = `
        <span class="node-symbol" aria-hidden="true">${meta.symbol}</span>
        <span class="node-title">${escapeHtml(course.title)}</span>
        <span class="node-status status-badge ${meta.className}">${escapeHtml(meta.label)}</span>
      `;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openCourse(course.id);
      });
      button.addEventListener("mouseenter", () => highlightCourse(course.id));
      button.addEventListener("mouseleave", clearHighlight);
      elements.nodes.appendChild(button);

      course.prerequisites.forEach((prerequisiteId, prerequisiteIndex) => {
        const from = state.positions.get(prerequisiteId);
        const to = position;
        const siblingOffset = (prerequisiteIndex - (course.prerequisites.length - 1) / 2) * 110;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add("graph-edge");
        path.dataset.from = prerequisiteId;
        path.dataset.to = course.id;
        path.setAttribute("d", createCurve(from, to, siblingOffset));
        elements.edges.appendChild(path);
        state.edges.push({ from: prerequisiteId, to: course.id, element: path });
      });
    });

    elements.edges.setAttribute("viewBox", "0 0 1100 760");
    renderList(courses);
  }

  function createCurve(from, to, offset = 0) {
    const startY = from.y - 54;
    const endY = to.y + 54;
    const middleY = (startY + endY) / 2;
    const controlX = (from.x + to.x) / 2 + offset;
    return `M ${from.x} ${startY} C ${controlX} ${middleY}, ${controlX} ${middleY}, ${to.x} ${endY}`;
  }

  function renderList(courses) {
    elements.list.innerHTML = "";
    TIER_ORDER.forEach((tier) => {
      const group = courses.filter((course) => course.tier === tier);
      if (!group.length) return;
      const section = document.createElement("section");
      section.className = "list-tier";
      section.innerHTML = `<h3>${escapeHtml(tier)}</h3><div class="list-grid"></div>`;
      const grid = section.querySelector(".list-grid");
      group.forEach((course) => {
        const meta = STATE_META[course.state] || STATE_META.empty;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "list-course";
        button.dataset.courseId = course.id;
        button.innerHTML = `<span>${meta.symbol} ${escapeHtml(course.title)}</span><span class="status-badge ${meta.className}">${escapeHtml(meta.label)}</span>`;
        button.addEventListener("click", () => openCourse(course.id));
        grid.appendChild(button);
      });
      elements.list.appendChild(section);
    });
  }

  function highlightCourse(courseId) {
    const related = new Set([courseId]);
    state.edges.forEach((edge) => {
      if (edge.from === courseId || edge.to === courseId) {
        related.add(edge.from);
        related.add(edge.to);
        edge.element.classList.add("is-highlighted");
      } else {
        edge.element.classList.add("is-dimmed");
      }
    });
    elements.nodes.querySelectorAll(".course-node").forEach((node) => {
      node.classList.toggle("is-dimmed", !related.has(node.dataset.courseId));
    });
  }

  function clearHighlight() {
    state.edges.forEach((edge) => edge.element.classList.remove("is-highlighted", "is-dimmed"));
    elements.nodes.querySelectorAll(".course-node").forEach((node) => node.classList.remove("is-dimmed"));
    applySearch();
  }

  function focusCourse(courseId, options = {}) {
    const course = state.courseById.get(courseId);
    const position = state.positions.get(courseId);
    if (!course || !position) return;

    setView("tree");
    const rect = elements.viewport.getBoundingClientRect();
    state.tx = rect.width / 2 - position.x * state.scale;
    state.ty = rect.height / 2 - position.y * state.scale;
    applyTransform();

    const node = elements.nodes.querySelector(`[data-course-id="${CSS.escape(courseId)}"]`);
    if (node) {
      node.classList.add("is-located");
      window.setTimeout(() => node.classList.remove("is-located"), 900);
    }

    if (options.open !== false) openCourse(courseId);
  }

  function openCourse(courseId) {
    const course = state.courseById.get(courseId);
    if (!course) return;
    state.activeCourseId = courseId;
    elements.nodes.querySelectorAll(".course-node").forEach((node) => {
      node.classList.toggle("is-active", node.dataset.courseId === courseId);
    });

    const meta = STATE_META[course.state] || STATE_META.empty;
    elements.dialogContent.innerHTML = `
      <div class="dialog-body">
        <h2 id="dialog-title">${escapeHtml(course.title)}</h2>
        <p class="dialog-tier">${escapeHtml(course.tier)} &middot; <span class="status-badge ${meta.className}">${escapeHtml(meta.label)}</span></p>
        <section class="dialog-section">
          <h3>Insights</h3>
          <p>${escapeHtml(cleanText(course.insights) || "No insights have been recorded yet.")}</p>
        </section>
        <section class="dialog-section">
          <h3>Prerequisites</h3>
          <div class="prerequisite-list">${renderPrerequisites(course.prerequisites)}</div>
        </section>
        <section class="dialog-section">
          <h3>Textbooks</h3>
          <div class="dialog-items textbook-list">${renderTextbooks(course.recommendations)}</div>
        </section>
        <section class="dialog-section">
          <h3>Courses</h3>
          <div class="recommendation-list">${renderRecommendations(course.recommendations, course.notes)}</div>
        </section>
      </div>
    `;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else elements.dialog.setAttribute("open", "");
    window.requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY);
    });
  }

  function renderPrerequisites(ids) {
    if (!Array.isArray(ids) || !ids.length) return `<span class="prerequisite-empty">None</span>`;
    return ids.map((id) => {
      const course = state.courseById.get(id);
      return `<button class="prerequisite-chip" type="button" data-prerequisite-id="${escapeHtml(id)}"><span class="prerequisite-dot" aria-hidden="true"></span>${escapeHtml(course?.title || id)}</button>`;
    }).join("");
  }

  function renderNotes(items) {
    const validItems = Array.isArray(items) ? items.filter((item) => !isPlaceholderItem(item)) : [];
    if (!validItems.length) return `<div class="dialog-item"><span>No notes have been recorded yet.</span></div>`;
    return validItems.map((item) => {
      if (typeof item === "string") return `<div class="dialog-item"><strong>${escapeHtml(item)}</strong></div>`;
      const title = escapeHtml(item.title || "Untitled");
      const description = item.description ? `<span>${escapeHtml(item.description)}</span>` : "";
      const format = item.format ? `<small class="resource-format">${escapeHtml(item.format)}</small>` : "";
      if (!item.url) return `<div class="dialog-item resource-card"><div><strong>${title}</strong>${description}</div>${format}</div>`;
      return `<a class="dialog-item resource-card resource-link" href="${escapeAttribute(item.url)}" target="_blank" rel="noopener noreferrer"><div><strong>${title}</strong>${description}</div><div class="resource-action">${format}<span>Open in new tab</span></div></a>`;
    }).join("");
  }

  function courseNoteLinks(items) {
    if (!Array.isArray(items) || !items.length) return "";
    return items
      .filter((item) => item && typeof item !== "string" && item.url && !isPlaceholder(item.url))
      .map((item) => {
        const title = item.title || "Notes";
        return {
          label: "Notes",
          url: item.url,
          iconClass: item.format && String(item.format).toLowerCase().includes("pdf") ? "fas fa-file-pdf" : "fas fa-book-open",
          title
        };
      });
  }

  function renderTextbooks(items) {
    const books = [];
    if (Array.isArray(items)) {
      items.forEach((item) => {
        (Array.isArray(item?.links) ? item.links : []).forEach((link) => {
          const label = String(link?.label || "");
          const url = String(link?.url || "");
          if (label.toLowerCase().includes("book") || url.toLowerCase().includes("book")) {
            books.push(link);
          }
        });
      });
    }
    if (!books.length) return `<div class="dialog-item"><span>No textbooks have been recorded yet.</span></div>`;
    return books.map((book) => {
      const label = book.label || "Open textbook";
      if (!book.url) return `<div class="dialog-item"><strong>${escapeHtml(label)}</strong></div>`;
      return `<a class="dialog-item resource-card resource-link" href="${escapeAttribute(book.url)}" target="_blank" rel="noopener noreferrer"><div><strong>${escapeHtml(label)}</strong></div><div class="resource-action"><small class="resource-format">BOOK</small><span>Open in new tab</span></div></a>`;
    }).join("");
  }

  function renderRecommendations(items, notes) {
    const validItems = Array.isArray(items) ? items.filter((item) => !isPlaceholderItem(item)) : [];
    if (!validItems.length) return `<div class="dialog-item"><span>No recommendations have been recorded yet.</span></div>`;
    const appendedNoteLinks = courseNoteLinks(notes);
    return validItems.map((item) => {
      if (typeof item === "string") return `<div class="dialog-item"><strong>${escapeHtml(item)}</strong></div>`;
      const links = [
        ...(Array.isArray(item.links) ? item.links.filter((link) => !isPlaceholderItem(link)) : []),
        ...appendedNoteLinks
      ];
      const linksHtml = links.length
        ? `<div class="recommendation-links">${links.map((link) => {
          const label = link.label || "Open resource";
          const title = link.title || label;
          return `<a href="${escapeAttribute(link.url || "#")}" target="_blank" rel="noopener noreferrer" title="${escapeAttribute(title)}"><i class="${link.iconClass || resourceIconClass(link)}" aria-hidden="true"></i><span>${escapeHtml(label)}</span></a>`;
        }).join("")}</div>`
        : `<p class="recommendation-empty">No links have been added.</p>`;
      return `<article class="recommendation-card">
        <button class="recommendation-summary" type="button" aria-expanded="false">
          <span><strong>${escapeHtml(item.title || "Untitled")}</strong>${item.provider ? `<small>${escapeHtml(item.provider)}</small>` : ""}</span>
          <span class="recommendation-toggle" aria-hidden="true"></span>
        </button>
        <div class="recommendation-reveal"><div class="recommendation-reveal-inner">
          <div class="recommendation-content">${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}${linksHtml}</div>
        </div></div>
      </article>`;
    }).join("");
  }

  function resourceIconClass(link) {
    const label = String(link?.label || "").toLowerCase();
    const url = String(link?.url || "").toLowerCase();
    if (label.includes("youtube") || url.includes("youtube.com") || url.includes("youtu.be")) return "fa-brands fa-youtube";
    if (label.includes("bilibili") || url.includes("bilibili.com")) return "fa-brands fa-bilibili";
    if (label.includes("github") || url.includes("github.com")) return "fa-brands fa-github";
    if (label.includes("slides") || label.includes("slide")) return "fas fa-display";
    if (label.includes("book")) return "fas fa-book-open";
    if (label.includes("information") || label.includes("homepage") || label.includes("course")) return "fas fa-circle-info";
    if (url.endsWith(".pdf")) return "fas fa-file-pdf";
    return "fas fa-arrow-up-right-from-square";
  }

  function isPlaceholder(value) {
    const normalized = String(value || "").trim().replace(/[.\s]+$/g, "").toUpperCase();
    return !normalized || normalized === "NULL" || normalized === "NONE";
  }

  function isPlaceholderItem(item) {
    if (!item) return true;
    if (typeof item === "string") return isPlaceholder(item);
    const values = [item.title, item.label, item.url, item.description, item.provider];
    return values.some((value) => value !== undefined) && values.every(isPlaceholder);
  }

  function cleanText(value) {
    return isPlaceholder(value) ? "" : String(value);
  }

  function escapeAttribute(value) {
    return escapeHtml(String(value)).replace(/`/g, "&#96;");
  }

  function statusBadge(version) {
    const meta = STATE_META[version] || STATE_META.empty;
    return `<span class="status-badge ${meta.className}">${escapeHtml(meta.label)}</span>`;
  }

  function applyTransform() {
    state.scale = clamp(state.scale, 0.45, 1.8);
    elements.world.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
    elements.zoomLabel.textContent = `${Math.round(state.scale * 100)}%`;
  }

  function resetView() {
    state.scale = 1;
    state.tx = 0;
    state.ty = 0;
    fitGraph();
  }

  function fitGraph() {
    const rect = elements.viewport.getBoundingClientRect();
    const padding = 34;
    const scaleX = (rect.width - padding * 2) / 1100;
    const scaleY = (rect.height - padding * 2) / 760;
    state.scale = clamp(Math.min(scaleX, scaleY), 0.45, 1.15);
    state.tx = (rect.width - 1100 * state.scale) / 2;
    state.ty = (rect.height - 760 * state.scale) / 2;
    applyTransform();
  }

  function zoomAt(clientX, clientY, factor) {
    const rect = elements.viewport.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;
    const worldX = (pointX - state.tx) / state.scale;
    const worldY = (pointY - state.ty) / state.scale;
    const nextScale = clamp(state.scale * factor, 0.45, 1.8);
    state.tx = pointX - worldX * nextScale;
    state.ty = pointY - worldY * nextScale;
    state.scale = nextScale;
    applyTransform();
  }

  function setView(view) {
    state.view = view;
    const tree = view === "tree";
    elements.viewport.hidden = !tree;
    elements.list.hidden = tree;
    elements.treeView.classList.toggle("is-active", tree);
    elements.listView.classList.toggle("is-active", !tree);
    elements.treeView.setAttribute("aria-pressed", String(tree));
    elements.listView.setAttribute("aria-pressed", String(!tree));
  }

  function applySearch() {
    const query = elements.search.value.trim().toLowerCase();
    elements.nodes.querySelectorAll(".course-node").forEach((node) => {
      const course = state.courseById.get(node.dataset.courseId);
      const match = !query || course.title.toLowerCase().includes(query) || course.tier.toLowerCase().includes(query);
      node.classList.toggle("is-dimmed", !match);
    });
    elements.list.querySelectorAll(".list-course").forEach((button) => {
      const course = state.courseById.get(button.dataset.courseId);
      button.hidden = Boolean(query) && !course.title.toLowerCase().includes(query) && !course.tier.toLowerCase().includes(query);
    });
  }

  function bindInteractions() {
    elements.viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".course-node")) return;
      state.dragging = true;
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.startTx = state.tx;
      state.startTy = state.ty;
      elements.viewport.classList.add("is-dragging");
      elements.viewport.setPointerCapture(event.pointerId);
    });

    elements.viewport.addEventListener("pointermove", (event) => {
      if (!state.dragging || event.pointerId !== state.pointerId) return;
      state.tx = state.startTx + event.clientX - state.startX;
      state.ty = state.startTy + event.clientY - state.startY;
      applyTransform();
    });

    function stopDragging(event) {
      if (!state.dragging || event.pointerId !== state.pointerId) return;
      state.dragging = false;
      state.pointerId = null;
      elements.viewport.classList.remove("is-dragging");
      if (elements.viewport.hasPointerCapture(event.pointerId)) elements.viewport.releasePointerCapture(event.pointerId);
    }

    elements.viewport.addEventListener("pointerup", stopDragging);
    elements.viewport.addEventListener("pointercancel", stopDragging);
    elements.viewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.1 : 0.9);
    }, { passive: false });

    elements.zoomIn.addEventListener("click", () => {
      const rect = elements.viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.12);
    });
    elements.zoomOut.addEventListener("click", () => {
      const rect = elements.viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.88);
    });
    elements.fit.addEventListener("click", fitGraph);
    elements.reset.addEventListener("click", resetView);
    elements.treeView.addEventListener("click", () => setView("tree"));
    elements.listView.addEventListener("click", () => setView("list"));
    elements.search.addEventListener("input", applySearch);
    elements.dialog.addEventListener("close", () => {
      state.activeCourseId = null;
      elements.nodes.querySelectorAll(".course-node").forEach((node) => node.classList.remove("is-active"));
    });

    elements.dialog.addEventListener("click", (event) => {
      const recommendationSummary = event.target.closest(".recommendation-summary");
      if (recommendationSummary) {
        const card = recommendationSummary.closest(".recommendation-card");
        const willOpen = !card.classList.contains("is-open");
        card.classList.toggle("is-open", willOpen);
        recommendationSummary.setAttribute("aria-expanded", String(willOpen));
        return;
      }

      const prerequisite = event.target.closest("[data-prerequisite-id]");
      if (!prerequisite) return;
      event.preventDefault();
      const courseId = prerequisite.dataset.prerequisiteId;
      if (elements.dialog.open) elements.dialog.close();
      window.setTimeout(() => focusCourse(courseId), 80);
    });
    window.addEventListener("resize", () => {
      if (state.view === "tree") fitGraph();
    });
  }

  function showError(error) {
    elements.loading.hidden = false;
    elements.loading.classList.add("error");
    elements.loading.innerHTML = `<div><strong>Unable to load the course map.</strong><br>${escapeHtml(error.message)}<br><small>When testing locally, use a small HTTP server or keep the included preview fallback.</small></div>`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  async function init() {
    elements.year.textContent = new Date().getFullYear();
    bindInteractions();
    try {
      const data = validateData(await loadData());
      state.data = data;
      renderWorkflow(data.workflow);
      buildGraph(data.courses);
      elements.loading.hidden = true;
      requestAnimationFrame(fitGraph);
    } catch (error) {
      console.error(error);
      showError(error);
    }
  }

  init();
})();
