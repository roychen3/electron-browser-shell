import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AuthGuard } from '../components';

import SignUp from '../pages/SignUp';
import SignIn from '../pages/SignIn';
import PageNotFound from '../pages/PageNotFound';

export const router = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    ),
    children: [
      {
        path: '/sign-up',
        element: <SignUp />,
      },
      {
        path: '/sign-in',
        element: <SignIn />,
      },
    ],
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
]);
