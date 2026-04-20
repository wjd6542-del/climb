import type { ImageFile } from "./common";

export interface GymPost {
  id: number;
  gym_id: number | string;
  title: string;
  content: string;
  rating: number;
  images?: ImageFile[];
  created_at?: string;
}

export interface GymPostForm {
  gym_id: number | string;
  title: string;
  content: string;
  rating: number;
}
