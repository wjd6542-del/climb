import type { YesNo } from "./common";

export type LangCode = "ko" | "en" | "ja" | "zh";

export type LocalizedName = Record<LangCode, string>;

export interface LangPackRow {
  id: number;
  name: LocalizedName;
  is_active: YesNo;
}
