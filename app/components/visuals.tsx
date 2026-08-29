"use client";

import { useState } from "react";
import { ToolIcon, type ToolName } from "./tool-icon";

const toolLegend: { tool: ToolName; name: string }[] = [
  { tool: "highlight", name: "Highlight" },
  { tool: "underline", name: "Underline" },
  { tool: "draw", name: "Freehand" },
  { tool: "arrow", name: "Arrow" },
  { tool: "rect", name: "Rectangle" },
  { tool: "ellipse", name: "Ellipse" },
  { tool: "note", name: "Note" },
];

export function Toolbar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`visual-toolbar${compact ? " visual-toolbar-compact" : ""}`} aria-label="Quillcrypt annotation toolbar">
      {toolLegend.map(({ tool, name }) => <span key={tool} title={name}><ToolIcon tool={tool} /></span>)}
      <i aria-hidden="true" />
      <b>List</b>
    </div>
  );
}

export function BrowserFrame({ children, url = "field-notes.example/article" , className = "" }: { children: React.ReactNode; url?: string; className?: string }) {
  return (
    <div className={`visual-browser ${className}`}>
      <div className="visual-browser-bar"><span aria-hidden="true"><i /><i /><i /></span><b>{url}</b></div>
      <div className="visual-browser-page">{children}</div>
    </div>
  );
}

export function AnnotatedCanvas({ animated = false, compact = false }: { animated?: boolean; compact?: boolean }) {
  const [active, setActive] = useState<ToolName | null>(null);
  return (
    <div className={`annotated-canvas${animated ? " is-animated" : ""}${compact ? " is-compact" : ""}`} aria-label="A webpage showing all seven Quillcrypt annotation tools">
      <BrowserFrame>
        <article className="mock-article">
          <p className="mock-kicker">The architecture of context</p>
          <h2>A page remembers what the reader noticed.</h2>
          <p>Reading is not passive. We return to the same source with questions, decisions, and <mark data-tool="highlight">a thought worth keeping close</mark>.</p>
          <p><span className="mock-underline" data-tool="underline">Context is most useful beside its source.</span> Move it elsewhere and the evidence begins to fade.</p>
          <div className="mock-image"><span>Public page</span><small>Private layer</small></div>
          <p className="mock-last">The important sentence lives here, even when the page around it changes.</p>
        </article>
        <svg className="annotation-svg" viewBox="0 0 800 520" aria-hidden="true">
          <path data-tool="draw" className="mark-freehand" d="M118 382 C145 345 170 417 202 365 C222 335 245 389 270 356" />
          <path data-tool="arrow" className="mark-arrow" d="M600 120 C566 157 545 185 510 226 M510 226 L519 205 M510 226 L534 224" />
          <rect data-tool="rect" className="mark-rect" x="420" y="288" width="240" height="112" />
          <ellipse data-tool="ellipse" className="mark-ellipse" cx="267" cy="455" rx="118" ry="35" />
        </svg>
        <aside data-tool="note" className="margin-note"><strong>Keep this.</strong><span>The context belongs beside the source.</span></aside>
        <Toolbar compact />
      </BrowserFrame>
      {!compact && <div className="tool-labels" aria-label="Annotation tool legend">
        {toolLegend.map(({ tool, name }) => (
          <button key={tool} className={active === tool ? "active" : ""} onMouseEnter={() => setActive(tool)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(tool)} onBlur={() => setActive(null)} onClick={() => setActive(active === tool ? null : tool)}>
            <ToolIcon tool={tool} /><span>{name}</span>
          </button>
        ))}
      </div>}
      {active && <style>{`.annotated-canvas [data-tool]:not([data-tool="${active}"]) { opacity:.18 } .annotated-canvas [data-tool="${active}"] { opacity:1; filter:saturate(1.15) }`}</style>}
    </div>
  );
}

export function AnnotationListDemo() {
  const [active, setActive] = useState("note");
  return (
    <div className={`annotation-list-demo active-${active}`}>
      <BrowserFrame url="review.example/launch">
        <article className="review-page"><span>Northstar</span><h3>Build better financial habits.</h3><p>Track every account in one calm view.</p><button>Start tracking</button></article>
        <div className="review-highlight">every account</div><div className="review-rectangle" /><div className="review-arrow">↘</div><div className="review-note">Increase contrast?</div>
      </BrowserFrame>
      <aside className="annotation-sidebar"><h3>Annotations</h3><p>Filter annotations</p>
        {[['note','Increase contrast?','Note'],['arrow','Heading hierarchy','Arrow'],['rect','Primary action','Rectangle']].map(([id,title,type]) => <button key={id} onClick={() => setActive(id)} onFocus={() => setActive(id)} className={active === id ? "active" : ""}><strong>{title}</strong><span>{type}</span></button>)}
      </aside>
    </div>
  );
}

