export type FlowRole = "io" | "mind" | "data";

export type FlowNode = {
  id: string;
  index: string;
  title: string;
  plain: string;
  role: FlowRole;
  tools?: string[];
  position: [number, number, number];
};

export const FLOW_NODES: FlowNode[] = [
  {
    id: "in",
    index: "01",
    title: "Message in",
    plain: "A customer texts the shop on WhatsApp — typos, shorthand, and all.",
    role: "io",
    position: [-5.4, 0.15, 0.8],
  },
  {
    id: "understands",
    index: "02",
    title: "Understands",
    plain: "Reads informal messages as written: abbreviations, emoji, mixed languages.",
    role: "mind",
    position: [-3.5, 1.25, -0.6],
  },
  {
    id: "remembers",
    index: "03",
    title: "Remembers",
    plain: "Pulls the thread from yesterday. Not a fresh chatbot session.",
    role: "mind",
    position: [-1.6, -0.85, 0.9],
  },
  {
    id: "checks",
    index: "04",
    title: "Checks real data",
    plain: "Looks up the catalog, stock, customer, and order records before answering.",
    role: "data",
    position: [0.2, 1.15, -0.4],
  },
  {
    id: "reasons",
    index: "05",
    title: "Reasons",
    plain: "Decides what is true, what is missing, and what to do next.",
    role: "mind",
    position: [2.0, 0.05, 0.7],
  },
  {
    id: "action",
    index: "06",
    title: "Takes action",
    plain: "Calls a real tool — then writes the lead, task, or note into the record.",
    role: "data",
    tools: ["search_products", "create_lead", "create_task"],
    position: [3.9, 1.05, -0.7],
  },
  {
    id: "out",
    index: "07",
    title: "Replies on WhatsApp",
    plain: "Sends a grounded answer. Never a made-up price, stock count, or policy.",
    role: "io",
    position: [5.6, 0.2, 0.5],
  },
];

export function nodeColor(role: FlowRole): string {
  if (role === "io") return "#25D366";
  if (role === "data") return "#FF9635";
  return "#8B2FF0";
}


