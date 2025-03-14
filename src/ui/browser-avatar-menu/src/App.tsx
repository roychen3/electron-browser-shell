import { useAuth } from './auth/auth-react';

function App() {
  const { token } = useAuth();

  const closeThisPopup = async () => {
    await window.electronAPI.closeAvatarMenuPopup();
  };

  const handleSignIn = async () => {
    const to = import.meta.env.PROD
      ? 'app://authenticator/sign-in'
      : 'http://localhost:3000/sign-in';
    window.electronAPI.browserNavigateTo(to);
    closeThisPopup();
  };

  const handleSignOut = async () => {
    window.electronAPI.setToken('');
    closeThisPopup();
  };

  return (
    <div className="w-48 bg-neutral-800">
      <div className="py-2">
        {token ? (
          <>
            <div className="px-4 py-1 text-left text-sm text-white">Hi!</div>
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleSignIn}
            className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
