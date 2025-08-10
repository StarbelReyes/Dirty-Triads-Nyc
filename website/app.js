    // ===== Gate logic =====
    document.addEventListener('DOMContentLoaded', () => {
      const gate = document.getElementById('logo-gate');
      const enterBtn = document.getElementById('enterBtn');
      const STORAGE_KEY = 'dt_entered_v1';
      const ALWAYS_SHOW_GATE = false;

      function openSite(){
        if(!gate) return;
        gate.setAttribute('hidden','');
        document.body.style.overflow='auto';
        try{ if(!ALWAYS_SHOW_GATE) sessionStorage.setItem(STORAGE_KEY,'1'); }catch(e){}
      }

      // lock scroll while gate is up
      document.body.style.overflow='hidden';

      // skip if already entered this tab session
      try{ if(!ALWAYS_SHOW_GATE && sessionStorage.getItem(STORAGE_KEY)==='1'){ openSite(); } }catch(e){}

      enterBtn && enterBtn.addEventListener('click', openSite);

      // optional: Enter key opens site
      document.addEventListener('keydown',(e)=>{ if(e.key==='Enter' && gate && !gate.hasAttribute('hidden')) openSite(); });

      // footer year
      const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();

      (function(){
        const header = document.querySelector('.navbar');
        const btn = document.getElementById('hamburger');
        const menu = document.getElementById('primary-nav');
        const dim  = header.querySelector('.nav-dim');
    
        // lock scroll helpers
        const lock = () => document.body.style.overflow = 'hidden';
        const unlock = () => document.body.style.overflow = '';
    
        function openMenu(){
          header.classList.add('is-open');
          btn.setAttribute('aria-expanded','true');
          dim.hidden = false;
          lock();
          // move focus into menu (first link)
          const firstLink = menu.querySelector('a');
          if(firstLink) firstLink.focus();
        }
    
        function closeMenu(){
          header.classList.remove('is-open');
          btn.setAttribute('aria-expanded','false');
          dim.hidden = true;
          unlock();
          btn.focus();
        }
    
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') === 'true';
          open ? closeMenu() : openMenu();
        });
    
        // close on backdrop click
        dim.addEventListener('click', closeMenu);
    
        // close when a link is clicked (navigate)
        menu.addEventListener('click', (e) => {
          if(e.target.matches('a')) closeMenu();
        });
    
        // close on Escape
        document.addEventListener('keydown', (e) => {
          if(e.key === 'Escape') closeMenu();
        });
    
        // reduce hover-jump on touch devices
        if (window.matchMedia('(hover: none)').matches) {
          document.documentElement.classList.add('touch');
        }
      })();
    });