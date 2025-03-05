import { createMemoryRouter, Link, Outlet } from 'react-router-dom';

import { AuthGuard } from '../components';

import SignUp from '../pages/SignUp';
import SignIn from '../pages/SignIn';
import PageNotFound from '../pages/PageNotFound';


export const router = createMemoryRouter([
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
      {
        path: '/feature-one',
        element: (
          <div>
            <h1>FEATURE ONE</h1>
            <div>
              <Link to="/sign-up">Sign up page</Link>
            </div>
            <div>
              <Link to="/sign-in">Sign in page</Link>
            </div>
            <div>
              <Link to="/feature-two">Feature two page</Link>
            </div>
          </div>
        ),
      },
      {
        path: '/feature-two',
        element: (
          <div>
            <h1>FEATURE TWO</h1>
            <div>
              <Link to="/sign-up">Sign up page</Link>
            </div>
            <div>
              <Link to="/sign-in">Sign in page</Link>
            </div>
            <div>
              <Link to="/feature-one">Feature one page</Link>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
]);
