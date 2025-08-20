
// Simple blog loader for GitHub Pages
const listEl = document.getElementById('post-list');
const titleEl = document.getElementById('post-title');
const contentEl = document.getElementById('post-content');

async function loadList(){
  try{
    const res = await fetch('posts/posts.json');
    const data = await res.json();
    const ul = document.createElement('ul');
    data.posts.forEach(p=>{
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `blog.html?p=${encodeURIComponent(p.slug)}`;
      a.textContent = p.title + (p.date ? ` — ${p.date}` : '');
      li.appendChild(a);
      ul.appendChild(li);
    });
    listEl.innerHTML = '';
    listEl.appendChild(ul);
  }catch(e){
    listEl.innerHTML = '<small class="muted">Failed to load posts.json</small>';
  }
}

async function loadPost(slug){
  try{
    const md = await fetch(`posts/${slug}.md`).then(r=>r.text());
    // Render Markdown
    const html = marked.parse(md, {mangle:false, headerIds:true});
    contentEl.innerHTML = html;
    // Typeset LaTeX
    if(window.MathJax && window.MathJax.typesetPromise){
      await MathJax.typesetPromise();
    }
  }catch(e){
    contentEl.innerHTML = '<p><small class="muted">Post not found.</small></p>';
  }
}

function getQuery(name){
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

(async function init(){
  await loadList();
  const slug = getQuery('p') || 'hello-world';
  // Update title from posts.json if available
  try{
    const data = await fetch('posts/posts.json').then(r=>r.json());
    const meta = data.posts.find(x=>x.slug===slug);
    if(meta){ titleEl.textContent = meta.title; }
    else{ titleEl.textContent = slug; }
  }catch{}
  await loadPost(slug);
})();
