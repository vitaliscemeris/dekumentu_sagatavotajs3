import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
  convertMillimetersToTwip,
} from "docx";
import { documentFileName, type DocumentBlock, type Draft, type Segment, type Template } from "../model.ts";

const FONT = "Times New Roman";
const INK = "221C18";
const MUTED = "A3988D";
const HAIR = "D9D1C6";
const PAPER = "F7F3EC";
const HEADER = "F3EEE6";

const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const clearBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const cellNone = { top: none, bottom: none, left: none, right: none };
const gridLine = { style: BorderStyle.SINGLE, size: 4, color: HAIR } as const;
const cellGrid = { top: gridLine, bottom: gridLine, left: gridLine, right: gridLine };
const gridBorders = { ...cellGrid, insideHorizontal: gridLine, insideVertical: gridLine };

function mm(value: number): number {
  return convertMillimetersToTwip(value);
}

function run(part: Segment, size = 24): TextRun {
  return new TextRun({
    text: part.text,
    font: FONT,
    size,
    bold: part.strong,
    color: part.muted ? MUTED : INK,
  });
}

function paragraph(
  parts: Segment[],
  options: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; before?: number; after?: number; size?: number } = {},
): Paragraph {
  return new Paragraph({
    alignment: options.align ?? AlignmentType.LEFT,
    spacing: { before: options.before ?? 0, after: options.after ?? 80 },
    children: parts.length ? parts.map((part) => run(part, options.size)) : [run({ text: "" })],
  });
}

function lines(rows: Segment[][], options: { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; size?: number } = {}): Paragraph[] {
  return rows.map((row, index) =>
    paragraph(row, {
      align: options.align,
      size: options.size,
      after: index === rows.length - 1 ? 160 : 40,
    }),
  );
}

function cell(
  children: Paragraph[],
  width: number,
  options: {
    borders?: typeof cellNone | typeof cellGrid;
    fill?: string;
    align?: (typeof VerticalAlignTable)[keyof typeof VerticalAlignTable];
  } = {},
): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: options.borders ?? cellNone,
    verticalAlign: options.align ?? VerticalAlignTable.TOP,
    shading: options.fill ? { type: ShadingType.CLEAR, fill: options.fill } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: children.length ? children : [paragraph([])],
  });
}

