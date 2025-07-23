import { adsAPI } from './api';

class AnalyticsService {
  constructor() {
    this.eventQueue = [];
    this.isOnline = navigator.onLine;
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    
    // Start periodic flush
    this.startPeriodicFlush();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Track ad impression
  trackAdImpression(adId, context = {}) {
    const event = {
      type: 'ad_impression',
      adId,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        ...context
      }
    };

    this.queueEvent(event);
    
    // Also track via API
    if (this.isOnline) {
      adsAPI.trackImpression(adId).catch(console.error);
    }
  }

  // Track ad click
  trackAdClick(adId, context = {}) {
    const event = {
      type: 'ad_click',
      adId,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        clickPosition: context.clickPosition || null,
        ...context
      }
    };

    this.queueEvent(event);
    
    // Also track via API
    if (this.isOnline) {
      adsAPI.trackClick(adId).catch(console.error);
    }
  }

  // Track ad conversion
  trackAdConversion(adId, conversionType = 'default', value = 0) {
    const event = {
      type: 'ad_conversion',
      adId,
      conversionType,
      value,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        referrer: document.referrer
      }
    };

    this.queueEvent(event);
    
    // Also track via API
    if (this.isOnline) {
      adsAPI.trackConversion(adId).catch(console.error);
    }
  }

  // Track user interaction with places
  trackPlaceInteraction(placeId, interactionType, context = {}) {
    const event = {
      type: 'place_interaction',
      placeId,
      interactionType, // 'view', 'click', 'favorite', 'share', 'review'
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        ...context
      }
    };

    this.queueEvent(event);
  }

  // Track search activity
  trackSearch(query, filters = {}, results = 0) {
    const event = {
      type: 'search',
      query,
      filters,
      results,
      timestamp: Date.now(),
      context: {
        url: window.location.href
      }
    };

    this.queueEvent(event);
  }

  // Track page view
  trackPageView(page, context = {}) {
    const event = {
      type: 'page_view',
      page,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        referrer: document.referrer,
        ...context
      }
    };

    this.queueEvent(event);
  }

  // Queue event for batch processing
  queueEvent(event) {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Flush events to server
  async flushEvents() {
    if (!this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send events to analytics endpoint
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events if sending failed
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  // Send events to server
  async sendEvents(events) {
    // This would typically send to your analytics service
    // For now, we'll just log them
    console.log('Analytics events:', events);
    
    // You can implement actual sending to your backend here
    // await api.post('/api/analytics/events', { events });
  }

  // Start periodic flush
  startPeriodicFlush() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Get ad performance metrics
  async getAdPerformance(adId, timeRange = '7d') {
    try {
      const analytics = await adsAPI.getAdAnalytics(adId);
      return {
        ...analytics,
        timeRange,
        calculatedMetrics: this.calculateMetrics(analytics)
      };
    } catch (error) {
      console.error('Failed to get ad performance:', error);
      return null;
    }
  }

  // Calculate derived metrics
  calculateMetrics(analytics) {
    const { impressions, clicks, conversions, cost } = analytics;
    
    return {
      ctr: impressions > 0 ? (clicks / impressions * 100).toFixed(2) : 0,
      conversionRate: clicks > 0 ? (conversions / clicks * 100).toFixed(2) : 0,
      costPerClick: clicks > 0 ? (cost / clicks).toFixed(2) : 0,
      costPerConversion: conversions > 0 ? (cost / conversions).toFixed(2) : 0,
      roi: cost > 0 ? (((conversions * 100) - cost) / cost * 100).toFixed(2) : 0 // Assuming 100 XOF per conversion
    };
  }

  // Track viewport visibility for ads
  trackAdVisibility(adId, element) {
    if (!element || !window.IntersectionObserver) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.trackAdImpression(adId, {
              visibilityRatio: entry.intersectionRatio,
              boundingRect: entry.boundingClientRect
            });
          }
        });
      },
      {
        threshold: 0.5 // Track when 50% of ad is visible
      }
    );

    observer.observe(element);
    
    // Return cleanup function
    return () => observer.disconnect();
  }

  // Track time spent on page
  trackTimeOnPage() {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      this.queueEvent({
        type: 'time_on_page',
        duration: timeSpent,
        page: window.location.pathname,
        timestamp: Date.now()
      });
      
      // Force flush before page unload
      this.flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Return cleanup function
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }

  // A/B test tracking
  trackABTest(testName, variant, context = {}) {
    const event = {
      type: 'ab_test',
      testName,
      variant,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        ...context
      }
    };

    this.queueEvent(event);
  }

  // Error tracking
  trackError(error, context = {}) {
    const event = {
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    this.queueEvent(event);
  }

  // Performance tracking
  trackPerformance(metric, value, context = {}) {
    const event = {
      type: 'performance',
      metric,
      value,
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        ...context
      }
    };

    this.queueEvent(event);
  }

  // Clean up resources
  destroy() {
    this.flushEvents();
    // Clear any intervals or event listeners
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService; 