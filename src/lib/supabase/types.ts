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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_number: string
          course_id: string
          created_at: string | null
          id: string
          issued_at: string | null
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          course_id: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          course_id?: string
          created_at?: string | null
          id?: string
          issued_at?: string | null
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          mentions: string[] | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          mentions?: string[] | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_course_settings: {
        Row: {
          access_type: string
          community_id: string
          course_id: string
          created_at: string | null
          id: string
          position: number | null
        }
        Insert: {
          access_type?: string
          community_id: string
          course_id: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Update: {
          access_type?: string
          community_id?: string
          course_id?: string
          created_at?: string | null
          id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_course_settings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "creator_communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_course_settings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          access_type: string | null
          created_at: string | null
          description: string | null
          id: string
          membership_plan_id: string | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          membership_plan_id?: string | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          membership_plan_id?: string | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: true
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "creator_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string | null
          comments_count: number | null
          community_group_id: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          membership_plan_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_id?: string | null
          comments_count?: number | null
          community_group_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          membership_plan_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string | null
          comments_count?: number | null
          community_group_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          membership_plan_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_group_id_fkey"
            columns: ["community_group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      course_access: {
        Row: {
          access_token: string
          course_id: string | null
          enrolled_at: string | null
          expires_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          course_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          course_id?: string | null
          enrolled_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_access_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_slug_redirects: {
        Row: {
          course_id: string
          created_at: string
          id: string
          old_slug: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          old_slug: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          old_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_slug_redirects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_token: string | null
          capture_bullets: Json | null
          capture_cta: string | null
          capture_headline: string | null
          capture_subheadline: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          image_url: string | null
          is_lead_magnet: boolean | null
          is_publicly_listed: boolean
          is_published: boolean | null
          lead_list_id: string | null
          payment_link: string | null
          requires_login: boolean
          sequential_unlock: boolean
          slug: string
          thankyou_headline: string | null
          thankyou_message: string | null
          thumbnail_url: string | null
          title: string
          unlock_trigger: string
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          capture_bullets?: Json | null
          capture_cta?: string | null
          capture_headline?: string | null
          capture_subheadline?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_lead_magnet?: boolean | null
          is_publicly_listed?: boolean
          is_published?: boolean | null
          lead_list_id?: string | null
          payment_link?: string | null
          requires_login?: boolean
          sequential_unlock?: boolean
          slug: string
          thankyou_headline?: string | null
          thankyou_message?: string | null
          thumbnail_url?: string | null
          title: string
          unlock_trigger?: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          capture_bullets?: Json | null
          capture_cta?: string | null
          capture_headline?: string | null
          capture_subheadline?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_lead_magnet?: boolean | null
          is_publicly_listed?: boolean
          is_published?: boolean | null
          lead_list_id?: string | null
          payment_link?: string | null
          requires_login?: boolean
          sequential_unlock?: boolean
          slug?: string
          thankyou_headline?: string | null
          thankyou_message?: string | null
          thumbnail_url?: string | null
          title?: string
          unlock_trigger?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_communities: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "creator_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          community_id: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "creator_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_community_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "creator_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          body_html: string
          created_at: string | null
          creator_id: string
          id: string
          list_id: string | null
          list_name: string | null
          recipient_count: number | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body_html: string
          created_at?: string | null
          creator_id: string
          id?: string
          list_id?: string | null
          list_name?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body_html?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          list_id?: string | null
          list_name?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      email_contacts: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          list_id: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          list_id: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          list_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_contacts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      email_lists: {
        Row: {
          created_at: string | null
          creator_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_lists_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          last_accessed_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_files_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          downloaded_files: string[] | null
          id: string
          last_position: number | null
          last_reminder_sent: string | null
          lesson_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          video_duration: number | null
          video_timestamp: number | null
          watched_percentage: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          downloaded_files?: string[] | null
          id?: string
          last_position?: number | null
          last_reminder_sent?: string | null
          lesson_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          video_duration?: number | null
          video_timestamp?: number | null
          watched_percentage?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          downloaded_files?: string[] | null
          id?: string
          last_position?: number | null
          last_reminder_sent?: string | null
          lesson_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          video_duration?: number | null
          video_timestamp?: number | null
          watched_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_videos: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          position: number
          title: string | null
          video_provider: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          position?: number
          title?: string | null
          video_provider?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          position?: number
          title?: string | null
          video_provider?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          available_from: string | null
          content: string | null
          created_at: string | null
          duration: number | null
          id: string
          module_id: string | null
          position: number
          title: string
          updated_at: string | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          available_from?: string | null
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          module_id?: string | null
          position?: number
          title: string
          updated_at?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          available_from?: string | null
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          module_id?: string | null
          position?: number
          title?: string
          updated_at?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          benefits: string | null
          community_group_id: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          includes_courses: Json | null
          includes_resources: string | null
          price_info: string | null
          short_description: string | null
          slug: string
          status: string | null
          stripe_checkout_url: string | null
          stripe_price_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          community_group_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          includes_courses?: Json | null
          includes_resources?: string | null
          price_info?: string | null
          short_description?: string | null
          slug: string
          status?: string | null
          stripe_checkout_url?: string | null
          stripe_price_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          community_group_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          includes_courses?: Json | null
          includes_resources?: string | null
          price_info?: string | null
          short_description?: string | null
          slug?: string
          status?: string | null
          stripe_checkout_url?: string | null
          stripe_price_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      membership_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          membership_plan_id: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          membership_plan_id?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          membership_plan_id?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_subscriptions_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          available_from: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string | null
        }
        Insert: {
          available_from?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          available_from?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity: string | null
          avatar_url: string | null
          beta_tester: boolean | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          lifetime_access: boolean | null
          plan_type: string | null
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity?: string | null
          avatar_url?: string | null
          beta_tester?: boolean | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          lifetime_access?: boolean | null
          plan_type?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity?: string | null
          avatar_url?: string | null
          beta_tester?: boolean | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          lifetime_access?: boolean | null
          plan_type?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sales_pages: {
        Row: {
          avatar_summary: string | null
          body_html: string | null
          brand_colors: Json | null
          course_id: string
          course_image_url: string | null
          created_at: string
          creator_avatar_url: string | null
          creator_id: string
          creator_name: string | null
          cta_label: string | null
          cta_type: string
          cta_url: string | null
          font_style: string | null
          generated_at: string | null
          headline: string | null
          id: string
          is_published: boolean
          price_text: string | null
          slug: string
          subheadline: string | null
          testimonials: Json | null
          updated_at: string
        }
        Insert: {
          avatar_summary?: string | null
          body_html?: string | null
          brand_colors?: Json | null
          course_id: string
          course_image_url?: string | null
          created_at?: string
          creator_avatar_url?: string | null
          creator_id: string
          creator_name?: string | null
          cta_label?: string | null
          cta_type?: string
          cta_url?: string | null
          font_style?: string | null
          generated_at?: string | null
          headline?: string | null
          id?: string
          is_published?: boolean
          price_text?: string | null
          slug: string
          subheadline?: string | null
          testimonials?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_summary?: string | null
          body_html?: string | null
          brand_colors?: Json | null
          course_id?: string
          course_image_url?: string | null
          created_at?: string
          creator_avatar_url?: string | null
          creator_id?: string
          creator_name?: string | null
          cta_label?: string | null
          cta_type?: string
          cta_url?: string | null
          font_style?: string | null
          generated_at?: string | null
          headline?: string | null
          id?: string
          is_published?: boolean
          price_text?: string | null
          slug?: string
          subheadline?: string | null
          testimonials?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_pages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_pages_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          device_token: string
          id: string
          last_seen: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          device_token: string
          id?: string
          last_seen?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          device_token?: string
          id?: string
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_community_comment: {
        Args: {
          _content: string
          _mentions?: string[]
          _parent_comment_id?: string
          _post_id: string
        }
        Returns: string
      }
      create_community_post: {
        Args: {
          _content: string
          _image_url?: string
          _plan_id: string
          _tags?: string[]
        }
        Returns: string
      }
      enroll_in_course: { Args: { _course_id: string }; Returns: undefined }
      ensure_community_membership: {
        Args: { _plan_id: string }
        Returns: undefined
      }
      get_capture_page: {
        Args: { _slug: string }
        Returns: {
          capture_bullets: Json
          capture_cta: string
          capture_headline: string
          capture_subheadline: string
          creator_avatar: string
          creator_full_name: string
          description: string
          id: string
          image_url: string
          is_lead_magnet: boolean
          requires_login: boolean
          thankyou_headline: string
          thankyou_message: string
          title: string
        }[]
      }
      get_community_group: {
        Args: { _plan_id: string }
        Returns: {
          name: string
        }[]
      }
      get_community_plan: {
        Args: { _plan_id: string }
        Returns: {
          creator_id: string
          id: string
          includes_courses: Json
          title: string
        }[]
      }
      get_community_posts: {
        Args: { _plan_id: string }
        Returns: {
          author_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          image_url: string
          is_pinned: boolean
          likes_count: number
          membership_plan_id: string
          tags: string[]
          updated_at: string
        }[]
      }
      get_course_by_old_slug: {
        Args: { _old_slug: string }
        Returns: {
          course_id: string
          current_slug: string
        }[]
      }
      get_course_by_slug: {
        Args: { _slug: string }
        Returns: {
          creator_name: string
          description: string
          id: string
          image_url: string
          requires_login: boolean
          sequential_unlock: boolean
          title: string
          unlock_trigger: string
        }[]
      }
      get_course_community: {
        Args: { _course_id: string }
        Returns: {
          community_name: string
          plan_id: string
        }[]
      }
      get_course_modules: {
        Args: { _course_id: string }
        Returns: {
          available_from: string
          description: string
          id: string
          module_position: number
          title: string
        }[]
      }
      get_course_progress_for_student: {
        Args: { _course_id: string; _user_id: string }
        Returns: {
          completed_lessons: number
          total_lessons: number
        }[]
      }
      get_course_students: {
        Args: { _course_id: string; _creator_id: string }
        Returns: {
          email: string
          first_accessed: string
          full_name: string
          last_accessed: string
          lessons_completed: number
          progress_percent: number
          total_lessons: number
          user_id: string
        }[]
      }
      get_creator_community: {
        Args: { _slug: string }
        Returns: {
          cover_image_url: string
          creator_avatar: string
          creator_id: string
          creator_name: string
          description: string
          id: string
          is_member: boolean
          member_count: number
          name: string
          slug: string
        }[]
      }
      get_lesson_files: {
        Args: { _lesson_id: string }
        Returns: {
          file_name: string
          file_type: string
          file_url: string
          id: string
        }[]
      }
      get_lesson_videos: {
        Args: { _lesson_id: string }
        Returns: {
          id: string
          pos: number
          title: string
          video_provider: string
          video_url: string
        }[]
      }
      get_module_lessons: {
        Args: { _module_id: string }
        Returns: {
          available_from: string
          content: string
          duration: string
          id: string
          lesson_position: number
          title: string
          video_provider: string
          video_url: string
        }[]
      }
      get_my_communities: {
        Args: never
        Returns: {
          creator_id: string
          description: string
          id: string
          is_creator: boolean
          member_count: number
          membership_plan_id: string
          membership_title: string
          name: string
          post_count: number
        }[]
      }
      get_my_enrolled_courses: {
        Args: never
        Returns: {
          course_id: string
          course_image: string
          course_slug: string
          course_title: string
          enrolled_at: string
          last_accessed_at: string
          requires_login: boolean
        }[]
      }
      get_post_comments: {
        Args: { _post_id: string }
        Returns: {
          author_id: string
          content: string
          created_at: string
          id: string
          likes_count: number
          mentions: string[]
          parent_comment_id: string
          post_id: string
        }[]
      }
      get_public_course: {
        Args: { _slug: string; _token: string }
        Returns: {
          creator_name: string
          description: string
          id: string
          requires_login: boolean
          sequential_unlock: boolean
          title: string
          unlock_trigger: string
        }[]
      }
      get_user_comment_likes: {
        Args: { _comment_ids: string[] }
        Returns: string[]
      }
      get_user_post_likes: { Args: { _post_ids: string[] }; Returns: string[] }
      toggle_comment_like: { Args: { _comment_id: string }; Returns: boolean }
      toggle_post_like: { Args: { _post_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
