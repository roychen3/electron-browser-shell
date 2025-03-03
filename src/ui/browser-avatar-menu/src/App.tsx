function App() {
  const closeThisPopup = async () => {
    await window.electronAPI.closePopup('avatar-menu');
  };

  const handleSignIn = async () => {
    window.electronAPI.browserNavigateTo(
      'app://authenticator/?pathname=/sign-in'
    );
    await closeThisPopup();
  };

  const handleSignOut = async () => {
    await closeThisPopup();
  };

  return (
    <div className="w-48 bg-neutral-800">
      <div className="py-2">
        <button
          onClick={handleSignIn}
          className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
        >
          Sign In
        </button>
        <button
          onClick={handleSignOut}
          className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;
