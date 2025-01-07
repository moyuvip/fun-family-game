import { GameConfig } from '../types/game';

// 当前可用的游戏
export const games: GameConfig[] = [
  {
    id: '2048',
    title: '2048',
    description: '合并相同的数字，获得更高分数',
    coverImage: '/games/2048/cover.png',
    type: 'phaser',
    width: 450,
    height: 550,
    backgroundColor: '#faf8ef'
  },
  {
    id: 'memory-match',
    title: '消消乐',
    description: '翻转卡片配对相同图案，考验记忆力',
    coverImage: '/games/memory-match/cover.png',
    type: 'phaser',
    width: 450,
    height: 600,
    backgroundColor: '#ffffff'
  }
];

// 待开发的游戏
export const upcomingGames: GameConfig[] = [
  {
    id: 'memory-match',
    title: '消消乐',
    description: '一个考验记忆力的趣味游戏，记住配对相同的图标',
    coverImage: '/games/memory-match/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  },
  // ... 其他游戏配置
];

export const getGameById = (id: string): GameConfig | undefined => {
  return games.find(game => game.id === id);
}; 