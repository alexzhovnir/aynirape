export const defaultLang = "en";

export const uiLanguages = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
} as const;

export type SupportedLang = keyof typeof uiLanguages;

export function getLangFromRegion(countryCode: string | undefined): SupportedLang {
  if (!countryCode) return defaultLang;

  const code = countryCode.toLowerCase();
  if (["de", "at", "ch"].includes(code)) return "de";
  if (["fr", "be", "mc"].includes(code)) return "fr";
  if (["es"].includes(code)) return "es";
  if (["it", "sm", "va"].includes(code)) return "it";

  return defaultLang;
}
