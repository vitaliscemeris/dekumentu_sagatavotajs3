import {
  placeDate,
  prefixed,
  proseLines,
  strongOrBlank,
  text,
  todayISO,
  valueOrBlank,
  type DocumentBlock,
  type Template,
} from "../model.ts";

const today = todayISO();

export const iesniegums: Template = {
  id: "iesniegums",
  name: "Iesniegums",
  kind: "Vēstule",
  blurb: "Iestādei vai uzņēmumam. Adresāts, iesniedzējs un lūguma teksts.",
  fileStem: "iesniegums",
  nameKey: "fullName",
  fields: [
    {
      key: "addressee",
      label: "Adresāts",
      type: "text",
      section: "Adresāts",
      required: true,
      span: "full",
      placeholder: "SIA „Ziemeļu ozols” valdei",
    },
    {
      key: "addresseeAddress",
      label: "Adresāta adrese",
      type: "text",
      section: "Adresāts",
      span: "full",
      placeholder: "Brīvības iela 85, Rīga, LV-1001",
    },
    {
      key: "fullName",
      label: "Vārds, uzvārds",
      type: "text",
      section: "Iesniedzējs",
      required: true,
      autoComplete: "name",
      placeholder: "Anna Liepiņa",
    },
    {
      key: "personCode",
      label: "Personas kods",
      type: "text",
      section: "Iesniedzējs",
      placeholder: "010190-11111",
    },
    {
      key: "address",
      label: "Dzīvesvietas adrese",
      type: "text",
      section: "Iesniedzējs",
      required: true,
      span: "full",
      autoComplete: "street-address",
      placeholder: "Ausekļa iela 4-12, Rīga, LV-1010",
    },
    {
      key: "phone",
      label: "Tālrunis",
      type: "tel",
      section: "Iesniedzējs",
      autoComplete: "tel",
      placeholder: "26123456",
    },
    {
      key: "email",
      label: "E-pasts",
      type: "email",
      section: "Iesniedzējs",
      autoComplete: "email",
      placeholder: "anna.liepina@example.com",
    },
    {
      key: "subject",
      label: "Temats",
      type: "text",
      section: "Saturs",
      required: true,
      span: "full",
      placeholder: "par dzīvokļa remonta saskaņošanu",
    },
    {
      key: "body",
      label: "Iesnieguma teksts",
      type: "textarea",
      section: "Saturs",
      required: true,
      span: "full",
      rows: 8,
      placeholder: "Lūdzu saskaņot…",
    },
    {
      key: "attachments",
      label: "Pielikumi",
      type: "textarea",
      section: "Saturs",
      span: "full",
      rows: 3,
      hint: "Katru pielikumu raksti savā rindā. Tukšu lauku dokumentā nerāda.",
      placeholder: "1. Telpu skice.",
    },
    {
      key: "place",
      label: "Vieta",
      type: "text",
      section: "Paraksts",
      required: true,
      placeholder: "Rīgā",
      hint: "Lokativā, piemēram „Rīgā”.",
    },
    {
      key: "date",
      label: "Datums",
      type: "date",
      section: "Paraksts",
      required: true,
    },
    {
      key: "signName",
      label: "Parakstītājs",
      type: "text",
      section: "Paraksts",
      span: "full",
      hint: "Ja tukšs, dokumentā izmanto iesniedzēja vārdu.",
      placeholder: "Anna Liepiņa",
    },
  ],
  empty: {
    values: {
      addressee: "",
      addresseeAddress: "",
      fullName: "",
      personCode: "",
      address: "",
      phone: "",
      email: "",
      subject: "",
      body: "",
      attachments: "",
      place: "",
      date: "",
      signName: "",
    },
    items: [],
  },
  sample: {
    values: {
      addressee: "SIA „Ziemeļu ozols” valdei",
      addresseeAddress: "Brīvības iela 85, Rīga, LV-1001",
      fullName: "Anna Liepiņa",
      personCode: "010190-11111",
      address: "Ausekļa iela 4-12, Rīga, LV-1010",
      phone: "26123456",
      email: "anna.liepina@example.com",
      subject: "par dzīvokļa remonta saskaņošanu",
      body: "Lūdzu saskaņot kosmētisko remontu dzīvoklī Ausekļa ielā 4-12, Rīgā. Plānots atjaunot sienu apdari un nomainīt iekšdurvis. Nesošās konstrukcijas un inženiertīkli netiks skarti.\n\nDarbus paredzēts veikt no 2026. gada 1. decembra līdz 2026. gada 20. decembrim.",
      attachments: "1. Telpu skice.\n2. Remonta apraksts.",
      place: "Rīgā",
      date: today,
      signName: "Anna Liepiņa",
    },
    items: [],
  },
  render(draft) {
    const values = draft.values;
    const sender = [
      [text("Iesniedzējs: "), strongOrBlank(values.fullName)],
      [text("personas kods "), valueOrBlank(values.personCode, "____________")],
      [valueOrBlank(values.address)],
    ];
    const phone = prefixed("tālr. ", values.phone);
    const email = prefixed("e-pasts: ", values.email);
    if (phone) sender.push(phone);
    if (email) sender.push(email);

    const blocks: DocumentBlock[] = [
      {
        type: "right",
        lines: [[strongOrBlank(values.addressee)], [valueOrBlank(values.addresseeAddress)]],
      },
      { type: "gap" },
      { type: "right", lines: sender },
      {
        type: "title",
        title: "IESNIEGUMS",
        subtitle: values.subject.trim()
          ? [{ text: values.subject.trim() }]
          : [{ text: "par ____________________", muted: true }],
      },
      { type: "paragraph", align: "justify", lines: proseLines(values.body, "Iesnieguma teksts.") },
    ];

    if (values.attachments.trim()) {
      blocks.push({
        type: "paragraph",
        align: "left",
        lines: [
          [{ text: "Pielikumā:", strong: true }],
          ...values.attachments
            .trim()
            .split("\n")
            .map((line) => [{ text: line.length ? line : " " }]),
        ],
      });
    }

    const signed = values.signName.trim() || values.fullName.trim();
    blocks.push({
      type: "sign",
      dateLine: placeDate(values.place, values.date),
      name: signed ? { text: signed, strong: true } : strongOrBlank(""),
      caption: "(paraksts)",
    });

    return { blocks };
  },
};
