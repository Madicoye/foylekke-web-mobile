// Demo Ads Service - Provides sample ads for demonstration
export const demoAds = {
  // Sample banner ads
  bannerAds: [
    {
      _id: 'demo-banner-1',
      type: 'banner',
      title: 'Discover Teranga Restaurant',
      description: 'Authentic Senegalese cuisine in the heart of Dakar. Try our famous thieboudienne!',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Order Now',
      ctaUrl: 'https://example.com/teranga-restaurant',
      status: 'active',
      placement: ['homepage_hero', 'homepage_between_sections'],
      targeting: {
        regions: ['Dakar'],
        placeTypes: ['restaurant']
      },
      advertiser: {
        name: 'Teranga Restaurant',
        companyName: 'Teranga SARL'
      },
      budget: {
        amount: 50000,
        type: 'daily'
      },
      metrics: {
        impressions: 1250,
        clicks: 45,
        ctr: 3.6
      }
    },
    {
      _id: 'demo-banner-2',
      type: 'banner',
      title: 'Visit Goree Island',
      description: 'Historical tours and cultural experiences. Book your ferry tickets now!',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Book Tour',
      ctaUrl: 'https://example.com/goree-tours',
      status: 'active',
      placement: ['places_list', 'homepage_between_sections'],
      targeting: {
        regions: ['Dakar'],
        placeTypes: ['tourist_attraction']
      },
      advertiser: {
        name: 'Goree Tours',
        companyName: 'Senegal Tourism Co.'
      },
      budget: {
        amount: 75000,
        type: 'daily'
      },
      metrics: {
        impressions: 2100,
        clicks: 89,
        ctr: 4.2
      }
    },
    {
      _id: 'demo-banner-3',
      type: 'banner',
      title: 'Dakar Shopping Center',
      description: 'Modern shopping mall with international brands and local crafts.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Visit Mall',
      ctaUrl: 'https://example.com/dakar-shopping',
      status: 'active',
      placement: ['homepage_hero', 'places_list'],
      targeting: {
        regions: ['Dakar'],
        placeTypes: ['shopping_mall']
      },
      advertiser: {
        name: 'Dakar Shopping Center',
        companyName: 'Mall Management Ltd'
      },
      budget: {
        amount: 100000,
        type: 'daily'
      },
      metrics: {
        impressions: 3200,
        clicks: 156,
        ctr: 4.9
      }
    }
  ],

  // Sample sponsored places
  sponsoredPlaces: [
    {
      _id: 'demo-sponsored-1',
      type: 'sponsored_place',
      title: 'Featured Restaurant',
      description: 'Premium listing for top-rated restaurant',
      status: 'active',
      placement: ['places_list'],
      priority: 8,
      place: {
        _id: 'place-1',
        name: 'Chez Loutcha',
        description: 'Traditional Senegalese restaurant with live music and authentic atmosphere',
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        rating: 4.8,
        reviewCount: 127,
        priceLevel: 2,
        address: {
          street: '15 Rue de la République',
          city: 'Dakar',
          region: 'Dakar'
        },
        contact: {
          phone: '+221 33 821 4567'
        },
        category: 'restaurant',
        subcategory: 'traditional'
      },
      ctaText: 'Reserve Table',
      ctaUrl: 'https://example.com/chez-loutcha',
      targeting: {
        regions: ['Dakar'],
        placeTypes: ['restaurant']
      },
      advertiser: {
        name: 'Chez Loutcha',
        companyName: 'Loutcha Restaurant SARL'
      },
      budget: {
        amount: 25000,
        type: 'daily'
      },
      metrics: {
        impressions: 890,
        clicks: 67,
        ctr: 7.5
      }
    },
    {
      _id: 'demo-sponsored-2',
      type: 'sponsored_place',
      title: 'Featured Hotel',
      description: 'Premium hotel listing with special offers',
      status: 'active',
      placement: ['places_list'],
      priority: 7,
      place: {
        _id: 'place-2',
        name: 'Radisson Blu Hotel Dakar',
        description: 'Luxury hotel with ocean views and modern amenities',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        rating: 4.6,
        reviewCount: 89,
        priceLevel: 4,
        address: {
          street: 'Route de la Corniche Est',
          city: 'Dakar',
          region: 'Dakar'
        },
        contact: {
          phone: '+221 33 869 6969'
        },
        category: 'hotel',
        subcategory: 'luxury'
      },
      ctaText: 'Book Now',
      ctaUrl: 'https://example.com/radisson-dakar',
      targeting: {
        regions: ['Dakar'],
        placeTypes: ['hotel']
      },
      advertiser: {
        name: 'Radisson Blu Dakar',
        companyName: 'Radisson Hotel Group'
      },
      budget: {
        amount: 40000,
        type: 'daily'
      },
      metrics: {
        impressions: 1450,
        clicks: 98,
        ctr: 6.8
      }
    }
  ],

  // Sample native ads
  nativeAds: [
    {
      _id: 'demo-native-1',
      type: 'native',
      title: 'Discover Senegal\'s Hidden Gems',
      description: 'Join our guided tours to explore the most beautiful and authentic places in Senegal.',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Tours',
      ctaUrl: 'https://example.com/senegal-tours',
      status: 'active',
      placement: ['homepage_between_sections'],
      targeting: {
        regions: ['Dakar', 'Saint-Louis', 'Thiès'],
        placeTypes: ['tourist_attraction']
      },
      advertiser: {
        name: 'Senegal Discovery Tours',
        companyName: 'Discovery Tours SARL'
      },
      budget: {
        amount: 30000,
        type: 'daily'
      },
      metrics: {
        impressions: 1800,
        clicks: 72,
        ctr: 4.0
      }
    }
  ]
};

