// Legacy helper for simple blog pages. The active blog/post pages now use
// posts/posts.json as the single source of truth.
const listEl = document.getElementById('post-list');
const titleEl = document.getElementById('post-title');
const contentEl = document.getElementById('post-content');

function normalizePost(post) {
  const id = post.id || post.slug;
  return {
    ...post,
    id,
    tags: Array.isArray(post.tags) ? post.tags : [],
    file: post.file || `posts/${id}.md`
  };
}

async function loadList() {
  try {
    const res = await fetch('posts/posts.json');
    const data = await res.json();
    const ul = document.createElement('ul');
    data.posts.map(normalizePost).forEach((post) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `blog.html?id=${encodeURIComponent(post.id)}`;
      a.textContent = post.title + (post.date ? ` - ${post.date}` : '');
      li.appendChild(a);
      ul.appendChild(li);
    });
    listEl.innerHTML = '';
    listEl.appendChild(ul);
  } catch (e) {
    listEl.innerHTML = '<small class="muted">Failed to load posts.json</small>';
  }
}

async function loadPost(id) {
  try {
    const data = await fetch('posts/posts.json').then(r => r.json());
    const post = data.posts.map(normalizePost).find(x => x.id === id);
    if (!post || post.file.toLowerCase().endsWith('.pdf')) {
      contentEl.innerHTML = '<p><small class="muted">Post not found.</small></p>';
      return;
    }
    const md = await fetch(post.file).then(r => r.text());
    const html = marked.parse(md, { mangle: false, headerIds: true });
    contentEl.innerHTML = html;
    if (window.MathJax && window.MathJax.typesetPromise) {
      await MathJax.typesetPromise();
    }
  } catch (e) {
    contentEl.innerHTML = '<p><small class="muted">Post not found.</small></p>';
  }
}

function getQuery(name) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

(async function init() {
  await loadList();
  const id = getQuery('id') || getQuery('p') || 'hello-world';
  try {
    const data = await fetch('posts/posts.json').then(r => r.json());
    const meta = data.posts.map(normalizePost).find(x => x.id === id);
    titleEl.textContent = meta ? meta.title : id;
  } catch {}
  await loadPost(id);
})();
