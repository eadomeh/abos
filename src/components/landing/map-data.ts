import { PERSON } from "@/components/landing/people";

export const AFRICA_RING: [number, number][] = [
  [-5.6, 35.9],
  [-1.8, 35.2],
  [1.2, 36.5],
  [6.2, 37.0],
  [10.2, 37.0],
  [11.2, 33.0],
  [13.2, 32.6],
  [20.0, 32.4],
  [25.0, 31.6],
  [29.6, 31.3],
  [32.6, 31.2],
  [34.0, 27.8],
  [32.5, 22.4],
  [36.6, 22.0],
  [37.0, 20.0],
  [38.6, 18.0],
  [39.0, 15.5],
  [42.4, 16.6],
  [43.4, 12.6],
  [48.3, 14.3],
  [51.3, 11.9],
  [51.2, 8.5],
  [49.0, 5.5],
  [47.5, 4.2],
  [51.0, 2.0],
  [43.5, 1.0],
  [41.8, -1.7],
  [41.9, -6.0],
  [40.5, -10.5],
  [40.4, -14.5],
  [39.3, -16.0],
  [37.0, -17.5],
  [35.4, -19.0],
  [32.8, -26.0],
  [29.0, -31.7],
  [27.0, -33.5],
  [25.6, -33.9],
  [22.9, -34.1],
  [18.4, -34.8],
  [18.3, -32.5],
  [18.0, -28.9],
  [14.5, -22.0],
  [12.5, -17.2],
  [13.4, -9.0],
  [12.0, -6.0],
  [11.7, -4.8],
  [9.4, 4.0],
  [7.5, 4.3],
  [3.4, 6.4],
  [-1.0, 5.0],
  [-3.9, 4.9],
  [-7.8, 4.4],
  [-10.0, 6.0],
  [-14.5, 10.6],
  [-16.6, 12.3],
  [-16.8, 13.6],
  [-16.3, 16.0],
  [-16.5, 21.3],
  [-14.5, 23.5],
  [-14.0, 26.4],
  [-9.4, 32.0],
  [-5.6, 35.9],
];

export const MADAGASCAR_RING: [number, number][] = [
  [49.2, -12.0],
  [50.5, -15.2],
  [47.6, -25.0],
  [43.6, -25.3],
  [43.2, -22.0],
  [44.2, -17.5],
  [47.0, -13.3],
  [49.2, -12.0],
];

export const MAP_BOUNDS = {
  minLon: -18,
  maxLon: 52,
  minLat: -35,
  maxLat: 38,
};

export function lonLatToPct(lon: number, lat: number): { x: number; y: number } {
  const { minLon, maxLon, minLat, maxLat } = MAP_BOUNDS;
  return {
    x: ((lon - minLon) / (maxLon - minLon)) * 100,
    y: ((maxLat - lat) / (maxLat - minLat)) * 100,
  };
}

export function lonLatToSvg(lon: number, lat: number, w = 200, h = 240): { x: number; y: number } {
  const p = lonLatToPct(lon, lat);
  return { x: (p.x / 100) * w, y: (p.y / 100) * h };
}

