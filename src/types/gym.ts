import type { ImageFile, YesNo } from "./common";

export interface GymType {
  id: number;
  name: string;
  icon?: string;
  is_active: YesNo;
  sort?: number;
}

export interface Amenity {
  id: number;
  text: string;
  value?: string;
  icon?: string;
  is_active: YesNo;
  sort?: number;
}

export interface BoulderColor {
  id: number;
  name: string;
  code: string;
  is_active: YesNo;
  sort?: number;
}

export interface Difficulty {
  id: number;
  name: string;
  code: string;
  is_active: YesNo;
  sort?: number;
}

export interface OperatingHour {
  type: "weekday" | "weekend" | "holiday";
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface HoursEntry {
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface HoursMap {
  weekday: HoursEntry;
  weekend: HoursEntry;
  holiday: HoursEntry;
}

export interface Gym {
  id: number;
  name: string;
  address: string;
  address_detail?: string;
  post?: string;
  sido?: string;
  lat?: number;
  lon?: number;
  is_active: YesNo;
  operating_hours?: OperatingHour[];
  gymTypeMap?: { type_id: number }[];
  gymAmenityMaps?: { amenity_id: number }[];
  gymBoulderColors?: { boulder_color_id: number }[];
  gymDifficulties?: { difficulty_id: number }[];
}

export interface GymForm {
  id?: number;
  name: string;
  address: string;
  address_detail: string;
  types: number[];
  amenities: number[];
  gymBoulderColors: number[];
  gymDifficulties: number[];
  hours: HoursMap;
  is_active: YesNo;
  lat: number;
  lon: number;
  post: string;
  sido: string;
}

export interface GymDetail {
  id: number;
  gym_id: number;
  name: string;
  description: string;
  day_pass_price: number;
  images?: ImageFile[];
}

export interface GymDetailForm {
  gym_id: number;
  name: string;
  description: string;
  day_pass_price: number;
}

export interface SidoGroupItem {
  sido: string;
  count: number;
}
