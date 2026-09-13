/* OrbitBiz — boot indicator for the application shell. Public SEO pages never load this script. */
(()=>{
  const id='orbit-boot';
  const show=()=>{const x=document.getElementById(id);if(!x)return;x.classList.remove('is-hidden')};
  const hide=()=>document.getElementById(id)?.classList.add('is-hidden');
  show();
  const settle=()=>setTimeout(hide,180);
  window.addEventListener('load',settle,{once:true});
  window.addEventListener('pageshow',settle);
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href]');
    if(a&&a.target!=='_blank'&&a.origin===location.origin&&a.href!==location.href)show();
  },{capture:true});
  window.OrbitBoot={show,hide};
})();
