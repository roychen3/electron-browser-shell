import { AuthGuard, Layout } from './components';

import Home from './pages/home';

function App() {
  return (
    <AuthGuard>
      <Layout>
        <Home />
      </Layout>
    </AuthGuard>
  );
}

export default App;
