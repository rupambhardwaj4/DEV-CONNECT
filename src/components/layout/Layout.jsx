import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function Layout({ children, showSidebar = true, showFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header />

      <div className="flex flex-1 min-h-0">
        {showSidebar && <Sidebar />}

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="app-main-content flex-1 py-7 lg:py-9">
            {children}
          </div>

          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
