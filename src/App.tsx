/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { AuthModal } from './components/AuthModal';
import { WhatsAppLiveWidget } from './components/WhatsAppLiveWidget';
import { NewsletterBanner } from './components/NewsletterBanner';
import { MyOrdersView } from './components/MyOrdersView';
import { MyWishlistView } from './components/MyWishlistView';
import { Footer } from './components/Footer';

function MainApp() {
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'my-orders' | 'wishlist'>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const { setIsTrackingModalOpen } = useStore();

  const handleExploreClick = () => {
    setCurrentView('store');
    const catalogElem = document.getElementById('katalog-produk');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderSuccess = (orderId: string) => {
    setConfirmedOrderId(orderId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            <HeroBanner onExploreClick={handleExploreClick} />
            <ProductCatalog
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <NewsletterBanner />
            <Footer
              onCategorySelect={catId => {
                setSelectedCategory(catId);
                handleExploreClick();
              }}
              onOpenTracking={() => setIsTrackingModalOpen(true)}
              onOpenWishlist={() => setCurrentView('wishlist')}
            />
          </>
        )}

        {currentView === 'admin' && (
          <React.Suspense fallback={<div className="p-8 text-center">Memuat Admin...</div>}>
            {/* Lazy or direct imported AdminDashboard */}
            <AdminDashboardView onBackToStore={() => setCurrentView('store')} />
          </React.Suspense>
        )}

        {currentView === 'my-orders' && (
          <>
            <MyOrdersView
              onBackToStore={() => setCurrentView('store')}
              onOpenOrderConfirmation={id => setConfirmedOrderId(id)}
            />
            <Footer
              onCategorySelect={catId => {
                setCurrentView('store');
                setSelectedCategory(catId);
              }}
              onOpenTracking={() => setIsTrackingModalOpen(true)}
              onOpenWishlist={() => setCurrentView('wishlist')}
            />
          </>
        )}

        {currentView === 'wishlist' && (
          <>
            <MyWishlistView onBackToStore={() => setCurrentView('store')} />
            <Footer
              onCategorySelect={catId => {
                setCurrentView('store');
                setSelectedCategory(catId);
              }}
              onOpenTracking={() => setIsTrackingModalOpen(true)}
              onOpenWishlist={() => setCurrentView('wishlist')}
            />
          </>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal onSuccessOrder={handleOrderSuccess} />
      <OrderConfirmationModal
        orderId={confirmedOrderId}
        onClose={() => setConfirmedOrderId(null)}
      />
      <OrderTrackingModal />
      <ThermalReceiptModal />
      <PaymentGatewayModal />
      <AuthModal />
      <WhatsAppLiveWidget />
    </div>
  );
}

// Sub-component wrapper for AdminDashboard
import { AdminDashboard } from './components/AdminDashboard';
function AdminDashboardView({ onBackToStore }: { onBackToStore: () => void }) {
  return <AdminDashboard onBackToStore={onBackToStore} />;
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
