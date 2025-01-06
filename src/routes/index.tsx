import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import MainLayout from '../layouts/MainLayout';

const Home = lazy(() => import('../pages/Home'));
const Game = lazy(() => import('../pages/Game'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/game/:id',
        element: <Game />,
      },
    ],
  },
]); 