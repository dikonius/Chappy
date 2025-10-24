import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import './App.css'
import GuestPage from './pages/GuestPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import DmPage from './pages/DmPage';
import ChannelPage from './pages/ChannelPage';


const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/guest',
        element: <GuestPage />,
      },
      {
        path: '/channel',
        element: <ChannelPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/dm',
            element: <DmPage />,
          },
          {
            path: '/channel',
            element: <ChannelPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
} else {
  throw new Error('Root element not found!');
}