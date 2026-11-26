import {
  formatDate,
  placeDate,
  proseLines,
  strongOrBlank,
  text,
  todayISO,
  valueOrBlank,
  type DocumentBlock,
  type Template,
} from "../model.ts";

const today = todayISO();

export const izzina: Template = {
  id: "izzina",
  name: "Izziņa",
  kind: "Apliecinājums",
  blurb: "Darba devēja apliecinājums par darbu un amatu.",
  fileStem: "izzina",
  nameKey: "personName",
  fields: [
    {
      key: "orgName",
      label: "Darba devējs",
      type: "text",
      section: "Izsniedzējs",
      required: true,
      span: "full",
      placeholder: "SIA „Ziemeļu ozols”",
    },
    { key: "orgReg", label: "Reģistrācijas numurs", type: "text", section: "Izsniedzējs", placeholder: "40203123456" },
    {
      key: "orgAddress",
      label: "Juridiskā adrese",
      type: "text",
      section: "Izsniedzējs",
      required: true,
      placeholder: "Brīvības iela 85, Rīga, LV-1001",
    },
    {
      key: "docNo",
      label: "Izziņas numurs",
      type: "text",
      section: "Izziņa",
      placeholder: "14/2026",
    },
    {
      key: "place",
      label: "Vieta",
      type: "text",
      section: "Izziņa",
      required: true,
      placeholder: "Rīgā",
      hint: "Lokativā, piemēram „Rīgā”.",
    },
    { key: "date", label: "Datums", type: "date", section: "Izziņa", required: true },
    {
      key: "personName",
      label: "Darbinieka vārds, uzvārds",
      type: "text",
      section: "Darbinieks",
      required: true,
      span: "full",
      placeholder: "Anna Liepiņa",
    },
    {
      key: "personCode",
      label: "Personas kods",
      type: "text",
      section: "Darbinieks",
      required: true,
      placeholder: "010190-11111",
    },
    { key: "since", label: "Strādā no", type: "date", section: "Darbinieks", required: true },
    {
      key: "position",
      label: "Amats",
      type: "text",
      section: "Darbinieks",
      required: true,
      placeholder: "projektu vadītāja",
      hint: "Formā, kādā tam jāparādās teikumā.",
    },
    {
      key: "purpose",
      label: "Izziņa izsniegta",
      type: "text",
      section: "Saturs",
      required: true,
      span: "full",
      placeholder: "iesniegšanai pēc pieprasījuma",
    },
    {
      key: "extra",
      label: "Papildu teksts",
      type: "textarea",
      section: "Saturs",
      span: "full",
      rows: 3,
      hint: "Tukšu lauku dokumentā nerāda.",
    },
    {
      key: "signerName",
      label: "Parakstītājs",
      type: "text",
      section: "Paraksts",
      required: true,
      placeholder: "Māra Ozola",
    },
    {
      key: "signerRole",
      label: "Amats",
      type: "text",
      section: "Paraksts",
      required: true,
      placeholder: "valdes locekle",
    },
  ],
  empty: {
    values: {
      orgName: "",
      orgReg: "",
      orgAddress: "",
      docNo: "",
      place: "",
      date: "",
      personName: "",
      personCode: "",
      since: "",
      position: "",
      purpose: "",
      extra: "",
      signerName: "",
      signerRole: "",
    },
    items: [],
  },
  sample: {
    values: {
      orgName: "SIA „Ziemeļu ozols”",
      orgReg: "40203123456",
      orgAddress: "Brīvības iela 85, Rīga, LV-1001",
      docNo: "14/2026",
      place: "Rīgā",
      date: today,
      personName: "Anna Liepiņa",
      personCode: "010190-11111",
      since: "2022-03-01",
      position: "projektu vadītāja",
      purpose: "iesniegšanai pēc pieprasījuma",
      extra: "",
      signerName: "Māra Ozola",
      signerRole: "valdes locekle",
    },
    items: [],
  },
  render(draft) {
    const values = draft.values;
    const since = formatDate(values.since, "genitive");
    const blocks: DocumentBlock[] = [
      {
        type: "title",
        title: "IZZIŅA",
        subtitle: values.docNo.trim()
          ? [{ text: `Nr. ${values.docNo.trim()}` }]
          : [{ text: "Nr. ______", muted: true }],
      },
      {
        type: "paragraph",
        align: "justify",
        lines: [
          [
            strongOrBlank(values.orgName),
            text(", reģistrācijas Nr. "),
            valueOrBlank(values.orgReg, "____________"),
            text(", juridiskā adrese "),
            valueOrBlank(values.orgAddress),
            text(", apliecina, ka "),
            strongOrBlank(values.personName),
            text(", personas kods "),
            valueOrBlank(values.personCode, "____________"),
            text(", strādā sabiedrībā no "),
            since ? text(since) : valueOrBlank(""),
            text(" amatā: "),
            valueOrBlank(values.position),
            text("."),
          ],
        ],
      },
    ];

    if (values.extra.trim()) {
      blocks.push({ type: "paragraph", align: "justify", lines: proseLines(values.extra, "") });
    }

    blocks.push(
      {
        type: "paragraph",
        align: "justify",
        lines: [
          [
            text("Izziņa izsniegta "),
            valueOrBlank(values.purpose, "iesniegšanai ____________________"),
            text("."),
          ],
        ],
      },
      {
        type: "sign",
        dateLine: placeDate(values.place, values.date),
        name: strongOrBlank(values.signerName),
        role: values.signerRole.trim(),
        caption: "(paraksts)",
      },
    );

    return { blocks };
  },
};
