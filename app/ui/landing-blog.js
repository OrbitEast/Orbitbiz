/* OrbitBiz — unified homepage blog integration */
(()=>{
  "use strict";
  const addBlog=()=>{
    const apps=document.querySelector("#orbit-biz-landing .obx-section.apps");
    if(!apps || document.querySelector("#orbit-blog")) return !!apps;
    const section=document.createElement("section");
    section.id="orbit-blog";
    section.className="obx-blog-section obx-section";
    section.innerHTML=`
      <div class="section-intro"><span>BUSINESS KNOWLEDGE · ONE PLACE</span><h2>Tips, guides and questions.<br><em>All in one blog.</em></h2><p>Practical business knowledge without a scattered resource maze. Browse business tips, how-to guides and common questions from one place.</p></div>
      <div class="app-grid"><a class="app-card ac-pink" href="/resources/blog/"><i>✦</i><h3>Business Tips</h3><p>Industry-specific ideas for restaurants, retail, salons, electronics and more.</p><b>Browse tips →</b></a><a class="app-card ac-blue" href="/resources/blog/"><i>↗</i><h3>Guides & How-to</h3><p>Practical explanations for invoicing, CRM, inventory, purchasing, finance and reporting.</p><b>Read guides →</b></a><a class="app-card ac-yellow" href="/resources/blog/"><i>?</i><h3>Questions & Answers</h3><p>Clear answers to common business workflow questions, with anonymous discussion on blog posts.</p><b>Explore the blog →</b></a></div>`;
    apps.insertAdjacentElement("afterend",section);
    const footer=document.querySelector("#orbit-biz-landing .obx-footer-main");
    if(footer){
      const columns=[...footer.querySelectorAll(".obx-footer-column")];
      const operations=columns.find(c=>c.querySelector("h3")?.textContent.trim()==="Operations");
      const community=columns.find(c=>c.querySelector("h3")?.textContent.trim()==="Community");
      if(operations) operations.innerHTML='<h3>Explore</h3><a href="/features/">All features</a><a href="/features/business-management/">Business management</a><a href="/resources/blog/">Blog</a><a href="/about/">About</a>';
      if(community) community.innerHTML='<h3>Support</h3><a href="/resources/blog/">Blog discussions</a><a href="/security/">Security</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a>';
    }
    return true;
  };
  if(addBlog()) return;
  const observer=new MutationObserver(()=>{if(addBlog()) observer.disconnect();});
  observer.observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
})();