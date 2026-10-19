/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProductItem, CartItem, Language, CategoryId } from './types';
import { PRODUCTS } from './data/catalog';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryBento } from './components/CategoryBento';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PromoBanner } from './components/PromoBanner';
import { CartDrawer } from './components/CartDrawer';
import { QuickBookingModal } from './components/QuickBookingModal';
import { SearchModal } from './components/SearchModal';
import { AdminProductModal } from './components/AdminProductModal';
import { Footer } from './components/Footer';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [selectedFilter, setSelectedFilter] = useState<CategoryId>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Persistent Admin Authentication session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aplus_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const handleAdminLogin = (password: string): boolean => {
    // Default secure password check requested by user
    if (password === 'AplusAdmin968') {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem('aplus_admin_authenticated', 'true');
      } catch {
        // storage quota or error
      }
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('aplus_admin_authenticated');
    } catch {
      // storage quota or error
    }
  };

  // Maintain live products list with localStorage persistence for custom uploads
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('aplus_cooling_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aplus_cooling_products', JSON.stringify(products));
    } catch {
      // storage quota or unavailable
    }
  }, [products]);

  // Initialize cart from localStorage if present
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aplus_cooling_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('aplus_cooling_cart', JSON.stringify(cartItems));
    } catch {
      // storage unavailable
    }
  }, [cartItems]);

  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleAddProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleResetCatalog = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem('aplus_cooling_products');
    } catch {
      // ignore
    }
  };

  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToSection = (sectionId: string, filterCategory?: string) => {
    if (filterCategory) {
      setSelectedFilter(filterCategory as CategoryId);
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#111111] flex flex-col font-sans selection:bg-[#111111] selection:text-white">
      {/* 1. Top Utility Announcement Bar */}
      <AnnouncementBar lang={lang} onToggleLang={toggleLang} />

      {/* 2. Top Header & Navigation */}
      <Header
        lang={lang}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenBooking={() => setBookingOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
        onSelectCategoryFilter={(cat) => setSelectedFilter(cat as CategoryId)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* 3. Luxury Hero Section */}
        <Hero
          lang={lang}
          onShopClick={() => scrollToSection('catalog', 'units')}
          onBookClick={() => setBookingOpen(true)}
        />

        {/* 4. Category Bento Grid */}
        <CategoryBento
          lang={lang}
          onSelectCategory={(catKey) => scrollToSection('catalog', catKey)}
        />

        {/* 5. Storefront Product & Service Catalog */}
        <ProductGrid
          products={products}
          lang={lang}
          selectedFilter={selectedFilter}
          onFilterChange={(cat) => setSelectedFilter(cat)}
          onAddToCart={handleAddToCart}
          onOpenProductDetail={(prod) => setSelectedProduct(prod)}
          onOpenAdmin={() => setAdminOpen(true)}
          isAdminAuthenticated={isAdminAuthenticated}
        />

        {/* 6. Testimonial & Social Proof Section (Matching Image 4) */}
        <TestimonialsSection lang={lang} />

        {/* 7. Promotional Banner & 4 Value Badges */}
        <PromoBanner
          lang={lang}
          onBookCleaning={() => {
            const cleaningItem = products.find((p) => p.id === 'ac-deep-cleaning');
            if (cleaningItem) {
              handleAddToCart(cleaningItem);
              setCartOpen(true);
            }
          }}
        />
      </main>

      {/* 8. Footer with Discreet Admin Portal Link */}
      <Footer
        lang={lang}
        onNavigateSection={scrollToSection}
        onOpenBooking={() => setBookingOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Slide-out Cart Drawer with Oman WhatsApp Checkout */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        lang={lang}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        lang={lang}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        lang={lang}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectBook={(p) => {
          handleAddToCart(p);
          setCartOpen(true);
        }}
      />

      {/* Admin Product & Photo Management Modal with Password Protection & Session Persistence */}
      <AdminProductModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        lang={lang}
        onAddProduct={handleAddProduct}
        products={products}
        onDeleteProduct={handleDeleteProduct}
        onResetCatalog={handleResetCatalog}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}
