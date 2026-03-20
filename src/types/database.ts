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
          display_name: string | null
          avatar_url: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discord_id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discord_id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
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
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          cover_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          cover_url?: string | null
          created_at?: string
        }
      }
      parties: {
        Row: {
          id: string
          host_id: string | null
          game_id: string | null
          title: string
          description: string | null
          join_mode: 'open' | 'approval' | 'invite'
          max_members: number
          status: 'waiting' | 'playing' | 'closed'
          discord_voice_link: string | null
          tags: string[]
          scheduled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id?: string | null
          game_id?: string | null
          title: string
          description?: string | null
          join_mode?: 'open' | 'approval' | 'invite'
          max_members?: number
          status?: 'waiting' | 'playing' | 'closed'
          discord_voice_link?: string | null
          tags?: string[]
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string | null
          game_id?: string | null
          title?: string
          description?: string | null
          join_mode?: 'open' | 'approval' | 'invite'
          max_members?: number
          status?: 'waiting' | 'playing' | 'closed'
          discord_voice_link?: string | null
          tags?: string[]
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      party_members: {
        Row: {
          id: string
          party_id: string | null
          user_id: string | null
          role: 'host' | 'member'
          status: 'active' | 'left' | 'kicked'
          joined_at: string
        }
        Insert: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          role?: 'host' | 'member'
          status?: 'active' | 'left' | 'kicked'
          joined_at?: string
        }
        Update: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          role?: 'host' | 'member'
          status?: 'active' | 'left' | 'kicked'
          joined_at?: string
        }
      }
      join_requests: {
        Row: {
          id: string
          party_id: string | null
          user_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          party_id: string | null
          user_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          party_id?: string | null
          user_id?: string | null
          content?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string | null
          reviewee_id: string | null
          party_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          party_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string | null
          reviewee_id?: string | null
          party_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: 'join_request' | 'waitlist_open' | 'rated' | 'approved' | 'party_full' | 'badge_earned'
          payload: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'join_request' | 'waitlist_open' | 'rated' | 'approved' | 'party_full' | 'badge_earned'
          payload?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'join_request' | 'waitlist_open' | 'rated' | 'approved' | 'party_full' | 'badge_earned'
          payload?: Json
          is_read?: boolean
          created_at?: string
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
