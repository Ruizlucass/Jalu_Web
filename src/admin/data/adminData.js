export const panelConfigs = {
  admin: {
    label: "Admin",
    title: "Panel Admin",
    subtitle: "Gestion operativa de menu, ofertas, reservas y pedidos.",
    basePath: "/admin",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/menu", label: "Menu / productos" },
      { href: "/admin/promociones", label: "Ofertas" },
      { href: "/admin/reservas", label: "Reservas" },
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/finalizados", label: "Finalizados" },
      { href: "/admin/usuarios", label: "Usuarios" },
    ],
  },
  superadmin: {
    label: "Superadmin",
    title: "Panel Superadmin",
    subtitle: "Gestion general con usuarios, roles y vistas operativas.",
    basePath: "/superadmin",
    links: [
      { href: "/superadmin", label: "Dashboard" },
      { href: "/superadmin/menu", label: "Menu / productos" },
      { href: "/superadmin/promociones", label: "Ofertas" },
      { href: "/superadmin/reservas", label: "Reservas" },
      { href: "/superadmin/pedidos", label: "Pedidos" },
      { href: "/superadmin/finalizados", label: "Finalizados" },
      { href: "/superadmin/usuarios", label: "Usuarios" },
      { href: "/superadmin/roles", label: "Roles" },
    ],
  },
};

export const summaryCards = [
  {
    id: "reservas-hoy",
    title: "Reservas hoy",
    value: "12",
    detail: "Mesas confirmadas para el servicio",
  },
  {
    id: "pedidos-pendientes",
    title: "Pedidos pendientes",
    value: "8",
    detail: "Pedidos esperando preparacion",
  },
  {
    id: "productos-activos",
    title: "Productos activos",
    value: "36",
    detail: "Items visibles del menu",
  },
  {
    id: "ofertas",
    title: "Ofertas activas",
    value: "4",
    detail: "Promociones disponibles",
  },
];

export const menuItems = [
  {
    id: "shawarma",
    name: "Shawarma urbano",
    category: "Shawarma",
    price: "$5.800",
    status: "Visible",
  },
  {
    id: "combo",
    name: "Combo callejero",
    category: "Combos",
    price: "$7.900",
    status: "Visible",
  },
  {
    id: "baklava",
    name: "Baklava box",
    category: "Dulces",
    price: "$4.500",
    status: "Borrador",
  },
];

export const promotions = [
  {
    id: "promo-1",
    name: "2 shawarmas + bebida",
    detail: "Lunes a jueves",
    status: "Activa",
  },
  {
    id: "promo-2",
    name: "Arabe libre",
    detail: "Reserva previa",
    status: "Programada",
  },
];

export const reservations = [
  {
    id: "res-001",
    name: "Juan Perez",
    time: "20:00",
    people: "4 personas",
    branch: "Sucursal Yerba Buena",
  },
  {
    id: "res-002",
    name: "Maria Gomez",
    time: "21:30",
    people: "2 personas",
    branch: "Sucursal Crisostomo",
  },
  {
    id: "res-003",
    name: "Pedro Ruiz",
    time: "22:00",
    people: "6 personas",
    branch: "Sucursal Pinar",
  },
];

export const orders = [
  {
    id: "ped-1450",
    customer: "Camila R.",
    channel: "WhatsApp",
    total: "$18.600",
    status: "Preparando",
  },
  {
    id: "ped-1451",
    customer: "Diego M.",
    channel: "Salon",
    total: "$9.700",
    status: "Pendiente",
  },
  {
    id: "ped-1452",
    customer: "Sofia L.",
    channel: "Delivery",
    total: "$12.400",
    status: "Listo",
  },
];

export const users = [
  {
    id: "usr-01",
    name: "Lucia Herrera",
    email: "lucia@jalu.com",
    role: "cliente",
    status: "Activo",
  },
  {
    id: "usr-02",
    name: "Nicolas Ruiz",
    email: "nicolas@jalu.com",
    role: "admin",
    status: "Activo",
  },
  {
    id: "usr-03",
    name: "Valentina Paz",
    email: "vale@jalu.com",
    role: "superadmin",
    status: "Activo",
  },
];

export const roleOptions = ["cliente", "admin", "superadmin"];
