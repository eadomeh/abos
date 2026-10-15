import type { PersonId } from "@/components/landing/people";

export type ChatSide = "customer" | "abos";

export type ChatMessage = {
  side: ChatSide;
  text: string;
  time: string;
  product?: boolean;
};

export type LiveThread = {
  id: PersonId;
  productLabel: string;
  productMeta: string;
  action: string;
  suggestions: string[];
  messages: ChatMessage[];
};

export const LIVE_THREADS: LiveThread[] = [
  {
    id: "tunde",
    productLabel: "Black sneakers · size 43",
    productMeta: "8 in stock · ₦45,000",
    action: "Lead created · black sneakers · ₦45,000",
    suggestions: ["Hold size 43 until Friday", "Can you deliver to Lekki?", "Any discount on two pairs?"],
    messages: [
      { side: "customer", text: "Hi, do you have the black sneakers in 43?", time: "21:11" },
      {
        side: "abos",
        text: "Yes — 8 pairs of the black sneakers in 43. They're ₦45,000.",
        time: "21:11",
        product: true,
      },
      { side: "customer", text: "Can you deliver by Friday?", time: "21:12" },
      { side: "abos", text: "Friday delivery works for Lekki and the Island. Should I place the order?", time: "21:12" },
    ],
  },
  {
    id: "ada",
    productLabel: "Indigo Ankara wrap · 12",
    productMeta: "2 left · ₦18,500",
    action: "Hold placed · Ankara wrap · Surulere",
    suggestions: ["Hold it until 7pm", "Do you have size 14?", "I'll pick up in Surulere"],
    messages: [
      { side: "customer", text: "Do you still have the indigo wrap in 12?", time: "18:40" },
      { side: "abos", text: "Yes — two left. ₦18,500. I can hold one until 7pm.", time: "18:40", product: true },
      { side: "customer", text: "Hold it. I'll pick up in Surulere.", time: "18:41" },
      { side: "abos", text: "Held. Surulere pickup is ready. This wrap stays attached to Ada.", time: "18:41" },
    ],
  },
  {
    id: "emeka",
    productLabel: "15-inch laptop bag · navy",
    productMeta: "6 in stock · ₦28,000",
    action: "Hold placed · 15-inch bag · Ikeja",
    suggestions: ["Hold the navy one", "Does it fit a MacBook Pro?", "Pickup tomorrow morning"],
    messages: [
      { side: "customer", text: "Does the 15-inch bag fit a MacBook?", time: "21:10" },
      {
        side: "abos",
        text: "Yes. The 15-inch navy bag fits. ₦28,000, 6 left. I can hold one in Ikeja.",
        time: "21:11",
        product: true,
      },
      { side: "customer", text: "Hold it. Tomorrow morning.", time: "21:11" },
      { side: "abos", text: "Held. Ikeja pickup is ready tomorrow. Context stays on this bag.", time: "21:12" },
    ],
  },
  {
    id: "kemi",
    productLabel: "Bone-straight bundles",
    productMeta: "Same-day Ikeja until 4pm",
    action: "Delivery booked · Ikeja · today",
    suggestions: ["Deliver to Ikeja today", "What time is cutoff?", "Hold until 5pm"],
    messages: [
      { side: "customer", text: "Can you deliver the bundles to Ikeja today?", time: "13:04" },
      { side: "abos", text: "Same-day Ikeja is open until 4pm. The bone-straight set is in stock.", time: "13:04" },
      { side: "customer", text: "Book it. Before 4.", time: "13:05" },
      { side: "abos", text: "Booked. Rider window is 2:30–4:00pm. I'll update this thread when it leaves.", time: "13:05" },
    ],
  },
  {
    id: "zainab",
    productLabel: "Shea butter wholesale",
    productMeta: "12 jars · ₦22,000",
    action: "Wholesale pack quoted · 12 jars",
    suggestions: ["How many jars in a pack?", "Can you send to PH tomorrow?", "Any unscented?"],
    messages: [
      { side: "customer", text: "How many jars in a wholesale pack?", time: "10:22" },
      { side: "abos", text: "12 jars. ₦22,000 for the pack, unscented or honey.", time: "10:22", product: true },
      { side: "customer", text: "Honey. Port Harcourt tomorrow.", time: "10:23" },
      { side: "abos", text: "Honey pack is reserved. PH delivery is on the morning run.", time: "10:23" },
    ],
  },
  {
    id: "funke",
    productLabel: "Sauvage 100ml",
    productMeta: "3 sealed bottles · ₦62,000",
    action: "Authenticity confirmed · 3 sealed",
    suggestions: ["Is it genuine stock?", "Hold one for East Legon", "Any 60ml?"],
    messages: [
      { side: "customer", text: "Is Sauvage 100ml genuine stock?", time: "16:18" },
      { side: "abos", text: "Yes — sealed, ₦62,000, 3 bottles. I can hold one for East Legon until 4pm.", time: "16:18", product: true },
      { side: "customer", text: "Hold one. I'll come today.", time: "16:19" },
      { side: "abos", text: "Held. East Legon pickup is on this bottle until 4pm.", time: "16:19" },
    ],
  },
  {
    id: "ibrahim",
    productLabel: "3.5kVA generator",
    productMeta: "Unit in stock · install Thursday",
    action: "Install booked · Thursday",
    suggestions: ["Can you install this week?", "What's the price?", "Need a 5kVA instead"],
    messages: [
      { side: "customer", text: "Can you install the 3.5kVA this week?", time: "09:41" },
      { side: "abos", text: "The 3.5kVA is in stock. Installation is Thursday in Kano.", time: "09:41", product: true },
      { side: "customer", text: "Thursday works. Book it.", time: "09:42" },
      { side: "abos", text: "Booked. Engineer window is 10am–1pm. I'll keep this thread on the unit.", time: "09:42" },
    ],
  },
  {
    id: "ngozi",
    productLabel: "Kids striped set · age 4",
    productMeta: "2 left · ₦9,800",
    action: "Hold placed · kidswear age 4",
    suggestions: ["Still have age 4?", "Hold both sets", "Any age 6?"],
    messages: [
      { side: "customer", text: "The striped set — age 4 still available?", time: "11:08" },
      { side: "abos", text: "Yes. Two sets left at ₦9,800.", time: "11:08", product: true },
      { side: "customer", text: "Hold both. I'll pay this afternoon.", time: "11:09" },
      { side: "abos", text: "Both held. I'll keep age 4 attached to Ngozi until evening.", time: "11:09" },
    ],
  },
  {
    id: "amaka",
    productLabel: "Wedding bead set",
    productMeta: "Saturday if ordered by 2pm",
    action: "Wedding set confirmed · Saturday",
    suggestions: ["Wedding set for Saturday?", "What colours do you have?", "Can you add a veil?"],
    messages: [
      { side: "customer", text: "Wedding set for Saturday — possible?", time: "12:14" },
      { side: "abos", text: "Yes if ordered by 2pm tomorrow. Coral, ivory and gold are in.", time: "12:14" },
      { side: "customer", text: "Coral. Book it.", time: "12:15" },
      { side: "abos", text: "Coral set is booked for Saturday. I'll send the deposit note on this thread.", time: "12:15" },
    ],
  },
  {
    id: "chidi",
    productLabel: "Clear MagSafe case",
    productMeta: "14 in stock · ₦4,500",
    action: "Restock noted · Friday",
    suggestions: ["Is the clear case still ₦4,500?", "Any for iPhone 16?", "Restock when?"],
    messages: [
      { side: "customer", text: "Is the clear case still ₦4,500?", time: "15:02" },
      { side: "abos", text: "Yes. 14 in stock for the current model. iPhone 16 restock is Friday.", time: "15:02", product: true },
      { side: "customer", text: "Put me on the 16 list.", time: "15:03" },
      { side: "abos", text: "You're on the Friday restock. I'll ping this chat when the 16 cases land.", time: "15:03" },
    ],
  },
];

