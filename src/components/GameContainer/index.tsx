import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GameConfig } from '../../types/game';

interface GameContainerProps {
  game: GameConfig;
  onGameReady?: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ game, onGameReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!containerRef.current) return;

    const initGame = async () => {
      try {
        const gameModule = await import(/* @vite-ignore */ `../../games/${game.id}/index.ts`);
        
        gameInstanceRef.current = new gameModule.default({
          ...game.config,
          parent: containerRef.current,
          width: game.width,
          height: game.height,
          backgroundColor: game.backgroundColor,
          i18n: i18n
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
  }, [game, i18n.language]);

  useEffect(() => {
    const game = gameInstanceRef.current;
    if (game && game.scene.scenes[0]) {
      game.scene.scenes[0].updateTexts();
    }
  }, [i18n.language]);

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