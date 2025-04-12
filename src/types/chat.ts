import { CoreMessage } from "ai";

export type Message = CoreMessage & {
  thinkingTime?: number;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: Model[];
} 