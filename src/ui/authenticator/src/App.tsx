import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import SignIn from './pages/SignIn';
import PageNotFound from './pages/PageNotFound';

const router = createMemoryRouter([
  {
    children: [
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

let tempPathname = '/';

router.subscribe((state) => {
  console.log('------ router.subscribe ------');
  console.log('state.location.pathname:', state.location.pathname);
  const newPathname = state.location.pathname.replace('C:/', '');
  if (tempPathname !== newPathname) {
    tempPathname = newPathname;
    window.history.pushState({}, '', newPathname)
  }
});

const navigate = (url: string) => {
  const uUrl = new URL(url);
  const pathname = import.meta.env.PROD ? uUrl.searchParams.get('pathname') : uUrl.pathname;
  if (tempPathname !== pathname) {
    console.log('------ navigate ------');
    console.log('pathname:', pathname);
    tempPathname = pathname || '/';
    router.navigate(pathname);
  }
};

// Get initial URL
window.electronAPI.getCurrentUrl().then((url) => {
  console.log('------ getCurrentUrl ------');
  console.log('url:', url);
  navigate(url);
});

// Subscribe to URL updates
window.electronAPI.onUrlUpdate((url) => {
  console.log('------ onUrlUpdate ------');
  console.log('url:', url);
  navigate(url);
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
