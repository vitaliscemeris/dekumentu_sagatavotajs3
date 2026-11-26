import {
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

export const pilnvara: Template = {
  id: "pilnvara",
  name: "Pilnvara",
  kind: "Pilnvarojums",
  blurb: "Pilnvarotājs, pilnvarnieks un darbības, ko drīkst veikt.",
  fileStem: "pilnvara",
  nameKey: "grantorName",
  fields: [
    {
      key: "place",
      label: "Vieta",
      type: "text",
      section: "Izsniegšana",
      required: true,
      placeholder: "Rīgā",
      hint: "Lokativā, piemēram „Rīgā”.",
    },
    { key: "date", label: "Datums", type: "date", section: "Izsniegšana", required: true },
    {
      key: "grantorName",
      label: "Pilnvarotāja vārds, uzvārds",
      type: "text",
      section: "Pilnvarotājs",
      required: true,
      span: "full",
      autoComplete: "name",
      placeholder: "Anna Liepiņa",
    },
    {
      key: "grantorCode",
      label: "Personas kods",
      type: "text",
      section: "Pilnvarotājs",
      required: true,
      placeholder: "010190-11111",
    },
    {
      key: "grantorAddress",
      label: "Deklarētā dzīvesvieta",
      type: "text",
      section: "Pilnvarotājs",
      required: true,
      placeholder: "Ausekļa iela 4-12, Rīga, LV-1010",
    },
    {
      key: "agentName",
      label: "Pilnvarnieka vārds, uzvārds",
      type: "text",
      section: "Pilnvarnieks",
      required: true,
      span: "full",
      placeholder: "Jānis Kalniņš",
    },
    {
      key: "agentCode",
      label: "Personas kods",
      type: "text",
      section: "Pilnvarnieks",
      required: true,
      placeholder: "150585-22222",
    },
    {
      key: "agentAddress",
      label: "Dzīvesvieta",
      type: "text",
      section: "Pilnvarnieks",
      required: true,
      placeholder: "Elizabetes iela 10-5, Rīga, LV-1010",
    },
    {
      key: "powers",
      label: "Pilnvarojuma apjoms",
      type: "textarea",
      section: "Pilnvarojums",
      required: true,
      span: "full",
      rows: 7,
      placeholder: "1. Pārstāvēt mani valsts un pašvaldību iestādēs.",
    },
    {
      key: "substitution",
      label: "Pārpilnvarošana",
      type: "select",
      section: "Pilnvarojums",
      required: true,
      options: [
        { value: "bez pārpilnvarojuma tiesībām", label: "Bez pārpilnvarojuma tiesībām" },
        { value: "ar pārpilnvarojuma tiesībām", label: "Ar pārpilnvarojuma tiesībām" },
      ],
    },
    {
      key: "validUntil",
      label: "Spēkā līdz",
      type: "text",
      section: "Pilnvarojums",
      required: true,
      placeholder: "2027. gada 23. novembrim",
      hint: "Datumu raksti datīvā vai norādi „atsaukumam”.",
    },
    {
      key: "extra",
      label: "Papildu noteikums",
      type: "textarea",
      section: "Pilnvarojums",
      span: "full",
      rows: 3,
      hint: "Tukšu lauku dokumentā nerāda.",
    },
  ],
  empty: {
    values: {
      place: "",
      date: "",
      grantorName: "",
      grantorCode: "",
      grantorAddress: "",
      agentName: "",
      agentCode: "",
      agentAddress: "",
      powers: "",
      substitution: "bez pārpilnvarojuma tiesībām",
      validUntil: "",
      extra: "",
    },
    items: [],
  },
  sample: {
    values: {
      place: "Rīgā",
      date: today,
      grantorName: "Anna Liepiņa",
      grantorCode: "010190-11111",
      grantorAddress: "Ausekļa iela 4-12, Rīga, LV-1010",
      agentName: "Jānis Kalniņš",
      agentCode: "150585-22222",
      agentAddress: "Elizabetes iela 10-5, Rīga, LV-1010",
      powers:
        "1. Pārstāvēt mani valsts un pašvaldību iestādēs, iesniedzot un saņemot dokumentus.\n2. Parakstīt iesniegumus, kas saistīti ar dzīvokļa īpašuma Ausekļa ielā 4-12, Rīgā, apsaimniekošanu.\n3. Saņemt korespondenci un izziņas manā vārdā.",
      substitution: "bez pārpilnvarojuma tiesībām",
      validUntil: "2027. gada 23. novembrim",
      extra: "",
    },
    items: [],
  },
  render(draft) {
    const values = draft.values;
    const blocks: DocumentBlock[] = [
      {
        type: "title",
        title: "PILNVARA",
        subtitle: placeDate(values.place, values.date),
      },
      {
        type: "paragraph",
        align: "justify",
        lines: [
          [
            text("Es, "),
            strongOrBlank(values.grantorName),
            text(", personas kods "),
            valueOrBlank(values.grantorCode, "____________"),
            text(", deklarētā dzīvesvieta "),
            valueOrBlank(values.grantorAddress),
            text(" (turpmāk — Pilnvarotājs), ar šo pilnvaru pilnvaroju "),
            strongOrBlank(values.agentName),
            text(", personas kods "),
            valueOrBlank(values.agentCode, "____________"),
            text(", dzīvesvieta "),
            valueOrBlank(values.agentAddress),
            text(" (turpmāk — Pilnvarnieks), manā vārdā veikt šādas darbības:"),
          ],
        ],
      },
      {
        type: "paragraph",
        align: "left",
        lines: proseLines(values.powers, "Norādi darbības, ko pilnvarnieks drīkst veikt."),
      },
      {
        type: "paragraph",
        align: "justify",
        lines: [
          [
            text("Pilnvara izdota "),
            valueOrBlank(values.substitution),
            text(" un ir spēkā līdz "),
            valueOrBlank(values.validUntil),
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
        type: "note",
        title: "Pilnvarnieka paraksta paraugs",
        lines: [[valueOrBlank("", "______________________________")]],
      },
      {
        type: "sign",
        name: strongOrBlank(values.grantorName),
        caption: "(Pilnvarotāja paraksts)",
      },
    );

    return { blocks };
  },
};
