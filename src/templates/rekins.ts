import {
  formatDate,
  formatQty,
  lineSum,
  money,
  parseNum,
  prefixed,
  proseLines,
  strongOrBlank,
  text,
  todayISO,
  valueOrBlank,
  type DocumentBlock,
  type Draft,
  type LineItem,
  type SummaryRow,
  type Template,
} from "../model.ts";

const today = todayISO();

function dueFromToday(): string {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function usableItems(items: LineItem[]): LineItem[] {
  const filled = items.filter((item) => Object.values(item).some((value) => value.trim()));
  return filled.length ? filled : [{ title: "", qty: "", unit: "", price: "" }];
}

export function invoiceFigures(draft: Draft): { net: number; vatRate: number; vat: number; total: number } {
  const net = draft.items.reduce((sum, item) => sum + lineSum(item), 0);
  const vatRate = draft.values.vatRate.trim() ? parseNum(draft.values.vatRate) : 0;
  const vat = Math.round(net * vatRate) / 100;
  return { net, vatRate, vat, total: net + vat };
}

function invoiceTotals(draft: Draft): SummaryRow[] {
  const figures = invoiceFigures(draft);
  const rate = draft.values.vatRate.trim() ? formatQty(draft.values.vatRate) : "0";
  return [
    { label: "Summa bez PVN", value: money(figures.net) },
    { label: `PVN ${rate}%`, value: money(figures.vat) },
    { label: "Kopā apmaksai", value: money(figures.total), strong: true },
  ];
}

export const rekins: Template = {
  id: "rekins",
  name: "Rēķins",
  kind: "Norēķini",
  blurb: "Piegādātājs, maksātājs, pozīcijas un PVN.",
  fileStem: "rekins",
  nameKey: "invoiceNo",
  totals: invoiceTotals,
  lineItems: {
    title: "Pozīcijas",
    afterSection: "Rēķins",
    addLabel: "Pievienot pozīciju",
    columns: [
      { key: "title", label: "Nosaukums", placeholder: "Pakalpojums" },
      { key: "qty", label: "Daudzums", placeholder: "1", numeric: true },
      { key: "unit", label: "Mērvienība", placeholder: "gab." },
      { key: "price", label: "Cena", placeholder: "0,00", numeric: true },
    ],
  },
  fields: [
    {
      key: "supplierName",
      label: "Nosaukums",
      type: "text",
      section: "Piegādātājs",
      required: true,
      span: "full",
      placeholder: "SIA „Ziemeļu ozols”",
    },
    { key: "supplierReg", label: "Reģistrācijas numurs", type: "text", section: "Piegādātājs", placeholder: "40203123456" },
    { key: "supplierVat", label: "PVN numurs", type: "text", section: "Piegādātājs", placeholder: "LV40203123456" },
    {
      key: "supplierAddress",
      label: "Juridiskā adrese",
      type: "text",
      section: "Piegādātājs",
      required: true,
      span: "full",
      placeholder: "Brīvības iela 85, Rīga, LV-1001",
    },
    { key: "supplierPhone", label: "Tālrunis", type: "tel", section: "Piegādātājs", placeholder: "67123456" },
    {
      key: "supplierEmail",
      label: "E-pasts",
      type: "email",
      section: "Piegādātājs",
      placeholder: "rekini@ziemeluozols.lv",
    },
    { key: "supplierBank", label: "Banka", type: "text", section: "Piegādātājs", placeholder: "AS „Luminor Bank”" },
    { key: "supplierSwift", label: "SWIFT", type: "text", section: "Piegādātājs", placeholder: "RIKOLV2X" },
    {
      key: "supplierAccount",
      label: "Konts",
      type: "text",
      section: "Piegādātājs",
      span: "full",
      placeholder: "LV00RIKO0000000000000",
    },
    {
      key: "customerName",
      label: "Nosaukums",
      type: "text",
      section: "Maksātājs",
      required: true,
      span: "full",
      placeholder: "SIA „Liepu darbnīca”",
    },
    { key: "customerReg", label: "Reģistrācijas numurs", type: "text", section: "Maksātājs", placeholder: "40103999888" },
    { key: "customerVat", label: "PVN numurs", type: "text", section: "Maksātājs", placeholder: "LV40103999888" },
    {
      key: "customerAddress",
      label: "Adrese",
      type: "text",
      section: "Maksātājs",
      required: true,
      span: "full",
      placeholder: "Elizabetes iela 10, Rīga, LV-1010",
    },
    {
      key: "invoiceNo",
      label: "Rēķina numurs",
      type: "text",
      section: "Rēķins",
      required: true,
      placeholder: "2026-014",
    },
    {
      key: "vatRate",
      label: "PVN likme, %",
      type: "number",
      section: "Rēķins",
      placeholder: "21",
    },
    { key: "issueDate", label: "Izrakstīšanas datums", type: "date", section: "Rēķins", required: true },
    { key: "dueDate", label: "Apmaksas termiņš", type: "date", section: "Rēķins", required: true },
    {
      key: "notes",
      label: "Piezīme",
      type: "textarea",
      section: "Noslēgums",
      span: "full",
      rows: 3,
      hint: "Tukšu lauku dokumentā nerāda.",
    },
    {
      key: "electronic",
      label: "Paraksts",
      type: "select",
      section: "Noslēgums",
      options: [
        { value: "ja", label: "Elektronisks, derīgs bez paraksta" },
        { value: "ne", label: "Atstāt paraksta vietu" },
      ],
    },
    {
      key: "signerName",
      label: "Parakstītājs",
      type: "text",
      section: "Noslēgums",
      required: true,
      showWhen: { key: "electronic", equals: "ne" },
      placeholder: "Māra Ozola",
    },
    {
      key: "signerRole",
      label: "Amats",
      type: "text",
      section: "Noslēgums",
      showWhen: { key: "electronic", equals: "ne" },
      placeholder: "valdes locekle",
    },
  ],
  empty: {
    values: {
      supplierName: "",
      supplierReg: "",
      supplierVat: "",
      supplierAddress: "",
      supplierPhone: "",
      supplierEmail: "",
      supplierBank: "",
      supplierSwift: "",
      supplierAccount: "",
      customerName: "",
      customerReg: "",
      customerVat: "",
      customerAddress: "",
      invoiceNo: "",
      vatRate: "21",
      issueDate: "",
      dueDate: "",
      notes: "",
      electronic: "ja",
      signerName: "",
      signerRole: "",
    },
    items: [{ title: "", qty: "", unit: "", price: "" }],
  },
  sample: {
    values: {
      supplierName: "SIA „Ziemeļu ozols”",
      supplierReg: "40203123456",
      supplierVat: "LV40203123456",
      supplierAddress: "Brīvības iela 85, Rīga, LV-1001",
      supplierPhone: "67123456",
      supplierEmail: "rekini@ziemeluozols.lv",
      supplierBank: "AS „Luminor Bank”",
      supplierSwift: "RIKOLV2X",
      supplierAccount: "LV00RIKO0000000000000",
      customerName: "SIA „Liepu darbnīca”",
      customerReg: "40103999888",
      customerVat: "",
      customerAddress: "Elizabetes iela 10, Rīga, LV-1010",
      invoiceNo: "2026-014",
      vatRate: "21",
      issueDate: today,
      dueDate: dueFromToday(),
      notes: "Apmaksa veicama 7 dienu laikā no rēķina izrakstīšanas dienas.",
      electronic: "ja",
      signerName: "Māra Ozola",
      signerRole: "valdes locekle",
    },
    items: [
      { title: "Konsultācija par dokumentu sagatavošanu", qty: "3", unit: "h", price: "45" },
      { title: "Veidnes pielāgošana", qty: "1", unit: "gab.", price: "80" },
    ],
  },
  render(draft) {
    const values = draft.values;
    const supplier = [
      [strongOrBlank(values.supplierName)],
      ...[
        prefixed("Reģ. Nr. ", values.supplierReg),
        prefixed("PVN ", values.supplierVat),
        values.supplierAddress.trim() ? [valueOrBlank(values.supplierAddress)] : null,
        prefixed("tālr. ", values.supplierPhone),
        prefixed("", values.supplierEmail),
      ].filter((line): line is NonNullable<typeof line> => line !== null),
    ];
    if (supplier.length === 1) supplier.push([valueOrBlank(values.supplierAddress)]);

    const issued = formatDate(values.issueDate, "locative");
    const due = formatDate(values.dueDate, "locative");
    const customer = [
      [strongOrBlank(values.customerName)],
      ...[
        prefixed("Reģ. Nr. ", values.customerReg),
        prefixed("PVN ", values.customerVat),
        [valueOrBlank(values.customerAddress)],
      ].filter((line): line is NonNullable<typeof line> => line !== null),
    ];

    const rows = usableItems(draft.items).map((item) => {
      const hasAmount = item.qty.trim() || item.price.trim();
      return [
        item.title.trim() || "—",
        formatQty(item.qty),
        item.unit.trim() || "—",
        item.price.trim() ? money(parseNum(item.price)) : "—",
        hasAmount ? money(lineSum(item)) : "—",
      ];
    });

    const blocks: DocumentBlock[] = [
      {
        type: "headline",
        leftTitle: "Piegādātājs",
        left: supplier,
        rightTitle: "RĒĶINS",
        right: [
          [text("Nr. "), valueOrBlank(values.invoiceNo, "________")],
          [text("Izrakstīts "), issued ? text(issued) : valueOrBlank("")],
          [text("Apmaksas termiņš "), due ? text(due) : valueOrBlank("")],
        ],
      },
      { type: "party", title: "Maksātājs", lines: customer },
      {
        type: "table",
        columns: [
          { header: "Nosaukums", align: "left", width: 46 },
          { header: "Daudz.", align: "right", width: 12 },
          { header: "Mērv.", align: "left", width: 12 },
          { header: "Cena", align: "right", width: 15 },
          { header: "Summa", align: "right", width: 15 },
        ],
        rows,
        totals: invoiceTotals(draft),
      },
    ];

    const bank = [
      prefixed("Banka: ", values.supplierBank),
      prefixed("Konts: ", values.supplierAccount),
      prefixed("SWIFT: ", values.supplierSwift),
    ].filter((line): line is NonNullable<typeof line> => line !== null);
    if (bank.length) {
      blocks.push({ type: "note", title: "Apmaksas rekvizīti", lines: bank });
    }
    if (values.notes.trim()) {
      blocks.push({ type: "paragraph", align: "left", lines: proseLines(values.notes, "") });
    }
    if (values.electronic === "ne") {
      blocks.push({
        type: "sign",
        name: strongOrBlank(values.signerName),
        role: values.signerRole.trim(),
        caption: "(paraksts)",
      });
    } else {
      blocks.push({
        type: "paragraph",
        align: "left",
        lines: [[{ text: "Rēķins sagatavots elektroniski un ir derīgs bez paraksta." }]],
      });
    }

    return { blocks };
  },
};
