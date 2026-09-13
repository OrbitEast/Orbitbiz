/* OrbitBiz — public landing page */
(()=>{
  "use strict";
  const root=document.getElementById("app");
  if(!root)return;
  const goAuth=(mode="signin")=>window.dispatchEvent(new CustomEvent("orbitbiz:auth-request",{detail:{mode}}));
  const render=()=>{root.innerHTML=`
  <section id="orbit-biz-landing" class="obx-landing">
    <nav class="obx-nav">
      <a class="obx-brand" href="#top" aria-label="OrbitBiz home"><img src="assets/orbiteastfavicon.png" alt=""><span>OrbitBiz</span></a>
      <div class="obx-links"><a href="#apps">Apps</a><a href="#workflow">How it works</a><a href="#why">Why OrbitBiz</a></div>
      <button class="obx-login" data-signin>Login with Google <span>↗</span></button>
      <button class="obx-menu" aria-label="Open menu">☰</button>
    </nav>

    <main id="top">
      <section class="obx-hero">
        <div class="obx-blob blob-pink"></div><div class="obx-blob blob-blue"></div><div class="obx-blob blob-yellow"></div>
        <div class="obx-doodle doodle-star">✦</div><div class="obx-doodle doodle-spark">✧</div><div class="obx-doodle doodle-smile">⌣</div>
        <div class="obx-hero-copy">
          <div class="obx-pill"><span></span> Free business tools from Orbit East</div>
          <h1>Create invoices.<br><em>Run business simply.</em></h1>
          <p>OrbitBiz is a web-based business management and invoicing workspace built to make everyday business work easier to understand. Start with invoicing, then connect customers, sales, stock, purchases, payments and reports as your needs grow.</p>
          <div class="obx-actions"><button class="obx-primary" data-signup>Create your first invoice <b>→</b></button><button class="obx-secondary" data-signin>Login with Google</button></div>
          <div class="obx-proof"><span>✦</span> OrbitBiz · Orbit Business · Built by Orbit East · Assam, India</div>
        </div>
        <div class="obx-scene" aria-label="OrbitBiz workspace preview">
          <div class="float-card fc-note"><b>Nice!</b><span>Payment received</span><strong>+ ₹8,900</strong></div>
          <div class="float-card fc-stock"><span class="mini-icon">◈</span><b>Stock</b><small>Healthy</small></div>
          <div class="float-card fc-customer"><span>◎</span><div><b>New customer</b><small>Just added</small></div></div>
          <div class="obx-window">
            <div class="window-top"><span></span><span></span><span></span><i>OrbitBiz / Overview</i></div>
            <div class="window-body">
              <aside><div class="mini-brand"><img src="assets/orbiteastfavicon.png" alt=""> OrbitBiz</div><div class="side-active">⌂ Overview</div><div>◎ CRM</div><div>↗ Sales</div><div>◈ Inventory</div><div>⌁ Purchases</div><div>₹ Finance</div></aside>
              <div class="dash"><div class="dash-head"><div><small>MONDAY, SEPTEMBER 10</small><h3>Good morning ✨</h3></div><button>＋ New</button></div>
                <div class="kpis"><div><small>Revenue</small><b>₹2,84,500</b><em>↗ 12.4%</em></div><div><small>Receivables</small><b>₹48,200</b><em>8 invoices</em></div><div><small>Expenses</small><b>₹96,400</b><em>This month</em></div></div>
                <div class="dash-grid"><div class="chart"><div><b>Revenue</b><small>Last 30 days</small></div><svg viewBox="0 0 520 150" preserveAspectRatio="none"><path d="M0 125 C55 118 60 92 110 100 S165 68 210 85 S260 42 310 60 S370 28 410 48 S465 15 520 25" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M0 125 C55 118 60 92 110 100 S165 68 210 85 S260 42 310 60 S370 28 410 48 S465 15 520 25 V150 H0Z" opacity=".08"/></svg></div>
                <div class="attention"><b>Needs attention</b><span>3 overdue invoices <strong>₹18,450</strong></span><span>7 products low in stock <strong>→</strong></span><span>5 payments received <strong>₹32,800</strong></span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="obx-marquee"><div>INVOICING <i>✦</i> CRM <i>✦</i> SALES <i>✦</i> INVENTORY <i>✦</i> FINANCE <i>✦</i> REPORTS <i>✦</i> CUSTOMERS <i>✦</i> PAYMENTS <i>✦</i> </div></section>

      <section class="obx-section apps" id="apps"><div class="section-intro"><span>START SIMPLE · GROW WHEN YOU NEED</span><h2>One invoice today.<br><em>A connected business tomorrow.</em></h2><p>OrbitBiz is designed to be useful at the beginning and grow into a broader business workspace as your operations become more complex.</p></div>
        <div class="app-grid"><a class="app-card ac-blue" href="/features/invoicing/"><i>↗</i><h3>Invoicing</h3><p>Create structured invoices and keep payment and customer history connected.</p><b>Explore →</b></a><a class="app-card ac-pink" href="/features/crm/"><i>◎</i><h3>CRM</h3><p>Keep customer information and business activity in context.</p><b>Explore →</b></a><a class="app-card ac-yellow" href="/features/inventory/"><i>◈</i><h3>Inventory</h3><p>Know what you have, what moved and what needs attention.</p><b>Explore →</b></a><a class="app-card ac-purple" href="/features/finance/"><i>₹</i><h3>Finance</h3><p>See expenses, payments and business money clearly.</p><b>Explore →</b></a><a class="app-card ac-green" href="/features/purchases/"><i>⌁</i><h3>Purchases</h3><p>Keep vendors, buying and incoming stock organised.</p><b>Explore →</b></a><a class="app-card ac-orange" href="/features/reports/"><i>▥</i><h3>Reports</h3><p>Turn everyday activity into useful business information.</p><b>Explore →</b></a></div></section>

      <section class="obx-flow" id="workflow"><div class="flow-copy"><span>THE MAGIC IS THE CONNECTION</span><h2>Enter it once.<br><em>Watch it travel.</em></h2><p>A customer can lead to a quotation, a quotation can become a sale, and a sale can connect to an invoice, stock movement and payment. The aim is to reduce repeated entry and make the relationships between business records clear.</p><button data-signup>Build your workspace →</button></div><div class="flow-board"><div class="flow-line"></div><div class="flow-item fi-1"><small>01</small><b>Customer</b><span>◎ Relationship</span></div><div class="flow-item fi-2"><small>02</small><b>Quotation</b><span>↗ Opportunity</span></div><div class="flow-item fi-3"><small>03</small><b>Invoice</b><span>▤ Transaction</span></div><div class="flow-item fi-4"><small>04</small><b>Payment</b><span>✓ Complete</span></div></div></section>

      <section class="obx-why" id="why"><div class="why-sticker">LESS<br>CHAOS<br><span>MORE</span><br>CLARITY ✦</div><div class="why-copy"><span>WHY ORBITBIZ</span><h2>Powerful underneath.<br><em>Simple on top.</em></h2><p>Many businesses need useful invoicing and business tools without the cost or complexity that can make software difficult to adopt. OrbitBiz is being built around accessibility, clarity and connected workflows.</p><div class="why-points"><div><b>↗</b><strong>Start with invoicing</strong><span>Build structured invoices without needing to understand a large business system first.</span></div><div><b>✦</b><strong>Grow into connected tools</strong><span>Add customers, sales, inventory, purchasing, finance and reports as the business needs them.</span></div><div><b>⌘</b><strong>Designed for accessibility</strong><span>The product is currently free and is being developed to make practical business software easier to access.</span></div></div></div></section>

      <section class="obx-cta"><div class="cta-dots"></div><span>ORBITBIZ · ORBIT EAST</span><h2>Your business.<br><em>One orbit.</em></h2><p>Start with a practical business task such as invoicing, then move into a connected workspace when you need more. OrbitBiz is currently free while it continues to develop.</p><button data-signup>Create your free workspace <b>↗</b></button><small>Based in Assam, India · Built for the web · Currently free</small></section>
    </main>

    <footer class="obx-footer">
      <div class="obx-footer-main">
        <div class="obx-footer-brand"><a href="#top" aria-label="OrbitBiz home"><img src="assets/orbiteastfavicon.png" alt=""><span>OrbitBiz</span></a><p>Connected business management and invoicing tools from Orbit East, designed to make everyday business work more accessible and understandable.</p><div class="obx-footer-brandline">OrbitBiz · Orbit Business · Built by Orbit East</div><div class="obx-footer-location">📍 Assam, India</div></div>
        <div class="obx-footer-column"><h3>Product</h3><a href="/features/">All features</a><a href="/features/business-management/">Business management</a><a href="/features/invoicing/">Invoicing</a><a href="/features/crm/">CRM</a><a href="/features/inventory/">Inventory</a><a href="/features/sales/">Sales</a></div>
        <div class="obx-footer-column"><h3>Operations</h3><a href="/features/purchases/">Purchases</a><a href="/features/finance/">Finance</a><a href="/features/reports/">Reports</a><a href="/resources/">Resources</a><a href="/resources/guides/">Guides</a><a href="/resources/glossary/">Glossary</a></div>
        <div class="obx-footer-column"><h3>Community</h3><a href="/resources/questions/">Questions</a><a href="/resources/guides/">Tutorials & guides</a><a href="/about/">About OrbitBiz</a><a href="/security/">Security</a><a href="/contact/">Contact</a></div>
        <div class="obx-footer-column"><h3>Company</h3><a href="mailto:support.orbiteast@gmail.com">support.orbiteast@gmail.com</a><a href="https://www.instagram.com/orbiteast?stkn=MXBxa21xcXI0a2k1OQ==" target="_blank" rel="noopener noreferrer">Instagram · @orbiteast</a><a href="/about/">Our company</a><a href="/security/">Security</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><button class="obx-footer-login" data-signin>Login ↗</button></div>
      </div>
      <div class="obx-footer-bottom"><span>© 2026 Orbit East · Assam, India · OrbitBiz is a connected business management web app.</span><div><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/security/">Security</a></div></div>
    </footer>
  </section>`;
    root.querySelectorAll("[data-signin]").forEach(b=>b.addEventListener("click",()=>goAuth("signin")));
    root.querySelectorAll("[data-signup]").forEach(b=>b.addEventListener("click",()=>goAuth("signup")));
    root.querySelector(".obx-menu")?.addEventListener("click",()=>root.querySelector(".obx-links")?.classList.toggle("open"));
  };
  render();
})();