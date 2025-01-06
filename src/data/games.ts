import { GameConfig } from '../types/game';

export const games: GameConfig[] = [
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
  {
    id: 'sudoku',
    title: '数独',
    description: '一个经典的数字益智游戏，填充数字让每行每列都不重复',
    coverImage: '/games/sudoku/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  },
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
    id: 'gomoku',
    title: '五子棋',
    description: '经典的五子棋游戏，考验策略思维',
    coverImage: '/games/gomoku/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#DEB887'
  },
  {
    id: 'frog-jump',
    title: '井字棋',
    description: '经典的井字棋游戏，训练逻辑思维',
    coverImage: '/games/frog-jump/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  },
  {
    id: 'color-match',
    title: '颜色匹配',
    description: '训练视觉和色彩感知能力',
    coverImage: '/games/color-match/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  },
  {
    id: 'maze',
    title: '迷宫游戏',
    description: '通过迷宫考验空间思维能力',
    coverImage: '/games/maze/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  },
  {
    id: 'number-puzzle',
    title: '数字拼图',
    description: '经典数字滑块游戏，训练思维',
    coverImage: '/games/number-puzzle/cover.png',
    type: 'phaser',
    width: 800,
    height: 600,
    backgroundColor: '#4A90E2'
  }
];

export const getGameById = (id: string): GameConfig | undefined => {
  return games.find(game => game.id === id);
}; 