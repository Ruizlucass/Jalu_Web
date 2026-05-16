export const whatsappBase = "https://wa.me/543810000000";

export const quickLinks = [
  { label: "Pedir delivery", href: "#pedidos" },
  { label: "Ver menú", href: "#menu" },
  { label: "Árabe libre", href: "#arabe-libre" },
  { label: "Reservar", href: "#reservas" },
];

export const menuCategories = ["Sfijas", "Kipes", "Shawarma", "Combos", "Dulces árabes"];

export const products = [
  {
    category: "Sfijas",
    name: "Sfija clásica",
    desc: "Masa fina, carne especiada, limón y golpe de horno fuerte.",
    price: "$1.900",
    image: "/img/Sfijas-logo.jpg",
  },
  {
    category: "Kipes",
    name: "Kipe frito",
    desc: "Trigo burgol, carne, especias y relleno jugoso.",
    price: "$2.200",
    image: "/img/Combo.jpg",
  },
  {
    category: "Shawarma",
    name: "Shawarma urbano",
    desc: "Pan caliente, carne, vegetales frescos y salsa Jalu.",
    price: "$5.800",
    image: "/img/Shawarma-logo.jpg",
  },
  {
    category: "Combos",
    name: "Combo callejero",
    desc: "Shawarma, papas crocantes y bebida fría.",
    price: "$7.900",
    image: "/img/Combo.jpg",
  },
  {
    category: "Dulces árabes",
    name: "Baklava box",
    desc: "Capas crocantes, frutos secos y almíbar.",
    price: "$4.500",
    image: "/img/Pizza-logo.jpg",
  },
];

export const branches = [
  { name: "Jalu Centro", zone: "Microcentro", address: "San Martín 640" },
  { name: "Jalu Yerba Buena", zone: "Av. Aconquija", address: "Aconquija 1180" },
  { name: "Jalu Barrio Norte", zone: "Zona norte", address: "Santa Fe 820" },
  { name: "Jalu Sur", zone: "Sur", address: "Av. Roca 2100" },
  { name: "Jalu Shopping", zone: "Food court", address: "Local 14" },
  { name: "Jalu Terminal", zone: "Take away", address: "Terminal Tucumán" },
];

export const reviews = [
  { quote: "Porciones abundantes", detail: "Comida directa, rica y sin vueltas." },
  { quote: "Explota de sabor", detail: "Salsas potentes, carne bien marcada." },
  { quote: "El mejor árabe de Tucumán", detail: "Ideal para delivery o para ir en grupo." },
];
