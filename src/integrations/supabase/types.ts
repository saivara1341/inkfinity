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
      cart_items: {
        Row: {
          created_at: string
          design_file_url: string | null
          id: string
          product_id: string
          quantity: number
          shop_id: string
          specifications: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          design_file_url?: string | null
          id?: string
          product_id: string
          quantity?: number
          shop_id: string
          specifications?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          design_file_url?: string | null
          id?: string
          product_id?: string
          quantity?: number
          shop_id?: string
          specifications?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_shop_id_fkey"
            columns: ["shop_id"]
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      design_generations: {
        Row: {
          business_details: Json | null
          created_at: string
          generated_images: string[] | null
          id: string
          product_category: string
          prompt: string
          selected_image_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          business_details?: Json | null
          created_at?: string
          generated_images?: string[] | null
          id?: string
          product_category: string
          prompt: string
          selected_image_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          business_details?: Json | null
          created_at?: string
          generated_images?: string[] | null
          id?: string
          product_category?: string
          prompt?: string
          selected_image_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_address: string | null
          delivery_charge: number
          design_file_url: string | null
          estimated_delivery: string | null
          grand_total: number
          gst_amount: number
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          product_category: string
          product_name: string
          quantity: number
          shop_id: string | null
          specifications: Json
          status: Database["public"]["Enums"]["order_status"]
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_charge?: number
          design_file_url?: string | null
          estimated_delivery?: string | null
          grand_total: number
          gst_amount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_category: string
          product_name: string
          quantity: number
          shop_id?: string | null
          specifications?: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_charge?: number
          design_file_url?: string | null
          estimated_delivery?: string | null
          grand_total?: number
          gst_amount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_category?: string
          product_name?: string
          quantity?: number
          shop_id?: string | null
          specifications?: Json
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          max_quantity: number | null
          min_quantity: number
          name: string
          popular: boolean | null
          shop_id: string
          specifications: Json | null
          turnaround_days: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number
          name: string
          popular?: boolean | null
          shop_id: string
          specifications?: Json | null
          turnaround_days?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number
          name?: string
          popular?: boolean | null
          shop_id?: string
          specifications?: Json | null
          turnaround_days?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_name: string | null
          city: string | null
          created_at: string
          customer_type: string | null
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          customer_type?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_charge: number | null
          grand_total: number
          gst_amount: number
          gst_rate: number
          id: string
          items: Json
          notes: string | null
          quotation_number: string
          shop_id: string | null
          status: string
          subtotal: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_charge?: number | null
          grand_total: number
          gst_amount: number
          gst_rate?: number
          id?: string
          items?: Json
          notes?: string | null
          quotation_number: string
          shop_id?: string | null
          status?: string
          subtotal: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_charge?: number | null
          grand_total?: number
          gst_amount?: number
          gst_rate?: number
          id?: string
          items?: Json
          notes?: string | null
          quotation_number?: string
          shop_id?: string | null
          status?: string
          subtotal?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_shop_id_fkey"
            columns: ["shop_id"]
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          product_id: string | null
          rating: number
          shop_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating: number
          shop_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          rating?: number
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      shops: {
        Row: {
          address: string | null
          city: string
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          pincode: string
          rating: number | null
          services: string[] | null
          price_multiplier: number | null
          service_capabilities: Json | null
          state: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          pincode: string
          rating?: number | null
          services?: string[] | null
          price_multiplier?: number | null
          service_capabilities?: Json | null
          state: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          pincode?: string
          rating?: number | null
          services?: string[] | null
          price_multiplier?: number | null
          service_capabilities?: Json | null
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address: string
          city: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          context: Json
          conversation_state: string
          created_at: string
          id: string
          phone_number: string
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context?: Json
          conversation_state?: string
          created_at?: string
          id?: string
          phone_number: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context?: Json
          conversation_state?: string
          created_at?: string
          id?: string
          phone_number?: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "shop_owner" | "customer"
      order_status:
        | "pending"
        | "confirmed"
        | "designing"
        | "printing"
        | "quality_check"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
