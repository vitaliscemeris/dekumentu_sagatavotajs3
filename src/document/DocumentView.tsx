import type { RefObject } from "react";
import type { DocumentBlock, DocumentModel, Segment } from "../model.ts";

function Segments({ parts }: { parts: Segment[] }) {
  return parts.map((part, index) => (
    <span key={index} className={part.muted ? "muted" : undefined}>
      {part.strong ? <strong>{part.text}</strong> : part.text}
    </span>
  ));
}

function Lines({ lines }: { lines: Segment[][] }) {
  return lines.map((line, index) => (
    <p key={index}>
      <Segments parts={line} />
    </p>
  ));
}

function BlockView({ block }: { block: DocumentBlock }) {
  switch (block.type) {
    case "right":
      return (
        <div className="right-block">
          <Lines lines={block.lines} />
        </div>
      );
    case "title":
      return (
        <header className="doc-title">
          {block.kicker ? <p className="kicker">{block.kicker}</p> : null}
          <h1>{block.title}</h1>
          {block.subtitle ? (
            <p className="subtitle">
              <Segments parts={block.subtitle} />
            </p>
          ) : null}
        </header>
      );
    case "paragraph":
      return (
        <div className={block.align === "justify" ? "prose justify" : "prose"}>
          <Lines lines={block.lines} />
        </div>
      );
    case "headline":
      return (
        <div className="headline">
          <div>
            <h2>{block.leftTitle}</h2>
            <Lines lines={block.left} />
          </div>
          <div className="right">
            <h2 className="doc-name">{block.rightTitle}</h2>
            <Lines lines={block.right} />
          </div>
        </div>
      );
    case "party":
      return (
        <section className="party">
          <h2>{block.title}</h2>
          <Lines lines={block.lines} />
        </section>
      );
    case "table":
      return (
        <div className="table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column.header} className={column.align === "right" ? "num" : undefined} style={{ width: `${column.width}%` }}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={block.columns[cellIndex]?.align === "right" ? "num" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.totals ? (
            <div className="totals">
              {block.totals.map((row) => (
                <div key={row.label} className={row.strong ? "strong" : undefined}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "note":
      return (
        <aside className="note">
          {block.title ? <h2>{block.title}</h2> : null}
          <Lines lines={block.lines} />
        </aside>
      );
    case "sign":
      return (
        <div className="sign">
          {block.dateLine ? (
            <p className="date">
              <Segments parts={block.dateLine} />
            </p>
          ) : null}
          <div className="rule" />
          <p className="who">
            <Segments parts={[block.name]} />
          </p>
          {block.role ? <p className="role">{block.role}</p> : null}
          {block.caption ? <p className="caption">{block.caption}</p> : null}
        </div>
      );
    case "gap":
      return <div className="gap" />;
    default: {
      const unreachable: never = block;
      return unreachable;
    }
  }
}

export function DocumentSheet({
  model,
  sheetRef,
  scale,
}: {
  model: DocumentModel;
  sheetRef: RefObject<HTMLElement | null>;
  scale: number;
}) {
  return (
    <article
      ref={sheetRef}
      className="sheet"
      lang="lv"
      style={{ transform: `translateX(-50%) scale(${scale})` }}
    >
      {model.blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </article>
  );
}
