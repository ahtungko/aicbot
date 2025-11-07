import React from 'react';
import { ChatLayout } from './components/ChatLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <ChatLayout />
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;