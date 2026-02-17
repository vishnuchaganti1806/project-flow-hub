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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          created_at: string
          created_by: string
          date: string
          id: string
          project_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          id?: string
          project_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          project_id?: string | null
          title?: string
        }
        Relationships: []
      }
      doubts: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          message: string
          project_id: string | null
          replies: Json | null
          status: string
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          message: string
          project_id?: string | null
          replies?: Json | null
          status?: string
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          message?: string
          project_id?: string | null
          replies?: Json | null
          status?: string
          student_id?: string
          subject?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          assigned_teams: string[] | null
          created_at: string
          department: string | null
          id: string
          specialization: string | null
          user_id: string
        }
        Insert: {
          assigned_teams?: string[] | null
          created_at?: string
          department?: string | null
          id?: string
          specialization?: string | null
          user_id: string
        }
        Update: {
          assigned_teams?: string[] | null
          created_at?: string
          department?: string | null
          id?: string
          specialization?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          abstract: string | null
          attachments: string[] | null
          expected_outcome: string | null
          feedback: string | null
          guide_id: string | null
          id: string
          problem_statement: string | null
          status: string
          student_id: string
          submitted_at: string | null
          team_id: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          abstract?: string | null
          attachments?: string[] | null
          expected_outcome?: string | null
          feedback?: string | null
          guide_id?: string | null
          id?: string
          problem_statement?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
          team_id?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          abstract?: string | null
          attachments?: string[] | null
          expected_outcome?: string | null
          feedback?: string | null
          guide_id?: string | null
          id?: string
          problem_statement?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          team_id?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          login_id: string | null
          must_change_password: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          login_id?: string | null
          must_change_password?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          login_id?: string | null
          must_change_password?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          guide_id: string
          id: string
          rating: number
          student_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          guide_id: string
          id?: string
          rating: number
          student_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          guide_id?: string
          id?: string
          rating?: number
          student_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          branch: string | null
          created_at: string
          guide_id: string | null
          id: string
          languages: string[] | null
          progress: number | null
          rating: number | null
          roll_number: string | null
          skills: string[] | null
          team_id: string | null
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string
          guide_id?: string | null
          id?: string
          languages?: string[] | null
          progress?: number | null
          rating?: number | null
          roll_number?: string | null
          skills?: string[] | null
          team_id?: string | null
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string
          guide_id?: string | null
          id?: string
          languages?: string[] | null
          progress?: number | null
          rating?: number | null
          roll_number?: string | null
          skills?: string[] | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          guide_id: string | null
          id: string
          members: string[] | null
          name: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          guide_id?: string | null
          id?: string
          members?: string[] | null
          name: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          guide_id?: string | null
          id?: string
          members?: string[] | null
          name?: string
          project_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "student" | "guide" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["student", "guide", "admin"],
    },
  },
} as const
