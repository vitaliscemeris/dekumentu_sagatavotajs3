import { useEffect, useRef, useState } from "react";
import type { DocumentModel } from "../model.ts";
import { DocumentSheet } from "./DocumentView.tsx";

export function Preview({ model, active = true }: { model: DocumentModel; active?: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const [scale, setScale] = useState(0.62);
  const [slotHeight, setSlotHeight] = useState(720);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    if (!frame || !sheet) return;

    const measure = () => {
      const width = sheet.offsetWidth || 794;
      const next = Math.min(1, Math.max(0.32, (frame.clientWidth - 4) / width));
      setScale(next);
      setSlotHeight(Math.ceil(sheet.offsetHeight * next) + 8);
      setReady(true);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [model, active]);

  return (
    <section className="preview" aria-label="Dokumenta priekšskatījums">
      <div className="preview-bar">
        <span>A4 priekšskatījums</span>
        <span>Drukā lapas izmērs ir pilns</span>
      </div>
      <div className="preview-frame" ref={frameRef}>
        <div className="preview-slot" data-ready={ready ? "true" : "false"} style={{ height: slotHeight }}>
          <DocumentSheet model={model} sheetRef={sheetRef} scale={scale} />
        </div>
      </div>
    </section>
  );
}
