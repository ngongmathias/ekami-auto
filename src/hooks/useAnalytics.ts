import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);
}

export function useAnalytics() {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  // Predefined tracking functions
  const trackCarView = (carId: string, carName: string, price: number) => {
    trackEvent('view_item', {
      item_id: carId,
      item_name: carName,
      price: price,
      currency: 'XAF',
    });
  };

  const trackBookingStart = (carId: string, carName: string) => {
    trackEvent('begin_checkout', {
      item_id: carId,
      item_name: carName,
      checkout_step: 1,
    });
  };

  const trackBookingComplete = (
    carId: string,
    carName: string,
    totalAmount: number,
    bookingId: string
  ) => {
    trackEvent('purchase', {
      transaction_id: bookingId,
      value: totalAmount,
      currency: 'XAF',
      items: [
        {
          item_id: carId,
          item_name: carName,
          price: totalAmount,
        },
      ],
    });
  };

  const trackPurchaseInquiry = (carId: string, carName: string, price: number) => {
    trackEvent('generate_lead', {
      item_id: carId,
      item_name: carName,
      value: price,
      currency: 'XAF',
    });
  };

  const trackSearch = (searchTerm: string) => {
    trackEvent('search', {
      search_term: searchTerm,
    });
  };

  const trackFilter = (filterType: string, filterValue: string) => {
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  const trackWhatsAppClick = (carId?: string, carName?: string) => {
    trackEvent('contact_whatsapp', {
      item_id: carId,
      item_name: carName,
    });
  };

  const trackPhoneClick = (carId?: string, carName?: string) => {
    trackEvent('contact_phone', {
      item_id: carId,
      item_name: carName,
    });
  };

  const trackCompareAdd = (carId: string, carName: string) => {
    trackEvent('add_to_compare', {
      item_id: carId,
      item_name: carName,
    });
  };

  const trackBlogView = (postId: string, postTitle: string) => {
    trackEvent('view_blog_post', {
      post_id: postId,
      post_title: postTitle,
    });
  };

  const trackCommentSubmit = (postId: string) => {
    trackEvent('submit_comment', {
      post_id: postId,
    });
  };

  const trackCurrencyChange = (newCurrency: string) => {
    trackEvent('currency_change', {
      currency: newCurrency,
    });
  };

  return {
    trackEvent,
    trackCarView,
    trackBookingStart,
    trackBookingComplete,
    trackPurchaseInquiry,
    trackSearch,
    trackFilter,
    trackWhatsAppClick,
    trackPhoneClick,
    trackCompareAdd,
    trackBlogView,
    trackCommentSubmit,
    trackCurrencyChange,
  };
}
