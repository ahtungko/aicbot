import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationProvider } from './contexts/ConversationContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './components/ui/sheet';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        <ConversationProvider>
          <div className="flex h-screen flex-col">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
            <OfflineIndicator />

            <div className="flex flex-1 overflow-hidden">
              <aside className="hidden w-64 border-r bg-muted/40 md:block">
                <Sidebar />
              </aside>

              <Sheet
                open={isMobileSidebarOpen}
                onOpenChange={setIsMobileSidebarOpen}
              >
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="border-b p-4">
                    <SheetTitle>Conversations</SheetTitle>
                  </SheetHeader>
                  <Sidebar />
                </SheetContent>
              </Sheet>

              <main className="flex-1 overflow-hidden">
                <ChatArea />
              </main>
            </div>
          </div>
        </ConversationProvider>
      </OfflineProvider>
    </QueryClientProvider>
  );
}

export default App;
