import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GameContainer from '../../components/GameContainer';
import { getGameById } from '../../data/games';

const Game: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const game = id ? getGameById(id) : undefined;

  if (!game) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('game.notFound')}</h2>
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('game.back')}
        </Link>
      </div>
    );
  }

  const handleGameReady = () => {
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('game.back')}
        </Link>
        <h1 className="text-2xl font-bold">{game.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
              <div className="text-white text-xl">{t('game.loading')}</div>
            </div>
          )}
          
          <GameContainer
            game={game}
            onGameReady={handleGameReady}
          />
        </div>

        <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">{t('game.howToPlay')}</h2>
          <div className="space-y-3 text-gray-600">
            <p>{t('games.2048.instruction1')}</p>
            <p>{t('games.2048.instruction2')}</p>
            <p>{t('games.2048.instruction3')}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default Game; 