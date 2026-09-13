/* OrbitBiz — homepage blog highlights */
(()=>{
  "use strict";
  const addBlog=()=>{
    const apps=document.querySelector("#orbit-biz-landing .obx-section.apps");
    if(!apps || document.querySelector("#orbit-blog")) return !!apps;
    const section=document.createElement("section");
    section.id="orbit-blog";
    section.className="obx-blog-section";
    section.innerHTML=`
      <div class="obx-blog-head">
        <div>
          <span class="obx-blog-label">ORBITBIZ BLOG · BUSINESS KNOWLEDGE</span>
          <h2>Useful ideas for<br><em>running business better.</em></h2>
          <p>Practical business tips, answers to common questions and clear guides for everyday operations. Explore the full collection in one place.</p>
        </div>
        <a class="obx-blog-all" href="/resources/blog/">Explore the Blog →</a>
      </div>
      <div class="obx-blog-grid">
        <a class="obx-blog-card" href="/resources/guides/india/restaurant-increase-sales/">
          <span class="obx-blog-type">Business Tips</span>
          <h3>Practical ways to increase restaurant sales</h3>
          <p>Simple ideas around repeat customers, offers, operations and everyday visibility.</p>
          <b>Read article →</b>
        </a>
        <a class="obx-blog-card" href="/resources/questions/">
          <span class="obx-blog-type">Questions</span>
          <h3>Business questions, answered clearly</h3>
          <p>Find straightforward answers to common questions about invoicing, inventory, CRM and business operations.</p>
          <b>Browse questions →</b>
        </a>
        <a class="obx-blog-card" href="/resources/guides/">
          <span class="obx-blog-type">Guides</span>
          <h3>Learn the basics without the complexity</h3>
          <p>Step-by-step guides for invoices, purchases, inventory, reports and better business workflows.</p>
          <b>Browse guides →</b>
        </a>
      </div>
      <div class="obx-blog-note">Business content is provided for general informational purposes and should be adapted to your business, market and applicable requirements.</div>`;
    apps.insertAdjacentElement("afterend",section);
    return true;
  };
  if(addBlog()) return;
  const observer=new MutationObserver(()=>{if(addBlog()) observer.disconnect();});
  observer.observe(document.getElementById("app")||document.body,{childList:true,subtree:true});
})();
