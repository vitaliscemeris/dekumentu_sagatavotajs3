import { useEffect, useMemo, useRef, useState } from "react";
import { downloadDocx } from "./document/docx.ts";
import { Preview } from "./document/Preview.tsx";
import {
  blankItem,
  cloneDraft,
  lineSum,
  money,
  type Draft,
  type Field,
  type LineItem,
} from "./model.ts";
import { loadPersisted, mergeDraft, savePersisted } from "./storage.ts";
import { getTemplate, templates } from "./templates/index.ts";

interface AppState {
  templateId: string;
  drafts: Record<string, Draft>;
}

function initialState(): AppState {
  const stored = loadPersisted();
  const drafts: Record<string, Draft> = {};
  for (const template of templates) {
    drafts[template.id] = mergeDraft(template.empty, stored?.drafts?.[template.id]);
  }
  const templateId = templates.some((template) => template.id === stored?.templateId)
    ? stored!.templateId
    : templates[0].id;
  return { templateId, drafts };
}

function fieldVisible(field: Field, draft: Draft): boolean {
  return !field.showWhen || draft.values[field.showWhen.key] === field.showWhen.equals;
}

function missingCount(fields: Field[], draft: Draft): number {
  return fields.filter((field) => field.required && fieldVisible(field, draft) && !draft.values[field.key]?.trim()).length;
}

function sectionsOf(fields: Field[]): { title: string; fields: Field[] }[] {
  const sections: { title: string; fields: Field[] }[] = [];
  for (const field of fields) {
    const section = sections.find((item) => item.title === field.section);
    if (section) section.fields.push(field);
    else sections.push({ title: field.section, fields: [field] });
  }
  return sections;
}

function itemSumLabel(item: LineItem): string {
  if (!item.qty?.trim() && !item.price?.trim()) return "—";
  return money(lineSum(item));
}

