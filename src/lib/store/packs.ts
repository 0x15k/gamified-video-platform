export type TokenPack = {
  id: string;
  name: string;
  tokens: number;
  priceLabel: string;
  description: string;
  popular?: boolean;
};

export const TOKEN_PACKS: TokenPack[] = [
  {
    id: "starter",
    name: "Starter",
    tokens: 50,
    priceLabel: "$4.99",
    description: "Para probar rutas premium puntuales.",
  },
  {
    id: "explorer",
    name: "Explorer",
    tokens: 150,
    priceLabel: "$12.99",
    description: "Equilibrio ideal para varias decisiones.",
    popular: true,
  },
  {
    id: "whale",
    name: "Whale Pack",
    tokens: 500,
    priceLabel: "$39.99",
    description: "Acceso extendido a ramas exclusivas.",
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "premium",
    plan: "PREMIUM" as const,
    name: "Premium",
    priceLabel: "$14.99/mes",
    perks: ["Sin costo por nodo premium", "Avatar completo", "Soporte prioritario"],
  },
  {
    id: "whale",
    plan: "WHALE" as const,
    name: "Whale",
    priceLabel: "$49.99/mes",
    perks: ["Todo Premium", "Badge exclusivo", "Early access a capítulos"],
  },
];
