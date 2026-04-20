import type { ImageFile, YesNo } from "./common";
import type { Gym } from "./gym";

export type ClimbType = "LEAD" | "BOULDER" | "SPEED" | "ICE";
export type Environment = "INDOOR" | "OUTDOOR" | "NATURE";

export interface Route {
  id: number;
  gym_id: number;
  climb_type: ClimbType | "";
  environment: Environment | "";
  difficulty: string;
  memo?: string;
  route_name?: string;
  route_color?: string;
  rock_type?: string;
  height?: number;
  is_active: YesNo;
  images?: ImageFile[];
  gym?: Pick<Gym, "id" | "name" | "address" | "address_detail">;
}

export interface RouteForm {
  gym_id: number;
  climb_type: ClimbType | "";
  environment: Environment | "";
  difficulty: string;
  memo: string;
  route_name: string;
  route_color: string;
  rock_type: string;
  height: number;
  is_active: YesNo;
}
