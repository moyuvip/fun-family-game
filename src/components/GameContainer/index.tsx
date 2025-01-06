import React, { useEffect, useRef } from 'react';
import { GameConfig } from '../../types/game';

interface GameContainerProps {
  game: GameConfig;
  onGameReady?: () => void;
  onGameOver?: (score: number) => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ game, onGameReady, onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initGame = async () => {
      try {
        // 根据游戏类型动态加载游戏
        const gameModule = await import(`../../games/${game.id}`);
        
        gameInstanceRef.current = new gameModule.default({
          ...game.config,
          parent: containerRef.current,
          width: game.width,
          height: game.height,
          backgroundColor: game.backgroundColor
        });

        onGameReady?.();
      } catch (error) {
        console.error('Failed to load game:', error);
      }
    };

    initGame();

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, [game]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden"
      style={{
        width: game.width,
        height: game.height,
        margin: '0 auto'
      }}
    />
  );
};

export default GameContainer; 