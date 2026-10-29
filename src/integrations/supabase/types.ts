export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          actions: Json
          best_action: string
          category: string
          condition_label: string
          condition_score: number
          confidence: number | null
          created_at: string
          id: string
          image_path: string | null
          item_name: string
          material: string
          needs_more_info: boolean
          summary: string
          user_id: string
        }
        Insert: {
          actions: Json
          best_action: string
          category: string
          condition_label: string
          condition_score: number
          confidence?: number | null
          created_at?: string
          id?: string
          image_path?: string | null
          item_name: string
          material: string
          needs_more_info?: boolean
          summary: string
          user_id: string
        }
        Update: {
          actions?: Json
          best_action?: string
          category?: string
          condition_label?: string
          condition_score?: number
          confidence?: number | null
          created_at?: string
          id?: string
          image_path?: string | null
          item_name?: string
          material?: string
          needs_more_info?: boolean
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      centres: {
        Row: {
          accepted_categories: string[]
          address: string
          city: string | null
          created_at: string
          created_by: string | null
          description: string | null
          hours: string | null
          id: string
          name: string
          phone: string | null
          pin_code: string | null
          type: Database["public"]["Enums"]["centre_type"]
          verified: boolean
          website: string | null
        }
        Insert: {
          accepted_categories?: string[]
          address: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hours?: string | null
          id?: string
          name: string
          phone?: string | null
          pin_code?: string | null
          type: Database["public"]["Enums"]["centre_type"]
          verified?: boolean
          website?: string | null
        }
        Update: {
          accepted_categories?: string[]
          address?: string
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hours?: string | null
          id?: string
          name?: string
          phone?: string | null
          pin_code?: string | null
          type?: Database["public"]["Enums"]["centre_type"]
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centres_created_by_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          resolved: boolean
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          resolved?: boolean
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          resolved?: boolean
          subject?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string
          listing_id: string
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_fk"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favourites_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          path: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          path: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          path?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          analysis_id: string | null
          category: string
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string
          description: string
          id: string
          location_text: string | null
          owner_id: string
          pin_code: string | null
          price: number | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string
          view_count: number
        }
        Insert: {
          analysis_id?: string | null
          category: string
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          description?: string
          id?: string
          location_text?: string | null
          owner_id: string
          pin_code?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          view_count?: number
        }
        Update: {
          analysis_id?: string | null
          category?: string
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          description?: string
          id?: string
          location_text?: string | null
          owner_id?: string
          pin_code?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_fk"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          notify_listings: boolean
          notify_messages: boolean
          notify_reservations: boolean
          pin_code: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          notify_listings?: boolean
          notify_messages?: boolean
          notify_reservations?: boolean
          pin_code?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          notify_listings?: boolean
          notify_messages?: boolean
          notify_reservations?: boolean
          pin_code?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_fk"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fk"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          message: string | null
          pickup_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          pickup_at?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          pickup_at?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_requester_fk"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      centre_type: "ngo" | "donation_centre" | "recycling_centre" | "kabadiwala"
      item_condition:
        | "like_new"
        | "light_damage"
        | "moderate_damage"
        | "heavy_damage"
        | "broken"
      listing_status:
        | "draft"
        | "active"
        | "paused"
        | "sold"
        | "donated"
        | "removed"
      listing_type: "sell" | "donate"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      report_target: "listing" | "message" | "user"
      reservation_status:
        | "pending"
        | "accepted"
        | "declined"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      centre_type: ["ngo", "donation_centre", "recycling_centre", "kabadiwala"],
      item_condition: [
        "like_new",
        "light_damage",
        "moderate_damage",
        "heavy_damage",
        "broken",
      ],
      listing_status: [
        "draft",
        "active",
        "paused",
        "sold",
        "donated",
        "removed",
      ],
      listing_type: ["sell", "donate"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      report_target: ["listing", "message", "user"],
      reservation_status: [
        "pending",
        "accepted",
        "declined",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