export function threadById(id: PersonId): LiveThread {
  return LIVE_THREADS.find((t) => t.id === id) ?? LIVE_THREADS[0]!;
}

export type AgentReply = {
  text: string;
};

export function replyToAbos(input: string): AgentReply {
  const q = input.toLowerCase().trim();

  if (/forgot password|reset my password|can't log in|cannot log in|locked out/.test(q)) {
    return {
      text: "To recover access, open Log in and choose Forgot password? Enter the email linked to your ABOS account and follow the recovery instructions.",
    };
  }

  if (/\b(log ?in|sign ?in|existing account|access my account)\b/.test(q)) {
    return {
      text: "To access an existing account, tap Log in at the top of the website. The sign-in screen lets you continue with your registered email and password or use Google when Google sign-in is enabled.",
    };
  }

  if (/\b(sign ?up|create an account|register|get started|new account)\b/.test(q)) {
    return {
      text: "To get started, tap Get started and choose an available sign-up method. Email accounts may require address verification before you can sign in.",
    };
  }

  if (/business idea|what should i sell|what business should|business plan|business advice|how do i make money/.test(q)) {
    return {
      text: "I'm the ABOS website guide, so I focus on ABOS—not choosing or planning a business for you. I can explain the platform, its features, account creation, or sign-in.",
    };
  }

  if (/price|pricing|cost|how much|free plan|subscription/.test(q)) {
    return {
      text: "I don't have confirmed public pricing details to quote. Please rely on ABOS's official pricing information rather than an estimate from this guide.",
    };
  }

  if (/whatsapp|integration|connect.*channel|channel.*connect/.test(q)) {
    return {
      text: "ABOS is designed to bring customer conversations, including WhatsApp, into one operating workspace. Connecting a real business account depends on the integration setup; this website guide cannot connect it for you.",
    };
  }

  if (/how does abos help|benefit|feature|what can abos do|how it work|platform|customer|conversation|automation|operation|inventory|stock|order/.test(q)) {
    return {
      text: "ABOS brings customer conversations, customer context, intelligence, automation, and business operations into one workspace. The goal is to help growing African businesses work from one connected operating layer instead of disconnected tools.",
    };
  }

  if (/what is abos|who are you|what does abos|\babos\b/.test(q)) {
    return {
      text: "ABOS is an AI Business Operating System for growing African businesses. It is built to connect conversations, customer context, intelligence, automation, and operations in one system.",
    };
  }

  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q)) {
    return {
      text: "Hello! I'm the ABOS website guide. Ask me what ABOS does, how it works, how to create an account, or how to sign in.",
    };
  }

  return {
    text: "I can help explain ABOS, its features, account creation, and sign-in. Try asking “What is ABOS?”, “How does it help a business?”, or “How do I log in?”",
  };
}

export const ASK_SUGGESTIONS = [
  "What is ABOS?",
  "How does ABOS help a business?",
  "How do I create an account?",
  "How do I log in?",
] as const;