export function WorkspaceScopeDiagram() {
  return (
    <div className="scope-diagram" aria-label="A page workspace covers one URL while a domain workspace covers several pages on the same site">
      <article><h3>Just this page</h3><div className="scope-pages"><span className="selected">example.com/article-a</span></div><b>One annotation layer</b></article>
      <article><h3>This whole domain</h3><div className="scope-pages"><span>example.com/article-a</span><span>example.com/article-b</span><span>example.com/article-c</span></div><b>One shared workspace</b></article>
    </div>
  );
}

export function OfflineSequence() {
  return (
    <div className="offline-sequence" aria-label="Annotations continue locally while offline and synchronize after reconnection">
      <article><span>Online</span><div className="mini-page"><mark>Key idea</mark></div><p>Workspace connected</p></article>
      <i aria-hidden="true">→</i>
      <article><span>Local</span><div className="mini-page"><mark>Key idea</mark><b>New note</b></div><p>Work continues offline</p></article>
      <i aria-hidden="true">→</i>
      <article><span>Reconnected</span><div className="mini-page"><mark>Key idea</mark><b>New note</b></div><p>Queued edits synchronize</p></article>
    </div>
  );
}

export function EncryptionFlow() {
  return (
    <div className="encryption-flow" aria-label="Readable annotation content is encrypted in Client A, relayed as ciphertext, and decrypted in Client B">
      <article className="client-node"><span>Client A</span><p>“This sentence matters.”</p><b>Encrypt locally</b></article>
      <div className="cipher-path"><span>Encrypted payload</span><code>7f9a21c48b73e05d</code></div>
      <article className="relay-node"><span>Quillcrypt relay</span><p>Workspace routing</p><code>7f9a21c48b73e05d</code><b>No readable annotation</b></article>
      <div className="cipher-path"><span>Encrypted payload</span><code>7f9a21c48b73e05d</code></div>
      <article className="client-node"><span>Client B</span><b>Decrypt locally</b><p>“This sentence matters.”</p></article>
    </div>
  );
}

export function PrivacySummary() {
  return (
    <div className="privacy-summary" aria-label="Summary of how personal and shared annotations are handled">
      <article><span>Your device</span><strong>Personal annotations</strong><b>Stay local</b></article>
      <article><span>Shared workspace</span><strong>Readable content</strong><b>Encrypted before transmission</b></article>
      <article><span>Relay</span><strong>Encrypted payload</strong><b>Not readable as annotations</b></article>
    </div>
  );
}

export function UseCaseScene({ kind }: { kind: "review" | "research" | "engineering" | "market" }) {
  if (kind === "review") return <div className="case-scene review-scene"><BrowserFrame url="staging.northstar.example"><article><b>Northstar</b><h3>Build better financial habits.</h3><p>Track everything in one place.</p><button>Start tracking</button></article><span className="case-box" /><span className="case-arrow">↘</span><aside>H1 wraps badly at tablet width.</aside><mark>This feels too generic.</mark></BrowserFrame></div>;
  if (kind === "research") return <div className="case-scene research-scene"><article><p>Research paper</p><h3>Distributed Memory and the Architecture of Context</h3><p>Meaning is not stored in fragments alone. <mark>The surrounding evidence changes how a claim is understood.</mark></p><p><u>Readers build durable understanding through return and comparison.</u></p></article><aside>This is the core claim.</aside><span>Compare with the 2024 study.</span></div>;
  if (kind === "engineering") return <div className="case-scene engineering-scene"><div><b>API reference</b><h3>POST /workspace/update</h3><pre><code>{`const frame = encrypt(update, key)\nsocket.send(frame)`}</code></pre><p><mark>Retries preserve the encrypted frame.</mark></p></div><aside>Document the failure case.</aside><span>Why does this happen client-side?</span></div>;
  return <div className="case-scene market-scene"><article><b>Competitor A</b><p>Teams plan moved above the fold.</p><span>Pricing changed.</span></article><article><b>Competitor B</b><p>A new positioning line appears in the hero.</p><span>New positioning.</span></article><article><b>Competitor C</b><p>Enterprise language now leads the page.</p><span>Watch this shift.</span></article></div>;
}
