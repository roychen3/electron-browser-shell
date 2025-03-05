import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to the Home Page</h1>
      <p className="mt-4 text-gray-600">This is a protected application where you can manage your tasks securely.</p>
    </div>
  );
};

export default Home;