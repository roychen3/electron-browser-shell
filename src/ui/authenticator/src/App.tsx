import SignIn from './pages/SignIn'
import PageNotFound from './pages/PageNotFound'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "sign-in",
        element: <SignIn />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);


function App() {
  return <RouterProvider router={router} />
}

export default App