function renderBlock(block: DocumentBlock, contentWidth: number): (Paragraph | Table)[] {
  switch (block.type) {
    case "gap":
      return [paragraph([{ text: "" }], { after: 200 })];
    case "right": {
      const left = Math.round(contentWidth * 0.4);
      const right = contentWidth - left;
      return [
        new Table({
          width: { size: contentWidth, type: WidthType.DXA },
          columnWidths: [left, right],
          layout: TableLayoutType.FIXED,
          borders: clearBorders,
          rows: [
            new TableRow({
              children: [
                cell([paragraph([])], left),
                cell(lines(block.lines, { size: 22 }), right),
              ],
            }),
          ],
        }),
      ];
    }
    case "title":
      return [
        ...(block.kicker ? [paragraph([{ text: block.kicker }], { align: AlignmentType.CENTER, before: 200, after: 40, size: 20 })] : []),
        paragraph([{ text: block.title, strong: true }], { align: AlignmentType.CENTER, before: 240, after: 60, size: 36 }),
        ...(block.subtitle ? [paragraph(block.subtitle, { align: AlignmentType.CENTER, after: 240, size: 24 })] : []),
      ];
    case "paragraph":
      return lines(block.lines, { align: block.align === "justify" ? AlignmentType.JUSTIFIED : AlignmentType.LEFT });
    case "headline": {
      const half = Math.round(contentWidth / 2);
      return [
        new Table({
          width: { size: contentWidth, type: WidthType.DXA },
          columnWidths: [half, contentWidth - half],
          layout: TableLayoutType.FIXED,
          borders: {
            ...clearBorders,
            bottom: { style: BorderStyle.SINGLE, size: 12, color: INK },
          },
          rows: [
            new TableRow({
              children: [
                cell(
                  [paragraph([{ text: block.leftTitle, strong: true }], { after: 80, size: 18 }), ...lines(block.left, { size: 22 })],
                  half,
                ),
                cell(
                  [
                    paragraph([{ text: block.rightTitle, strong: true }], { align: AlignmentType.RIGHT, after: 80, size: 36 }),
                    ...lines(block.right, { align: AlignmentType.RIGHT, size: 22 }),
                  ],
                  contentWidth - half,
                ),
              ],
            }),
          ],
        }),
        paragraph([], { after: 120 }),
      ];
    }
    case "party":
      return [
        paragraph([{ text: block.title, strong: true }], { before: 80, after: 60, size: 18 }),
        ...lines(block.lines, { size: 22 }),
      ];
    case "table": {
      const widths = block.columns.map((column) => Math.round((contentWidth * column.width) / 100));
      const used = widths.reduce((sum, value) => sum + value, 0);
      widths[widths.length - 1] += contentWidth - used;
      const header = new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: block.columns.map((column, index) =>
          cell(
            [
              paragraph([{ text: column.header, strong: true }], {
                align: column.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
                after: 0,
                size: 18,
              }),
            ],
            widths[index],
            { borders: cellGrid, fill: HEADER },
          ),
        ),
      });
      const body = block.rows.map(
        (row) =>
          new TableRow({
            cantSplit: true,
            children: row.map((value, index) =>
              cell(
                [
                  paragraph([{ text: value }], {
                    align: block.columns[index]?.align === "right" ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    after: 0,
                    size: 21,
                  }),
                ],
                widths[index],
                { borders: cellGrid },
              ),
            ),
          }),
      );
      const output: (Paragraph | Table)[] = [
        new Table({
          width: { size: contentWidth, type: WidthType.DXA },
          columnWidths: widths,
          layout: TableLayoutType.FIXED,
          borders: gridBorders,
          rows: [header, ...body],
        }),
      ];
      if (block.totals?.length) {
        const labelWidth = mm(48);
        const valueWidth = mm(36);
        output.push(
          new Table({
            width: { size: labelWidth + valueWidth, type: WidthType.DXA },
            columnWidths: [labelWidth, valueWidth],
            alignment: AlignmentType.RIGHT,
            layout: TableLayoutType.FIXED,
            borders: clearBorders,
            rows: block.totals.map(
              (row) =>
                new TableRow({
                  children: [
                    cell([paragraph([{ text: row.label, strong: row.strong }], { after: 0, size: 21 })], labelWidth),
                    cell(
                      [paragraph([{ text: row.value, strong: row.strong }], { align: AlignmentType.RIGHT, after: 0, size: 21 })],
                      valueWidth,
                    ),
                  ],
                }),
            ),
          }),
        );
      }
      return output;
    }
    case "note": {
      return [
        new Table({
          width: { size: contentWidth, type: WidthType.DXA },
          columnWidths: [contentWidth],
          layout: TableLayoutType.FIXED,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E4D9CC" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E4D9CC" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "E4D9CC" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E4D9CC" },
            insideHorizontal: none,
            insideVertical: none,
          },
          rows: [
            new TableRow({
              children: [
                cell(
                  [
                    ...(block.title
                      ? [paragraph([{ text: block.title, strong: true }], { after: 60, size: 18 })]
                      : []),
                    ...lines(block.lines, { size: 21 }),
                  ],
                  contentWidth,
                  { fill: PAPER },
                ),
              ],
            }),
          ],
        }),
      ];
    }
    case "sign": {
      const left = Math.round(contentWidth * 0.52);
      const right = contentWidth - left;
      const signature: Paragraph[] = [];
      if (block.dateLine) signature.push(paragraph(block.dateLine, { after: 200, size: 22 }));
      signature.push(
        paragraph([{ text: "________________________" }], { before: block.dateLine ? 0 : 300, after: 40 }),
        paragraph([block.name], { after: 20, size: 22 }),
      );
      if (block.role) signature.push(paragraph([{ text: block.role }], { after: 20, size: 20 }));
      if (block.caption) signature.push(paragraph([{ text: block.caption, muted: true }], { after: 0, size: 18 }));
      return [
        new Table({
          width: { size: contentWidth, type: WidthType.DXA },
          columnWidths: [left, right],
          layout: TableLayoutType.FIXED,
          borders: clearBorders,
          rows: [new TableRow({ children: [cell([paragraph([])], left), cell(signature, right)] })],
        }),
      ];
    }
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

export async function downloadDocx(template: Template, draft: Draft): Promise<void> {
  const model = template.render(draft);
  const contentWidth = mm(174);
  const children = model.blocks.flatMap((block) => renderBlock(block, contentWidth));
  const doc = new Document({
    title: template.name,
    creator: "Dokumentu sagatavotājs",
    description: template.blurb,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: mm(210), height: mm(297) },
            margin: { top: mm(16), right: mm(18), bottom: mm(16), left: mm(18) },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = documentFileName(template, draft);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