export function ringToSvgPath(ring: [number, number][], w = 200, h = 240): string {
  return (
    ring
      .map(([lon, lat], i) => {
        const { x, y } = lonLatToSvg(lon, lat, w, h);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export type MapThread = {
  person: string;
  avatar: string;
  snippet: string;
};

export type MapCity = {
  id: string;
  name: string;
  country: string;
  lon: number;
  lat: number;
  snippet: string;
  person: string;
  avatar: string;
  delay: number;
  threads: MapThread[];
};

export const MAP_CITIES: MapCity[] = [
  {
    id: "lagos",
    name: "Lagos",
    country: "Nigeria",
    lon: 3.38,
    lat: 6.52,
    snippet: PERSON.tunde.preview,
    person: PERSON.tunde.name,
    avatar: PERSON.tunde.avatar,
    delay: 0,
    threads: [
      { person: PERSON.tunde.name, avatar: PERSON.tunde.avatar, snippet: "Black sneakers — 8 pairs in 43. ₦45,000." },
      { person: PERSON.ada.name, avatar: PERSON.ada.avatar, snippet: "Indigo wrap, size 12 — two left." },
      { person: PERSON.kemi.name, avatar: PERSON.kemi.avatar, snippet: "Same-day Ikeja until 4pm." },
    ],
  },
  {
    id: "abuja",
    name: "Abuja",
    country: "Nigeria",
    lon: 7.4,
    lat: 9.08,
    snippet: "Garki delivery is open tomorrow.",
    person: PERSON.ada.name,
    avatar: PERSON.ada.avatar,
    delay: 0.4,
    threads: [
      { person: PERSON.ada.name, avatar: PERSON.ada.avatar, snippet: "Garki delivery is open tomorrow." },
      { person: PERSON.ibrahim.name, avatar: PERSON.ibrahim.avatar, snippet: "3.5kVA install is Thursday." },
      { person: PERSON.kemi.name, avatar: PERSON.kemi.avatar, snippet: "Hold the navy bag until 5pm." },
    ],
  },
  {
    id: "ibadan",
    name: "Ibadan",
    country: "Nigeria",
    lon: 3.95,
    lat: 7.38,
    snippet: "Hold the size 43 until 6pm.",
    person: PERSON.kemi.name,
    avatar: PERSON.kemi.avatar,
    delay: 0.8,
    threads: [
      { person: PERSON.kemi.name, avatar: PERSON.kemi.avatar, snippet: "Hold the size 43 until 6pm." },
      { person: PERSON.zainab.name, avatar: PERSON.zainab.avatar, snippet: "Shea pack — 12 jars, ₦22,000." },
      { person: PERSON.tunde.name, avatar: PERSON.tunde.avatar, snippet: "Black pair in 43 is held." },
    ],
  },
  {
    id: "ph",
    name: "Port Harcourt",
    country: "Nigeria",
    lon: 7.05,
    lat: 4.82,
    snippet: "Wholesale pack is 12 jars. ₦22,000.",
    person: PERSON.zainab.name,
    avatar: PERSON.zainab.avatar,
    delay: 1.2,
    threads: [
      { person: PERSON.zainab.name, avatar: PERSON.zainab.avatar, snippet: "Wholesale pack is 12 jars. ₦22,000." },
      { person: PERSON.funke.name, avatar: PERSON.funke.avatar, snippet: "Sauvage 100ml — 3 sealed bottles." },
      { person: PERSON.emeka.name, avatar: PERSON.emeka.avatar, snippet: "15-inch bag fits. Navy, 6 left." },
    ],
  },
  {
    id: "kano",
    name: "Kano",
    country: "Nigeria",
    lon: 8.59,
    lat: 12.0,
    snippet: "The 3.5kVA is in stock for Thursday.",
    person: PERSON.ibrahim.name,
    avatar: PERSON.ibrahim.avatar,
    delay: 1.6,
    threads: [
      { person: PERSON.ibrahim.name, avatar: PERSON.ibrahim.avatar, snippet: "The 3.5kVA is in stock for Thursday." },
      { person: PERSON.ngozi.name, avatar: PERSON.ngozi.avatar, snippet: "Kids striped set, age 4 — two left." },
      { person: PERSON.ada.name, avatar: PERSON.ada.avatar, snippet: "Ankara set for Saturday — yes." },
    ],
  },
  {
    id: "accra",
    name: "Accra",
    country: "Ghana",
    lon: -0.19,
    lat: 5.6,
    snippet: "Same-day East Legon until 4pm.",
    person: PERSON.funke.name,
    avatar: PERSON.funke.avatar,
    delay: 2.0,
    threads: [
      { person: PERSON.funke.name, avatar: PERSON.funke.avatar, snippet: "Same-day East Legon until 4pm." },
      { person: PERSON.amaka.name, avatar: PERSON.amaka.avatar, snippet: "Wedding beads if ordered by 2pm." },
      { person: PERSON.chidi.name, avatar: PERSON.chidi.avatar, snippet: "Phone case restock Friday." },
    ],
  },
  {
    id: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    lon: 36.82,
    lat: -1.29,
    snippet: "Coral wedding set is booked for Saturday.",
    person: PERSON.amaka.name,
    avatar: PERSON.amaka.avatar,
    delay: 2.4,
    threads: [
      { person: PERSON.amaka.name, avatar: PERSON.amaka.avatar, snippet: "Coral wedding set is booked for Saturday." },
      { person: PERSON.kemi.name, avatar: PERSON.kemi.avatar, snippet: "Same-day Westlands until 3pm." },
      { person: PERSON.tunde.name, avatar: PERSON.tunde.avatar, snippet: "Sneaker 43 — 4 pairs remain." },
    ],
  },
  {
    id: "dakar",
    name: "Dakar",
    country: "Senegal",
    lon: -17.47,
    lat: 14.72,
    snippet: "Clear case still ₦4,500. 14 in stock.",
    person: PERSON.chidi.name,
    avatar: PERSON.chidi.avatar,
    delay: 2.8,
    threads: [
      { person: PERSON.chidi.name, avatar: PERSON.chidi.avatar, snippet: "Clear case still ₦4,500. 14 in stock." },
      { person: PERSON.zainab.name, avatar: PERSON.zainab.avatar, snippet: "Shea butter wholesale is ready." },
      { person: PERSON.funke.name, avatar: PERSON.funke.avatar, snippet: "Perfume sealed. ₦62,000." },
    ],
  },
  {
    id: "addis",
    name: "Addis Ababa",
    country: "Ethiopia",
    lon: 38.76,
    lat: 9.03,
    snippet: "Lead created. Follow up Friday.",
    person: PERSON.emeka.name,
    avatar: PERSON.emeka.avatar,
    delay: 3.2,
    threads: [
      { person: PERSON.emeka.name, avatar: PERSON.emeka.avatar, snippet: "Lead created. Follow up Friday." },
      { person: PERSON.ibrahim.name, avatar: PERSON.ibrahim.avatar, snippet: "Generator unit is in stock." },
      { person: PERSON.ngozi.name, avatar: PERSON.ngozi.avatar, snippet: "Kidswear age 4 — ₦9,800." },
    ],
  },
];

export const MAP_ARCS: [string, string][] = [
  ["dakar", "accra"],
  ["accra", "lagos"],
  ["lagos", "ibadan"],
  ["lagos", "ph"],
  ["ibadan", "abuja"],
  ["abuja", "kano"],
  ["lagos", "nairobi"],
  ["nairobi", "addis"],
  ["kano", "addis"],
  ["abuja", "nairobi"],
];

export function cityById(id: string): MapCity | undefined {
  return MAP_CITIES.find((c) => c.id === id);
}

export function arcPath(from: MapCity, to: MapCity, w = 200, h = 240): string {
  const a = lonLatToSvg(from.lon, from.lat, w, h);
  const b = lonLatToSvg(to.lon, to.lat, w, h);
  const lift = Math.hypot(b.x - a.x, b.y - a.y) * 0.22;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - lift;
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export type MapFlight = {
  id: string;
  from: string;
  to: string;
  name: string;
  avatar: string;
  text: string;
  side: "customer" | "abos";
  delay: number;
  duration: number;
};

export const MAP_FLIGHTS: MapFlight[] = [
  {
    id: "amaka-ask",
    from: "nairobi",
    to: "lagos",
    name: PERSON.amaka.name,
    avatar: PERSON.amaka.avatar,
    text: "Wedding set for Saturday — possible?",
    side: "customer",
    delay: 0.2,
    duration: 9.2,
  },
  {
    id: "amaka-reply",
    from: "lagos",
    to: "nairobi",
    name: "ABOS",
    avatar: "/abos-mark.svg",
    text: "Coral set is booked for Saturday.",
    side: "abos",
    delay: 4.6,
    duration: 9.0,
  },
  {
    id: "tunde-ask",
    from: "lagos",
    to: "accra",
    name: PERSON.tunde.name,
    avatar: PERSON.tunde.avatar,
    text: "Black sneakers in 43?",
    side: "customer",
    delay: 1.4,
    duration: 7.4,
  },
  {
    id: "funke-ask",
    from: "accra",
    to: "lagos",
    name: PERSON.funke.name,
    avatar: PERSON.funke.avatar,
    text: "Is Sauvage genuine stock?",
    side: "customer",
    delay: 5.8,
    duration: 7.6,
  },
  {
    id: "ibrahim-ask",
    from: "kano",
    to: "addis",
    name: PERSON.ibrahim.name,
    avatar: PERSON.ibrahim.avatar,
    text: "Install the 3.5kVA this week?",
    side: "customer",
    delay: 2.2,
    duration: 8.4,
  },
  {
    id: "chidi-ask",
    from: "dakar",
    to: "accra",
    name: PERSON.chidi.name,
    avatar: PERSON.chidi.avatar,
    text: "Clear case still ₦4,500?",
    side: "customer",
    delay: 3.4,
    duration: 8.0,
  },
  {
    id: "emeka-reply",
    from: "nairobi",
    to: "addis",
    name: "ABOS",
    avatar: "/abos-mark.svg",
    text: "Navy 15-inch bag held.",
    side: "abos",
    delay: 0.8,
    duration: 7.8,
  },
];


