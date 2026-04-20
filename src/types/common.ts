export type YesNo = "y" | "n";

export interface ImageFile {
  id: number;
  file_url?: string;
  type?: string;
  sort?: number;
}

export interface PageParams {
  page: number;
  limit: number;
}

export interface BookmarkItem {
  key: string;
  id: number;
  route_id: number | null;
  name: string;
  address?: string;
  address_detail?: string;
}
