import { getLangFromRegion, type SupportedLang, defaultLang } from "./config";
import { dictionaries } from "./dictionaries";

export function useTranslations(countryCode: string | undefined) {
  const lang = getLangFromRegion(countryCode);

  return function t(key: string, variables?: Record<string, string | number>) {
    const keys = key.split(".");
    let value: any = dictionaries[lang] || dictionaries[defaultLang];

    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }

    if (value === undefined) {
      // Fallback to default language
      value = dictionaries[defaultLang];
      for (const k of keys) {
        if (value === undefined) break;
        value = value[k];
      }
    }

    if (typeof value === "string") {
      if (variables) {
        return Object.entries(variables).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, "g"), String(v)),
          value
        );
      }
      return value;
    }

    // Return the key itself if not found or not a string
    return key;
  };
}
