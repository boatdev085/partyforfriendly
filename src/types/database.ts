export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          discord_id: string
          username: string
          discriminator: string | null
          display_name: string | null
          avatar_url: string | null
          email: string | null
          is_premium: boolean
          premium_expires_at: string | null
          stripe_customer_id: string | null
          locale: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          username: string
          discriminator?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          locale?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string
          discriminator?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          stripe_customer_id?: string | null
          locale?: string
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          name: string
          slug: string
          cover_url: string | null
          genre: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          cover_url?: string | null
          genre?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          cover_url?: string | null
          genre?: string[] | null
          created_at?: string
        }
      }
      parties: {
        Row: {
          id: string
          host_id: string
          game_id: string | null
          title: string
          description: string | null
          max_members: number
          current_members: number
          status: 'open' | 'full' | 'closed' | 'in_progress'
          join_mode: 'open' | 'request' | 'invite_only'
          required_rank: string | null
          language: 'th' | 'en' | 'both'
          discord_channel_id: string | null
          discord_voice_channel_id: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          game_id?: string | null
          title: string
          description?: string | null
          max_members?: number
          current_members?: number
          status?: 'open' | 'full' | 'closed' | 'in_progress'
          join_mode?: 'open' | 'request' | 'invite_only'
          required_rank?: string | null
          language?: 'th' | 'en' | 'both'
          discord_channel_id?: string | null
          discord_voice_channel_id?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          game_id?: string | null
          title?: string
          description?: string | null
          max_members?: number
          current_members?: number
          status?: 'open' | 'full' | 'closed' | 'in_progress'
          join_mode?: 'open' | 'request' | 'invite_only'
          required_rank?: string | null
          language?: 'th' | 'en' | 'both'
          discord_channel_id?: string | null
          discord_voice_channel_id?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          party_id: string
          user_id: string
          role: 'host' | 'member'
          status: 'approved' | 'pending' | 'rejected' | 'left' | 'kicked'
          joined_at: string
        }
        Insert: {
          id?: string
          party_id: string
          user_id: string
          role?: 'host' | 'member'
          status?: 'approved' | 'pending' | 'rejected' | 'left' | 'kicked'
          joined_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          user_id?: string
          role?: 'host' | 'member'
          status?: 'approved' | 'pending' | 'rejected' | 'left' | 'kicked'
          joined_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          party_id: string
          user_id: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          party_id: string
          user_id: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          user_id?: string
          position?: number
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          rater_id: string
          rated_id: string
          party_id: string
          score: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rater_id: string
          rated_id: string
          party_id: string
          score: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rater_id?: string
          rated_id?: string
          party_id?: string
          score?: number
          comment?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon_url: string | null
          condition_type: string
          condition_value: number
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon_url?: string | null
          condition_type: string
          condition_value: number
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          condition_type?: string
          condition_value?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
        }
      }
      game_profiles: {
        Row: {
          id: string
          user_id: string
          game_id: string
          in_game_name: string | null
          rank: string | null
          role: string | null
          play_style: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          in_game_name?: string | null
          rank?: string | null
          role?: string | null
          play_style?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          in_game_name?: string | null
          rank?: string | null
          role?: string | null
          play_style?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/** Convenience type aliases */
export type UserRow           = Database['public']['Tables']['users']['Row']
export type UserInsert        = Database['public']['Tables']['users']['Insert']
export type UserUpdate        = Database['public']['Tables']['users']['Update']
export type GameRow           = Database['public']['Tables']['games']['Row']
export type PartyRow          = Database['public']['Tables']['parties']['Row']
export type PartyInsert       = Database['public']['Tables']['parties']['Insert']
export type PartyUpdate       = Database['public']['Tables']['parties']['Update']
export type MembershipRow     = Database['public']['Tables']['memberships']['Row']
export type MembershipInsert  = Database['public']['Tables']['memberships']['Insert']
export type MembershipUpdate  = Database['public']['Tables']['memberships']['Update']
export type RatingRow         = Database['public']['Tables']['ratings']['Row']
export type NotificationRow   = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type BadgeRow          = Database['public']['Tables']['badges']['Row']
export type UserBadgeRow      = Database['public']['Tables']['user_badges']['Row']
export type GameProfileRow    = Database['public']['Tables']['game_profiles']['Row']
export type GameProfileInsert = Database['public']['Tables']['game_profiles']['Insert']
export type GameProfileUpdate = Database['public']['Tables']['game_profiles']['Update']
