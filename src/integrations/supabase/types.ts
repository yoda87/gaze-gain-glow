export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_views: {
        Row: {
          ad_id: string
          completed: boolean | null
          id: string
          points_earned: number | null
          user_id: string
          viewed_at: string
        }
        Insert: {
          ad_id: string
          completed?: boolean | null
          id?: string
          points_earned?: number | null
          user_id: string
          viewed_at?: string
        }
        Update: {
          ad_id?: string
          completed?: boolean | null
          id?: string
          points_earned?: number | null
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          points_reward: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean | null
          points_reward: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          points_reward?: number
          title?: string
        }
        Relationships: []
      }
      cpa_completions: {
        Row: {
          completed_at: string
          id: string
          offer_id: string
          points_earned: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          offer_id: string
          points_earned: number
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          offer_id?: string
          points_earned?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cpa_completions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "cpa_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      cpa_offers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          points_reward: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          points_reward?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number | null
          created_at: string
          device_id: string | null
          email_verified: boolean | null
          first_ad_watched: boolean | null
          id: string
          level: number
          name: string | null
          referral_code: string | null
          referral_count: number | null
          signup_bonus_awarded: boolean | null
          total_points_earned: number
          updated_at: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          device_id?: string | null
          email_verified?: boolean | null
          first_ad_watched?: boolean | null
          id: string
          level?: number
          name?: string | null
          referral_code?: string | null
          referral_count?: number | null
          signup_bonus_awarded?: boolean | null
          total_points_earned?: number
          updated_at?: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          device_id?: string | null
          email_verified?: boolean | null
          first_ad_watched?: boolean | null
          id?: string
          level?: number
          name?: string | null
          referral_code?: string | null
          referral_count?: number | null
          signup_bonus_awarded?: boolean | null
          total_points_earned?: number
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          points_awarded: boolean | null
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          points_awarded?: boolean | null
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          points_awarded?: boolean | null
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount_euros: number
          amount_points: number
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_euros: number
          amount_points: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_euros?: number
          amount_points?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_5_digit_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
