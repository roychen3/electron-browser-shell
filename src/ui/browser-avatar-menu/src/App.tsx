function App() {
  return (
    <div className="w-48 bg-neutral-800">
      <div className="py-2">
        <button
          // onClick={onSignIn}
          className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
        >
          Sign In
        </button>
        <button
          // onClick={onSignOut}
          className="block w-full px-4 py-1 text-left text-sm text-white hover:bg-neutral-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;
