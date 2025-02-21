import SignIn from './pages/SignIn'
import PageNotFound from './pages/PageNotFound'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { useEffect } from 'react';

const router = createBrowserRouter([
  {
    children: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

function App() {
  useEffect(() => {
    const destroyOnUrlUpdate = window.electronAPI.onUrlUpdate(url => {
      console.log('Current URL:', url)
      // const uUrl = new URL(url);
      // const pathname = uUrl.searchParams.get('pathname')
      // console.log('pathname:', pathname)
      // console.log(window.location.pathname)
      // if(window.location.pathname.includes('/index.html') && pathname === '/') {
      //   router.navigate(pathname)
      // }else if(pathname !== window.location.pathname){
      //   router.navigate(pathname)
      // }
    })

    return () => {
      console.log('Destroying onUrlUpdate')
      destroyOnUrlUpdate()
    }
  })
  return <RouterProvider router={router} />
}

export default App
