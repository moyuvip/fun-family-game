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
    description: '交换相邻方块，匹配三个相同图案',
    coverImage: '/games/memory-match/cover.png',
    type: 'phaser',
    width: 450,
    height: 600,
    backgroundColor: '#ffffff'
  },
  {
    id: 'snake',
    title: '贪吃蛇',
    description: '控制蛇吃食物成长，注意不要撞到墙或自己',
    coverImage: '/games/snake/cover.png',
    type: 'phaser',
    width: 450,
    height: 600,
    backgroundColor: '#f8fafc'
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