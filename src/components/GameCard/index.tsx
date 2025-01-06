import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, description, coverImage }) => {
  return (
    <Link 
      to={`/game/${id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow w-full"
    >
      <div className="relative pt-[100%]">
        <img 
          src={coverImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default GameCard; 