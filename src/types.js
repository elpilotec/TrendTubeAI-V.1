// src/types.js

export interface VideoDetails {
  title: string;
  description: string;
  duration: number;
  viewCount: number;
  thumbnail: string;
}

export interface TopComment {
  author: string;
  text: string;
}

export interface GeneratedIdea {
  titulo: string;
  guion: string;
  hashtags: string[];
  sugerenciasProduccion: string[];
  ideasAdicionales?: string[];
}