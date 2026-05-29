export type PlatformVerticalKey = "NEUTRAL" | "EDUCATION" | "ADULT";

export const VERTICAL_LABELS: Record<PlatformVerticalKey, string> = {
  NEUTRAL: "Modo neutro (sin vertical definida)",
  EDUCATION: "Educación / cursos",
  ADULT: "Contenido adulto (+18)",
};
