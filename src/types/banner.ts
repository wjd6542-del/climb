import type { ImageFile, YesNo } from "./common";

export interface Banner {
  id: number;
  name: string;
  address?: string;
  address_detail?: string;
  url?: string;
  sort?: number;
  is_active: YesNo;
  images?: ImageFile[];
}
