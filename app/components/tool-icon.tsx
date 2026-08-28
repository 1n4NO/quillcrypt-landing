const TOOL_ICONS = {
  highlight: "M4 15 L14 5 L18 9 L8 19 Z M4 15 L4 19 L8 19",
  underline: "M6 5 L6 13 A6 6 0 0 0 18 13 L18 5 M4 19 L20 19",
  draw: "M4 18 Q8 6 12 12 T20 6",
  arrow: "M4 16 L16 4 M16 4 L9 4 M16 4 L16 11",
  rect: "M4 5 h16 v14 h-16 Z",
  ellipse: "M12 4 a8 6 0 1 0 0.01 0 Z",
  note: "M5 4 h14 v12 h-6 l-4 4 v-4 h-4 Z",
} as const;

export type ToolName = keyof typeof TOOL_ICONS;

export function ToolIcon({ tool }: { tool: ToolName }) {
  return (
    <svg className="tool-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={TOOL_ICONS[tool]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
