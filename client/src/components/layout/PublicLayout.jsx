import { Outlet } from 'react-router-dom';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import ScrollRestoration from '@/components/layout/ScrollRestoration';
import VisitorTracker from '@/components/analytics/VisitorTracker';
import { ProductSearchProvider } from '@/context/ProductSearchContext';
import { EnquiryModalProvider } from '@/context/EnquiryModalContext';
import { SiteDataProvider } from '@/context/SiteDataContext';

export default function PublicLayout() {
  return (
    <ProductSearchProvider>
      <EnquiryModalProvider>
        <SiteDataProvider>
          <ScrollRestoration />
          <VisitorTracker />
          <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </SiteDataProvider>
      </EnquiryModalProvider>
    </ProductSearchProvider>
  );
}
