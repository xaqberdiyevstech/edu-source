// EduSource page navigation and loading transition
(function(){
 const loader=document.getElementById('pageLoader');
 const labels={home:'Opening your study space...',textbooks:'Loading textbooks...',manuals:'Loading study manuals...'};
 function showLoader(route){if(!loader)return; const t=document.getElementById('loaderText'); if(t)t.textContent=labels[route]||'Loading...'; loader.classList.add('show'); loader.setAttribute('aria-hidden','false');}
 document.querySelectorAll('a[data-route]').forEach(link=>link.addEventListener('click',function(e){
  const href=this.getAttribute('href'); if(!href||href.startsWith('#'))return;
  const current=location.pathname.split('/').pop()||'index.html'; if(href===current)return;
  e.preventDefault(); showLoader(this.dataset.route); setTimeout(()=>location.href=href,380);
 }));
 window.addEventListener('pageshow',()=>{if(loader){loader.classList.remove('show');loader.setAttribute('aria-hidden','true')}});
})();

// Smooth scroll for existing in-page links
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const target=document.querySelector(a.getAttribute('href'));
  if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth'});}
}));

console.log('EduSource UI loaded');

// Global book/manual search
(function(){
  const normalize = v => String(v || '').toLowerCase().trim();
  const params = new URLSearchParams(location.search);
  const incoming = params.get('search') || '';

  function filterHome(query, announce=true){
    const q = normalize(query);
    const status = document.getElementById('searchStatus');
    const clear = document.getElementById('clearSearch');
    const data = typeof window.__eduGetData === 'function' ? window.__eduGetData() : {textbooks:[], manuals:[]};
    const all = [...data.textbooks, ...data.manuals];
    if(clear) clear.classList.toggle('hidden', !q);
    if(!all.length) return;
    if(!q){
      if(status) status.textContent='';
      if(typeof window.__eduRenderAll === 'function') window.__eduRenderAll();
      return;
    }
    const matches = all.filter(item => normalize(`${item.name} ${item.description}`).includes(q));
    if(status) status.textContent = matches.length ? `${matches.length} result${matches.length===1?'':'s'} found` : 'No books or manuals found.';
    if(typeof window.__eduRenderFiltered === 'function') window.__eduRenderFiltered(matches);
    const results = document.getElementById('textbooksContainer');
    if(results) results.scrollIntoView({behavior:'smooth', block:'start'});
  }

  const homeInput = document.getElementById('globalSearch');
  if(homeInput){
    homeInput.addEventListener('input', e => filterHome(e.target.value));
    document.getElementById('clearSearch')?.addEventListener('click', ()=>{ homeInput.value=''; filterHome(''); homeInput.focus(); });
    if(incoming){ homeInput.value=incoming; setTimeout(()=>filterHome(incoming),50); }
  }

  document.querySelectorAll('.page-search').forEach(input => {
    input.addEventListener('keydown', e => {
      if(e.key==='Enter'){
        const q=input.value.trim();
        if(q) location.href='index.html?search='+encodeURIComponent(q)+'#textbooks';
      }
    });
    input.addEventListener('input', ()=>{
      const q=normalize(input.value);
      const cards=[...document.querySelectorAll('#textbooks > div, #manuals > div')];
      let count=0;
      cards.forEach(card=>{
        const match=!q || normalize(card.textContent).includes(q);
        card.style.display=match?'':'none';
        if(match) count++;
      });
      const status=input.parentElement.parentElement.querySelector('.page-search-status');
      if(status) status.textContent=q ? (count ? `${count} result${count===1?'':'s'} on this page — press Enter to search all resources` : 'No results on this page — press Enter to search all resources') : '';
    });
  });
})();
