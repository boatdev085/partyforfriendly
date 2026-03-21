export interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
}

export interface Party {
  id: string;
  title: string;
  game: string;
  host_id: string;
  max_members: number;
  current_members: number;
  status: "open" | "full" | "closed";
  description?: string;
  required_rank?: string;
  language: "th" | "en" | "both";
  created_at: string;
  host?: User;
  join_mode: "auto" | "approve";
  discord_voice_link?: string;
  tags?: string[];
  pending_count?: number;
  host_name?: string;
  game_name?: string;
  host_rating?: number;
}

export interface Membership {
  id: string;
  party_id: string;
  user_id: string;
  role: "host" | "member";
  status: "approved" | "pending" | "rejected";
  joined_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Rating {
  id: string;
  rater_id: string;
  rated_id: string;
  party_id: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}
