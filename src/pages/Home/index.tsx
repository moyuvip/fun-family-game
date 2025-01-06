import React from 'react';
import { useTranslation } from 'react-i18next';
import GameCard from '../../components/GameCard';
import { games } from '../../data/games';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#4080FF] mb-2">
          {t('site.title')}
        </h1>
        <p className="text-gray-600">
          {t('site.subtitle')}
        </p>
      </div>
      
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map(game => (
            <GameCard
              key={game.id}
              id={game.id}
              title={game.title}
              description={game.description}
              coverImage={game.coverImage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 