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
      accounts: {
        Row: {
          balance: number
          color: string | null
          created_at: string
          household_id: string
          id: string
          inst: string | null
          mask: string | null
          name: string
          sync_label: string | null
          synced: boolean
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          balance?: number
          color?: string | null
          created_at?: string
          household_id: string
          id?: string
          inst?: string | null
          mask?: string | null
          name: string
          sync_label?: string | null
          synced?: boolean
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          balance?: number
          color?: string | null
          created_at?: string
          household_id?: string
          id?: string
          inst?: string | null
          mask?: string | null
          name?: string
          sync_label?: string | null
          synced?: boolean
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      activity: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          detail: string | null
          household_id: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          detail?: string | null
          household_id: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          detail?: string | null
          household_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          cadence: Database["public"]["Enums"]["bill_cadence"]
          created_at: string
          day_of_month: number | null
          expected_amount: number | null
          household_id: string
          id: string
          kind: string | null
          last_seen_at: string | null
          merchant_id: string | null
          month: number | null
          name: string
          next_due_date: string | null
          source: Database["public"]["Enums"]["bill_source"]
          status: Database["public"]["Enums"]["bill_status"]
          updated_at: string
        }
        Insert: {
          cadence?: Database["public"]["Enums"]["bill_cadence"]
          created_at?: string
          day_of_month?: number | null
          expected_amount?: number | null
          household_id: string
          id?: string
          kind?: string | null
          last_seen_at?: string | null
          merchant_id?: string | null
          month?: number | null
          name: string
          next_due_date?: string | null
          source?: Database["public"]["Enums"]["bill_source"]
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Update: {
          cadence?: Database["public"]["Enums"]["bill_cadence"]
          created_at?: string
          day_of_month?: number | null
          expected_amount?: number | null
          household_id?: string
          id?: string
          kind?: string | null
          last_seen_at?: string | null
          merchant_id?: string | null
          month?: number | null
          name?: string
          next_due_date?: string | null
          source?: Database["public"]["Enums"]["bill_source"]
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          household_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          household_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          household_id: string
          id: string
          role: Database["public"]["Enums"]["chat_role"]
          text: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          role: Database["public"]["Enums"]["chat_role"]
          text: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          role?: Database["public"]["Enums"]["chat_role"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          apr: number | null
          color: string | null
          created_at: string
          household_id: string
          id: string
          name: string
          original: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          apr?: number | null
          color?: string | null
          created_at?: string
          household_id: string
          id?: string
          name: string
          original?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          apr?: number | null
          color?: string | null
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          original?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          color: string | null
          created_at: string
          emoji: string | null
          household_id: string
          id: string
          kind: Database["public"]["Enums"]["fund_kind"]
          name: string
          target: number | null
          target_date: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          emoji?: string | null
          household_id: string
          id?: string
          kind?: Database["public"]["Enums"]["fund_kind"]
          name: string
          target?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          emoji?: string | null
          household_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["fund_kind"]
          name?: string
          target?: number | null
          target_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funds_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          color: string | null
          created_at: string
          email: string | null
          household_id: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          email?: string | null
          household_id: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          email?: string | null
          household_id?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          onboarded: boolean
          selected_fund_catalog: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          onboarded?: boolean
          selected_fund_catalog?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          onboarded?: boolean
          selected_fund_catalog?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          household_id: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          household_id: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          household_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_aliases: {
        Row: {
          created_at: string
          household_id: string
          id: string
          match_type: Database["public"]["Enums"]["alias_match_type"]
          merchant_id: string
          pattern: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          match_type?: Database["public"]["Enums"]["alias_match_type"]
          merchant_id: string
          pattern: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          match_type?: Database["public"]["Enums"]["alias_match_type"]
          merchant_id?: string
          pattern?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_aliases_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_aliases_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          color: string | null
          created_at: string
          default_category_id: string | null
          emoji: string | null
          household_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_category_id?: string | null
          emoji?: string | null
          household_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          default_category_id?: string | null
          emoji?: string | null
          household_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_default_category_id_fkey"
            columns: ["default_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchants_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          household_id: string
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          household_id: string
          id?: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          household_id?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          theme: Database["public"]["Enums"]["theme_mode"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          theme?: Database["public"]["Enums"]["theme_mode"]
          updated_at?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          created_at: string
          description: string | null
          household_id: string
          id: string
          kind: Database["public"]["Enums"]["strategy_kind"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          household_id: string
          id?: string
          kind: Database["public"]["Enums"]["strategy_kind"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          household_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["strategy_kind"]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_notes: {
        Row: {
          by: Database["public"]["Enums"]["strat_note_by"]
          created_at: string
          household_id: string
          id: string
          strategy_id: string
          text: string
        }
        Insert: {
          by: Database["public"]["Enums"]["strat_note_by"]
          created_at?: string
          household_id: string
          id?: string
          strategy_id: string
          text: string
        }
        Update: {
          by?: Database["public"]["Enums"]["strat_note_by"]
          created_at?: string
          household_id?: string
          id?: string
          strategy_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_notes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_notes_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          bill_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          date: string
          debt_id: string | null
          description: string | null
          fund_id: string | null
          household_id: string
          id: string
          kind: Database["public"]["Enums"]["txn_kind"]
          merchant_id: string | null
          pending: boolean
          plaid_transaction_id: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          bill_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          debt_id?: string | null
          description?: string | null
          fund_id?: string | null
          household_id: string
          id?: string
          kind: Database["public"]["Enums"]["txn_kind"]
          merchant_id?: string | null
          pending?: boolean
          plaid_transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          bill_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          debt_id?: string | null
          description?: string | null
          fund_id?: string | null
          household_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["txn_kind"]
          merchant_id?: string | null
          pending?: boolean
          plaid_transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debt_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "fund_totals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_snapshots: {
        Row: {
          captured_at: string
          created_at: string
          household_id: string
          id: string
          metric: Database["public"]["Enums"]["trend_metric"]
          value: number
        }
        Insert: {
          captured_at: string
          created_at?: string
          household_id: string
          id?: string
          metric: Database["public"]["Enums"]["trend_metric"]
          value: number
        }
        Update: {
          captured_at?: string
          created_at?: string
          household_id?: string
          id?: string
          metric?: Database["public"]["Enums"]["trend_metric"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "trend_snapshots_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      debt_balances: {
        Row: {
          apr: number | null
          balance: number | null
          color: string | null
          created_at: string | null
          household_id: string | null
          id: string | null
          name: string | null
          original: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_totals: {
        Row: {
          color: string | null
          created_at: string | null
          emoji: string | null
          household_id: string | null
          id: string | null
          kind: Database["public"]["Enums"]["fund_kind"] | null
          name: string | null
          saved: number | null
          target: number | null
          target_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funds_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      can_write: { Args: { hid: string }; Returns: boolean }
      create_household: { Args: { p_name?: string }; Returns: string }
      dearmor: { Args: { "": string }; Returns: string }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      is_household_member: { Args: { hid: string }; Returns: boolean }
      is_owner: { Args: { hid: string }; Returns: boolean }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      account_type: "Checking" | "Savings" | "Credit" | "Loan" | "Investment"
      alias_match_type: "exact" | "prefix" | "contains" | "regex"
      bill_cadence: "weekly" | "monthly" | "quarterly" | "annual"
      bill_source: "detected" | "manual"
      bill_status: "suggested" | "active" | "dismissed" | "ended"
      chat_role: "ai" | "user"
      fund_kind: "Target" | "Recurring" | "Open"
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      member_role: "Owner" | "Editor" | "Viewer"
      notification_type:
        | "bill_due"
        | "sync_error"
        | "invitation"
        | "advisor"
        | "system"
      strat_note_by: "advisor" | "you"
      strategy_kind: "debt" | "spend" | "funds"
      theme_mode: "light" | "dark" | "system"
      trend_metric: "net_worth" | "total_debt" | "total_saved" | "assets"
      txn_kind: "spend" | "income" | "debt_payment" | "fund_contribution"
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
      account_type: ["Checking", "Savings", "Credit", "Loan", "Investment"],
      alias_match_type: ["exact", "prefix", "contains", "regex"],
      bill_cadence: ["weekly", "monthly", "quarterly", "annual"],
      bill_source: ["detected", "manual"],
      bill_status: ["suggested", "active", "dismissed", "ended"],
      chat_role: ["ai", "user"],
      fund_kind: ["Target", "Recurring", "Open"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      member_role: ["Owner", "Editor", "Viewer"],
      notification_type: [
        "bill_due",
        "sync_error",
        "invitation",
        "advisor",
        "system",
      ],
      strat_note_by: ["advisor", "you"],
      strategy_kind: ["debt", "spend", "funds"],
      theme_mode: ["light", "dark", "system"],
      trend_metric: ["net_worth", "total_debt", "total_saved", "assets"],
      txn_kind: ["spend", "income", "debt_payment", "fund_contribution"],
    },
  },
} as const