// Demo API functions that simulate real API calls
export const demoAdsAPI = {
  // Get ads for specific placement
  getPlacementAds: (placement, params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allAds = [
          ...demoAds.bannerAds,
          ...demoAds.sponsoredPlaces,
          ...demoAds.nativeAds
        ];

        // Filter by placement
        const filteredAds = allAds.filter(ad => 
          ad.placement.includes(placement)
        );

        // Filter by region if specified
        let regionFilteredAds = filteredAds;
        if (params.region) {
          regionFilteredAds = filteredAds.filter(ad => 
            ad.targeting.regions.includes(params.region)
          );
        }

        // Filter by place type if specified
        let typeFilteredAds = regionFilteredAds;
        if (params.placeType) {
          typeFilteredAds = regionFilteredAds.filter(ad => 
            ad.targeting.placeTypes.includes(params.placeType)
          );
        }

        // Limit results
        const limit = params.limit || 3;
        const result = typeFilteredAds.slice(0, limit);

        resolve(result);
      }, 300); // Simulate network delay
    });
  },

  // Track impression (demo)
  trackImpression: (adId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📊 Demo: Tracked impression for ad ${adId}`);
        resolve({ success: true });
      }, 100);
    });
  },

  // Track click (demo)
  trackClick: (adId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`🖱️ Demo: Tracked click for ad ${adId}`);
        resolve({ success: true });
      }, 100);
    });
  }
};

// Demo mode toggle
export const isDemoMode = () => {
  const storedMode = localStorage.getItem('foy-lekke-demo-mode');
  // Enable demo mode by default if not set
  if (storedMode === null) {
    enableDemoMode();
    return true;
  }
  return storedMode === 'true';
};

export const enableDemoMode = () => {
  localStorage.setItem('foy-lekke-demo-mode', 'true');
  console.log('🎭 Demo mode enabled - showing sample ads');
};

export const disableDemoMode = () => {
  localStorage.setItem('foy-lekke-demo-mode', 'false');
  console.log('🎭 Demo mode disabled - using real ads');
};

export const toggleDemoMode = () => {
  const currentMode = isDemoMode();
  if (currentMode) {
    disableDemoMode();
  } else {
    enableDemoMode();
  }
  return !currentMode;
}; 