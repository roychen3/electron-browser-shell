import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';

import SignIn from './pages/SignIn';
import PageNotFound from './pages/PageNotFound';

const router = createMemoryRouter([
  {
    children: [
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

let tempPathname = '/';

router.subscribe((state) => {
  console.log('-- router.subscribe ----');
  console.log('pathname:', state.location.pathname);
  const newPathname = state.location.pathname.replace('C:/', '');
  if (tempPathname !== newPathname) {
    tempPathname = newPathname;
    const url = import.meta.env.PROD
      ? `app:///authenticator/?pathname=${newPathname}`
      : newPathname;
    window.history.pushState({}, '', url);
  }
});

const navigate = (url: string) => {
  console.log('url:', url);
  const uUrl = new URL(url);
  const pathname = import.meta.env.PROD
    ? uUrl.searchParams.get('pathname')
    : uUrl.pathname;
  if (tempPathname !== pathname) {
    tempPathname = pathname || '/';
    router.navigate(pathname);
  }
};

const setInitUrl = async () => {
  console.log('-- setInitUrl ----');
  const tabId = await window.electronAPI.getOwnTabId();
  const tab = await window.electronAPI.getTabById(tabId || '');
  navigate(tab?.url || '');
};
setInitUrl();

// Subscribe to URL updates
window.electronAPI.onUrlUpdate((url) => {
  console.log('-- onUrlUpdate ----');
  navigate(url);
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
