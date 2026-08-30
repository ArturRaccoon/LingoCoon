/**
 * Handwritten Supabase boundary types used by the application.
 *
 * The repository does not contain database migrations, and the configured
 * PostgREST schema endpoint is not currently accessible. Replace this file with
 * generated Supabase types when schema access is available.
 */

export type Profile = {
  id: string;
  email: string;
  nickname: string | null;
  native_language: string | null;
  target_language: string | null;
  current_level: string | null;
  learning_purpose: string | null;
  learning_purpose_details: string | null;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export interface OnboardingData {
  nickname: string;
  native_language: string;
  target_language: string;
  current_level: string;
  learning_purpose: string;
  learning_purpose_details?: string;
}

export type Deck = {
  id: string;
  user_id: string;
  title: string;
  language_from: string;
  language_to: string;
  created_at: string;
  updated_at: string;
};

export type DeckWithCardCount = Deck & {
  card_count: number;
};

export type Card = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  example_sentence: string | null;
  pronunciation: string | null;
  created_at: string;
  updated_at: string;
};

export type StudyProgress = {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = {
  id: string;
  email: string;
  nickname?: string | null;
  native_language?: string | null;
  target_language?: string | null;
  current_level?: string | null;
  learning_purpose?: string | null;
  learning_purpose_details?: string | null;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ProfileUpdate = Partial<ProfileInsert>;

type DeckInsert = {
  id?: string;
  user_id: string;
  title: string;
  language_from: string;
  language_to: string;
  created_at?: string;
  updated_at?: string;
};

type DeckUpdate = Partial<Omit<DeckInsert, 'id' | 'user_id'>>;

type CardInsert = {
  id?: string;
  deck_id: string;
  front: string;
  back: string;
  example_sentence?: string | null;
  pronunciation?: string | null;
  created_at?: string;
  updated_at?: string;
};

type CardUpdate = Partial<Omit<CardInsert, 'id' | 'deck_id'>>;

type StudyProgressInsert = {
  id?: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  created_at?: string;
  updated_at?: string;
};

type StudyProgressUpdate = Partial<
  Omit<StudyProgressInsert, 'id' | 'user_id' | 'card_id'>
>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      decks: {
        Row: Deck;
        Insert: DeckInsert;
        Update: DeckUpdate;
        Relationships: [];
      };
      cards: {
        Row: Card;
        Insert: CardInsert;
        Update: CardUpdate;
        Relationships: [
          {
            foreignKeyName: 'cards_deck_id_fkey';
            columns: ['deck_id'];
            isOneToOne: false;
            referencedRelation: 'decks';
            referencedColumns: ['id'];
          },
        ];
      };
      study_progress: {
        Row: StudyProgress;
        Insert: StudyProgressInsert;
        Update: StudyProgressUpdate;
        Relationships: [
          {
            foreignKeyName: 'study_progress_card_id_fkey';
            columns: ['card_id'];
            isOneToOne: false;
            referencedRelation: 'cards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'study_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
