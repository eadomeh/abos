export type PersonId =
  | "tunde"
  | "ada"
  | "chidi"
  | "kemi"
  | "zainab"
  | "emeka"
  | "ngozi"
  | "ibrahim"
  | "funke"
  | "amaka";

export type Person = {
  id: PersonId;
  name: string;
  city: string;
  country: string;
  product: string;
  avatar: string;
  preview: string;
};

export const PEOPLE: Person[] = [
  {
    id: "tunde",
    name: "Tunde",
    city: "Lagos",
    country: "Nigeria",
    product: "Black sneakers",
    avatar: "/avatars/tunde.jpg",
    preview: "Black sneakers · size 43",
  },
  {
    id: "ada",
    name: "Ada",
    city: "Abuja",
    country: "Nigeria",
    product: "Ankara wrap",
    avatar: "/avatars/ada.jpg",
    preview: "Indigo wrap · size 12",
  },
  {
    id: "chidi",
    name: "Chidi",
    city: "Dakar",
    country: "Senegal",
    product: "Phone case",
    avatar: "/avatars/chidi.jpg",
    preview: "Clear case · ₦4,500",
  },
  {
    id: "kemi",
    name: "Kemi",
    city: "Ibadan",
    country: "Nigeria",
    product: "Hair bundles",
    avatar: "/avatars/kemi.jpg",
    preview: "Ikeja delivery today",
  },
  {
    id: "zainab",
    name: "Zainab",
    city: "Port Harcourt",
    country: "Nigeria",
    product: "Shea butter",
    avatar: "/avatars/zainab.jpg",
    preview: "Wholesale pack · 12 jars",
  },
  {
    id: "emeka",
    name: "Emeka",
    city: "Addis Ababa",
    country: "Ethiopia",
    product: "Laptop bag",
    avatar: "/avatars/emeka.jpg",
    preview: "15-inch bag · navy",
  },
  {
    id: "ngozi",
    name: "Ngozi",
    city: "Kano",
    country: "Nigeria",
    product: "Kidswear",
    avatar: "/avatars/ngozi.jpg",
    preview: "Striped set · age 4",
  },
  {
    id: "ibrahim",
    name: "Ibrahim",
    city: "Kano",
    country: "Nigeria",
    product: "Generator",
    avatar: "/avatars/ibrahim.jpg",
    preview: "3.5kVA install Thursday",
  },
  {
    id: "funke",
    name: "Funke",
    city: "Accra",
    country: "Ghana",
    product: "Perfume",
    avatar: "/avatars/funke.jpg",
    preview: "Sauvage 100ml · sealed",
  },
  {
    id: "amaka",
    name: "Amaka",
    city: "Nairobi",
    country: "Kenya",
    product: "Wedding beads",
    avatar: "/avatars/amaka.jpg",
    preview: "Saturday set if ordered by 2pm",
  },
];

export const PERSON = Object.fromEntries(PEOPLE.map((p) => [p.id, p])) as Record<PersonId, Person>;

export function personById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}