function useNarrowScreen(query = "(max-width: 720px)"): boolean {
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setNarrow(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return narrow;
}

function revealActiveTemplate(rail: HTMLElement) {
  const active = rail.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (!active) return;
  const railBox = rail.getBoundingClientRect();
  const cardBox = active.getBoundingClientRect();
  if (cardBox.top < railBox.top) rail.scrollTop -= railBox.top - cardBox.top;
  else if (cardBox.bottom > railBox.bottom) rail.scrollTop += cardBox.bottom - railBox.bottom;
  if (cardBox.left < railBox.left) rail.scrollLeft -= railBox.left - cardBox.left;
  else if (cardBox.right > railBox.right) rail.scrollLeft += cardBox.right - railBox.right;
}

export default function App() {
  const [state, setState] = useState(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pane, setPane] = useState<"form" | "preview">("form");
  const narrow = useNarrowScreen();
  const railRef = useRef<HTMLElement>(null);
  const template = getTemplate(state.templateId);
  const draft = state.drafts[template.id] ?? template.empty;
  const model = useMemo(() => template.render(draft), [template, draft]);
  const sections = useMemo(() => sectionsOf(template.fields), [template]);
  const missing = missingCount(template.fields, draft);
  const totals = template.totals?.(draft);

  useEffect(() => {
    savePersisted(state);
  }, [state]);

  useEffect(() => {
    document.title = `${template.name} · Dokumentu sagatavotājs`;
  }, [template.name]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    revealActiveTemplate(rail);
  }, [template.id, narrow]);

  function patch(recipe: (current: Draft) => Draft) {
    setState((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [template.id]: recipe(current.drafts[template.id] ?? cloneDraft(template.empty)),
      },
    }));
  }

  async function saveWord() {
    setBusy(true);
    setError(null);
    try {
      await downloadDocx(template, draft);
    } catch {
      setError("Word failu neizdevās sagatavot. Dokumentu var izdrukāt vai saglabāt kā PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="seal" aria-hidden="true">
            Ds
          </span>
          <div>
            <strong>Dokumentu sagatavotājs</strong>
            <p>Ievadi datus formā. Veidne aizpildās uzreiz.</p>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setError(null);
              patch(() => cloneDraft(template.sample));
            }}
          >
            Paraugs
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setError(null);
              patch(() => cloneDraft(template.empty));
            }}
          >
            Notīrīt
          </button>
          <button type="button" className="btn secondary" onClick={() => void saveWord()} disabled={busy}>
            {busy ? "Sagatavo…" : "Lejupielādēt Word"}
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setError(null);
              window.print();
            }}
          >
            Drukāt vai PDF
          </button>
        </div>
      </header>

      {narrow ? (
        <div className="pane-switch" role="tablist" aria-label="Forma vai priekšskatījums">
          <button type="button" role="tab" aria-selected={pane === "form"} onClick={() => setPane("form")}>
            Forma
          </button>
          <button type="button" role="tab" aria-selected={pane === "preview"} onClick={() => setPane("preview")}>
            Priekšskatījums
          </button>
        </div>
      ) : null}

      <div className="workspace" data-pane={narrow ? pane : "both"}>
        <aside className="rail" aria-label="Veidnes" ref={railRef}>
          {templates.map((item) => (
            <button
              key={item.id}
              type="button"
              className="template-card"
              aria-pressed={item.id === template.id}
              onClick={() => {
                setError(null);
                setState((current) => ({ ...current, templateId: item.id }));
              }}
            >
              <span className="kind">{item.kind}</span>
              <strong>{item.name}</strong>
              <p>{item.blurb}</p>
            </button>
          ))}
        </aside>

        <form
          className="form-panel"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="form-head">
            <p className="eyebrow">{template.kind}</p>
            <h1>{template.name}</h1>
            <p>{template.blurb}</p>
          </div>

          {sections.map((section) => {
            const visible = section.fields.filter((field) => fieldVisible(field, draft));
            const showLines = template.lineItems?.afterSection === section.title;
            if (!visible.length && !showLines) return null;
            return (
              <section className="block" key={section.title}>
                {visible.length ? (
                  <>
                    <h2>{section.title}</h2>
                    <div className="grid">
                      {visible.map((field) => (
                        <label key={field.key} className={field.span === "full" ? "field span-full" : "field"}>
                          <span>
                            {field.label}
                            {field.required ? (
                              <abbr className="req" title="Obligāts">
                                *
                              </abbr>
                            ) : null}
                          </span>
                          {field.type === "textarea" ? (
                            <textarea
                              value={draft.values[field.key] ?? ""}
                              rows={field.rows ?? 4}
                              placeholder={field.placeholder}
                              required={field.required}
                              onChange={(event) =>
                                patch((current) => ({
                                  ...current,
                                  values: { ...current.values, [field.key]: event.target.value },
                                }))
                              }
                            />
                          ) : field.type === "select" ? (
                            <select
                              value={draft.values[field.key] ?? ""}
                              required={field.required}
                              onChange={(event) =>
                                patch((current) => ({
                                  ...current,
                                  values: { ...current.values, [field.key]: event.target.value },
                                }))
                              }
                            >
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type === "number" ? "text" : field.type}
                              inputMode={field.type === "number" ? "decimal" : undefined}
                              autoComplete={field.autoComplete}
                              value={draft.values[field.key] ?? ""}
                              placeholder={field.placeholder}
                              required={field.required}
                              onChange={(event) =>
                                patch((current) => ({
                                  ...current,
                                  values: { ...current.values, [field.key]: event.target.value },
                                }))
                              }
                            />
                          )}
                          {field.hint ? <small>{field.hint}</small> : null}
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}

                {showLines && template.lineItems ? (
                  <div className="lines-block">
                    <div className="block-head">
                      <h2>{template.lineItems.title}</h2>
                      <button
                        type="button"
                        className="btn tiny"
                        onClick={() =>
                          patch((current) => ({
                            ...current,
                            items: [...current.items, blankItem(template.lineItems!.columns)],
                          }))
                        }
                      >
                        {template.lineItems.addLabel}
                      </button>
                    </div>
                    {draft.items.length ? (
                      <div className="lines">
                        <div
                          className="line-head"
                          style={{
                            gridTemplateColumns: `${template.lineItems.columns
                              .map((_, index) => (index === 0 ? "minmax(140px, 1.8fr)" : "minmax(64px, 0.7fr)"))
                              .join(" ")} minmax(72px, 0.8fr) 36px`,
                          }}
                        >
                          {template.lineItems.columns.map((column) => (
                            <span key={column.key}>{column.label}</span>
                          ))}
                          <span>Summa</span>
                          <span />
                        </div>
                        {draft.items.map((item, index) => (
                          <div
                            className="line-row"
                            key={index}
                            style={{
                              gridTemplateColumns: `${template.lineItems!.columns
                                .map((_, columnIndex) =>
                                  columnIndex === 0 ? "minmax(140px, 1.8fr)" : "minmax(64px, 0.7fr)",
                                )
                                .join(" ")} minmax(72px, 0.8fr) 36px`,
                            }}
                          >
                            {template.lineItems!.columns.map((column) => (
                              <label className="line-field" key={column.key}>
                                <span className="line-label">{column.label}</span>
                                <input
                                  aria-label={`${column.label} ${index + 1}`}
                                  inputMode={column.numeric ? "decimal" : "text"}
                                  placeholder={column.placeholder}
                                  value={item[column.key] ?? ""}
                                  onChange={(event) =>
                                    patch((current) => ({
                                      ...current,
                                      items: current.items.map((row, rowIndex) =>
                                        rowIndex === index ? { ...row, [column.key]: event.target.value } : row,
                                      ),
                                    }))
                                  }
                                />
                              </label>
                            ))}
                            <strong className="line-sum">{itemSumLabel(item)}</strong>
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Dzēst ${index + 1}. pozīciju`}
                              onClick={() =>
                                patch((current) => ({
                                  ...current,
                                  items: current.items.filter((_, rowIndex) => rowIndex !== index),
                                }))
                              }
                            >
                              <span aria-hidden="true">×</span>
                              <span className="icon-text">Dzēst</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-lines">Pievieno pirmo pozīciju.</p>
                    )}
                    {totals ? (
                      <div className="summary">
                        {totals.map((row) => (
                          <div key={row.label} className={row.strong ? "strong" : undefined}>
                            <span>{row.label}</span>
                            <span>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}

          <p className="status">
            {missing > 0 ? `Tukši obligātie lauki: ${missing}. ` : "Obligātie lauki ir aizpildīti. "}
            Melnraksts saglabājas šajā pārlūkā.
          </p>
          {error ? (
            <p className="error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="disclaimer">
            Veidnes ir paraugi ikdienas dokumentiem. Pirms oficiālas lietošanas pārbaudi tekstu un rekvizītus.
          </p>
        </form>

        <Preview model={model} active={!narrow || pane === "preview"} />
      </div>
    </div>
  );
}
