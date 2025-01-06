export interface GameConfig {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  type: 'phaser' | 'html5' | 'iframe';
  width: number;
  height: number;
  backgroundColor?: string;
  config?: any;
}

export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
} 