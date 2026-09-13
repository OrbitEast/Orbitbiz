/* OrbitBiz — invoice PDF templates, preview and WhatsApp sharing. */
(() => {
  "use strict";
  const core = window.OrbitBiz = window.OrbitBiz || {};
  const w = core.workspace = core.workspace || {};

  const fmtDate = value => value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const money = (value, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2
      }).format(Number(value || 0));
    } catch (_) {
      return `${currency || "INR"} ${Number(value || 0).toFixed(2)}`;
    }
  };

  const templates = {
    classic: { label: "Classic", accent: [31, 41, 55], fill: [243, 244, 246], premium: false },
    modern: { label: "Modern", accent: [37, 99, 235], fill: [239, 246, 255], premium: false },
    orbit: { label: "Orbit Color", accent: [124, 58, 237], fill: [245, 243, 255], premium: false },
    executive: { label: "Executive", accent: [15, 118, 110], fill: [240, 253, 250], premium: true },
    editorial: { label: "Editorial", accent: [180, 83, 9], fill: [255, 247, 237], premium: true },
    studio: { label: "Studio", accent: [219, 39, 119], fill: [253, 242, 248], premium: true }
  };

  const loadBusiness = async state => {
    const result = await w.db().from("businesses").select("*").eq("id", state.businessId).maybeSingle();
    if (result.error) throw result.error;
    return result.data || {};
  };

  const isPremium = state => Boolean(
    state?.user?.isPremium ||
    state?.profile?.isPremium ||
    (state?.subscription?.plan && state.subscription.plan !== "free")
  );

  const textValue = value => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      return [value.line1, value.line2, value.street, value.area, value.city, value.state, value.postal_code, value.pincode, value.country]
        .filter(Boolean).join(", ");
    }
    return String(value);
  };

  const ensurePdfEngine = async () => {
    let JsPDF = window.jspdf?.jsPDF;
    let probe = typeof JsPDF === "function" ? new JsPDF({ unit: "mm", format: "a4" }) : null;

    if (typeof JsPDF !== "function" || typeof probe?.autoTable !== "function") {
      throw new Error("PDF engine is unavailable. Reload the page and try again.");
    }

    return JsPDF;
  };

  const makePdf = async (data, business, theme, branding = true) => {
    const JsPDF = await ensurePdfEngine();
    const doc = new JsPDF({ unit: "mm", format: "a4" });
    const t = templates[theme] || templates.classic;
    const [r, g, bl] = t.accent;
    const total = Number(data.invoice?.total || 0);
    const currency = business.currency || "INR";
    const address = textValue(business.address);
    const customerAddress = textValue(data.customer?.billing_address);

    doc.setFillColor(r, g, bl);
    doc.rect(0, 0, 210, 8, "F");
    doc.setTextColor(r, g, bl);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(String(business.name || "Business").slice(0, 42), 15, 24);

    doc.setTextColor(70, 78, 90);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    let y = 30;
    [business.legal_name, address, business.email, business.phone, business.gstin ? `GSTIN: ${business.gstin}` : null]
      .filter(Boolean)
      .forEach(value => {
        const lines = doc.splitTextToSize(String(value), 80).slice(0, 2);
        doc.text(lines, 15, y);
        y += Math.max(4, lines.length * 3.5);
      });

    doc.setTextColor(r, g, bl);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 195, 23, { align: "right" });
    doc.setTextColor(40, 45, 55);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(String(data.invoice?.invoice_number || "Invoice"), 195, 30, { align: "right" });
    doc.text(`Issued ${fmtDate(data.invoice?.issue_date)}`, 195, 35, { align: "right" });
    if (data.invoice?.due_date) doc.text(`Due ${fmtDate(data.invoice.due_date)}`, 195, 40, { align: "right" });

    doc.setFillColor(...t.fill);
    doc.roundedRect(15, 50, 180, 31, 3, 3, "F");
    doc.setTextColor(90, 98, 110);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 20, 57);
    doc.setTextColor(35, 40, 50);
    doc.setFontSize(10);
    doc.text(String(data.customer?.name || "Customer").slice(0, 45), 20, 63);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let cy = 68;
    [data.customer?.company_name, customerAddress, data.customer?.email, data.customer?.phone, data.customer?.gstin ? `GSTIN: ${data.customer.gstin}` : null]
      .filter(Boolean)
      .forEach(value => {
        const lines = doc.splitTextToSize(String(value), 78).slice(0, 2);
        doc.text(lines, 20, cy);
        cy += Math.max(3.7, lines.length * 3.3);
      });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(90, 98, 110);
    doc.text("STATUS", 155, 57);
    doc.setTextColor(35, 40, 50);
    doc.text(String(data.status || data.invoice?.status || "draft").toUpperCase(), 155, 63);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 98, 110);
    doc.text(`Currency: ${currency}`, 155, 68);

    doc.autoTable({
      startY: 90,
      margin: { left: 15, right: 15 },
      head: [["Description", "Qty", "Rate", "Tax", "Total"]],
      body: (data.lines || []).map(line => [
        String(line.description || "").slice(0, 45),
        Number(line.quantity || 0),
        money(line.unit_price, currency),
        `${Number(line.tax_rate || 0)}%`,
        money(line.line_total, currency)
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, textColor: [35, 40, 50] },
      headStyles: { fillColor: [r, g, bl], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 76 },
        1: { halign: "right", cellWidth: 18 },
        2: { halign: "right", cellWidth: 27 },
        3: { halign: "right", cellWidth: 20 },
        4: { halign: "right", cellWidth: 29 }
      }
    });

    let bottom = (doc.lastAutoTable?.finalY || 90) + 12;
    if (data.invoice?.notes) {
      doc.setTextColor(90, 98, 110);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("NOTES", 15, bottom);
      doc.setTextColor(45, 50, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(doc.splitTextToSize(String(data.invoice.notes), 90), 15, bottom + 5);
    }

    const x = 135;
    doc.setTextColor(70, 78, 90);
    doc.setFontSize(8);
    doc.text("Subtotal", x, bottom);
    doc.text(money(data.invoice?.subtotal, currency), 195, bottom, { align: "right" });
    doc.text("Discount", x, bottom + 6);
    doc.text(money(data.invoice?.discount_total, currency), 195, bottom + 6, { align: "right" });
    doc.text("Tax", x, bottom + 12);
    doc.text(money(data.invoice?.tax_total, currency), 195, bottom + 12, { align: "right" });
    doc.setDrawColor(r, g, bl);
    doc.line(x, bottom + 16, 195, bottom + 16);
    doc.setTextColor(r, g, bl);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total", x, bottom + 23);
    doc.text(money(total, currency), 195, bottom + 23, { align: "right" });

    doc.setTextColor(120, 126, 136);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    if (branding) doc.text(`${business.website || ""}  ${business.email || ""}  ·  OrbitBiz`, 15, 285);
    return doc;
  };

  const cleanPhone = value => String(value || "").replace(/\D/g, "").replace(/^0+/, "");
  const whatsappUrl = (phone, text) => {
    const p = cleanPhone(phone);
    return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  w.prepareInvoicePdf = async (state, data) => {
    const business = await loadBusiness(state);
    const premium = isPremium(state);
    const node = w.modal("Invoice PDF", `<div class="ob-pdf-picker">
      <p class="ob-muted">Choose a professional invoice design. Business details saved in Settings are reflected automatically.</p>
      <div class="ob-pdf-options">${Object.entries(templates).map(([key, template]) => `<button type="button" class="ob-pdf-option ${template.premium && !premium ? "locked" : ""}" data-pdf-theme="${key}"><span class="ob-pdf-preview ${key}"><b>INVOICE</b><i></i><i></i><i></i></span><strong>${template.label}${template.premium ? ` <em>Premium</em>` : ""}</strong><small>${template.premium && !premium ? "Premium template · upgrade to unlock" : "Professional invoice template"}</small></button>`).join("")}</div>
      <div class="ob-pdf-preview-panel" data-pdf-preview-panel>
        <div class="ob-pdf-preview-head"><div><strong>PDF preview</strong><small data-pdf-preview-name>Invoice</small></div><span class="ob-pdf-preview-status" data-pdf-preview-status>Generating…</span></div>
        <div class="ob-pdf-frame-wrap"><iframe data-pdf-preview-frame title="Invoice PDF preview" loading="lazy"></iframe><div class="ob-pdf-preview-fallback" data-pdf-preview-fallback hidden><strong>Preview isn't supported in this browser.</strong><span>The PDF is still valid. Use Download PDF to open it in your device's PDF viewer.</span></div></div>
      </div>
      <div class="ob-pdf-actions"><button class="ob-primary" data-pdf-action="whatsapp">Send via WhatsApp</button><button class="ob-soft" data-pdf-action="preview">Refresh preview</button><button class="ob-soft" data-pdf-action="download">Download PDF</button></div>
      <small class="ob-muted">The invoice is already saved. Download creates a real PDF file; WhatsApp uses the device share sheet when supported.</small>
    </div>`);

    let selected = "orbit";
    let previewUrl = "";
    const previewPanel = node.querySelector("[data-pdf-preview-panel]");
    const frame = node.querySelector("[data-pdf-preview-frame]");
    const fallback = node.querySelector("[data-pdf-preview-fallback]");
    const status = node.querySelector("[data-pdf-preview-status]");
    const previewName = node.querySelector("[data-pdf-preview-name]");
    const whatsappButton = node.querySelector('[data-pdf-action="whatsapp"]');

    const cleanup = () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = "";
      }
    };

    const choose = key => {
      if (templates[key]?.premium && !premium) {
        w.toast("Upgrade to unlock this premium template");
        return;
      }
      selected = key;
      node.querySelectorAll("[data-pdf-theme]").forEach(button => button.classList.toggle("selected", button.dataset.pdfTheme === selected));
      renderPreview();
    };

    const build = () => makePdf(data, business, selected, true);

    const renderPreview = async () => {
      try {
        status.textContent = "Generating…";
        const doc = await build();
        const blob = doc.output("blob");
        cleanup();
        previewUrl = URL.createObjectURL(blob);
        previewPanel.hidden = false;
        fallback.hidden = true;
        frame.hidden = false;
        frame.src = previewUrl;
        previewName.textContent = `${data.invoice?.invoice_number || "Invoice"} · ${templates[selected]?.label || "Classic"}`;
        status.textContent = "Ready";
      } catch (error) {
        console.error("Invoice PDF generation failed:", error);
        previewPanel.hidden = false;
        frame.hidden = true;
        fallback.hidden = false;
        status.textContent = "PDF generation failed";
        w.toast(error?.message || "Could not create PDF");
      }
    };

    node.querySelectorAll("[data-pdf-theme]").forEach(button => button.addEventListener("click", () => choose(button.dataset.pdfTheme)));
    node.querySelector('[data-pdf-action="preview"]').addEventListener("click", renderPreview);
    node.querySelector('[data-pdf-action="download"]').addEventListener("click", async () => {
      try {
        const doc = await build();
        doc.save(`${data.invoice?.invoice_number || "invoice"}-${selected}.pdf`);
        w.toast("Invoice PDF downloaded");
      } catch (error) {
        console.error(error);
        w.toast(error?.message || "Could not create PDF");
      }
    });

    whatsappButton.addEventListener("click", async () => {
      try {
        whatsappButton.disabled = true;
        whatsappButton.textContent = "Preparing WhatsApp…";
        const doc = await build();
        const blob = doc.output("blob");
        const file = new File([blob], `${data.invoice?.invoice_number || "invoice"}-${selected}.pdf`, { type: "application/pdf" });
        const text = `Hello${data.customer?.name ? ` ${data.customer.name}` : ""},\n\nPlease find your invoice ${data.invoice?.invoice_number || ""} from ${business.name || "Business"}.\nTotal: ${money(data.invoice?.total, business.currency || "INR")}\n\nThank you.`;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: `Invoice ${data.invoice?.invoice_number || ""}`, text, files: [file] });
          w.toast("WhatsApp/share sheet opened");
        } else {
          const url = whatsappUrl(data.customer?.phone, text);
          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = objectUrl;
          anchor.download = file.name;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
          window.open(url, "_blank", "noopener");
          w.toast(data.customer?.phone ? "PDF downloaded. Customer WhatsApp opened." : "PDF downloaded. WhatsApp opened.");
        }
      } catch (error) {
        if (error?.name !== "AbortError") w.toast(error?.message || "Could not share invoice PDF");
      } finally {
        whatsappButton.disabled = false;
        whatsappButton.textContent = "Send via WhatsApp";
      }
    });

    node.querySelector("[data-close]")?.addEventListener("click", cleanup);
    window.addEventListener("beforeunload", cleanup, { once: true });

    node.querySelectorAll("[data-pdf-theme]").forEach(button => button.classList.toggle("selected", button.dataset.pdfTheme === selected));
    await renderPreview();
  };
})();
