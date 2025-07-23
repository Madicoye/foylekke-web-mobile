// Default Ads Service - Provides placeholder ads to encourage user engagement
export const defaultAds = {
  // Default banner ads encouraging users to advertise
  bannerAds: [
    {
      _id: 'default-banner-1',
      type: 'banner',
      title: 'Boost Your Restaurant\'s Visibility',
      description: 'Reach more customers in Dakar! Advertise your restaurant here and get discovered by food lovers.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Advertise Here',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['homepage_hero', 'homepage_between_sections', 'places_list'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 1
    },
    {
      _id: 'default-banner-2',
      type: 'banner',
      title: 'Promote Your Business Today',
      description: 'Join hundreds of businesses already advertising on Foy Lekke. Increase your bookings and visibility.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Get Started',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['place_detail', 'search_results', 'places_list'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 2
    },
    {
      _id: 'default-banner-3',
      type: 'banner',
      title: 'Stand Out from the Competition',
      description: 'Featured listings get 5x more views. Showcase your business at the top of search results.',
      image: 'https://images.unsplash.com/photo-1559329007-40df8fdc5d38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Learn More',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['homepage_between_sections', 'sidebar'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 3
    }
  ],

  // Default sponsored place ads
  sponsoredPlaces: [
    {
      _id: 'default-sponsored-1',
      type: 'sponsored_place',
      title: 'Feature Your Restaurant Here',
      description: 'Get premium placement in search results and attract more customers to your business.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Sponsor Now',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['places_list', 'search_results'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 1,
      place: {
        _id: 'default-place-1',
        name: 'Your Business Name',
        description: 'Your business description will appear here. Attract customers with compelling content.',
        images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'],
        type: 'restaurant',
        cuisine: ['senegalese'],
        rating: 4.5,
        priceRange: 'medium',
        address: {
          street: 'Your Address Here',
          city: 'Dakar',
          region: 'Dakar',
          country: 'Senegal'
        },
        contact: {
          phone: '+221 XX XXX XX XX',
          email: 'your-email@example.com'
        },
        isDefault: true,
        isSponsored: true
      }
    }
  ],

  // Default native ads
  nativeAds: [
    {
      _id: 'default-native-1',
      type: 'native',
      title: 'Grow Your Business with Foy Lekke Ads',
      description: 'Reach thousands of potential customers searching for places like yours. Start advertising today and see immediate results.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      ctaText: 'Start Advertising',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['homepage_between_sections', 'place_detail', 'search_results'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 1
    },
    {
      _id: 'default-native-2',
      type: 'native',
      title: 'Why Advertise on Foy Lekke?',
      description: 'Join over 500+ businesses already promoting on Senegal\'s #1 place discovery platform. Affordable rates, proven results.',
      image: 'https://images.unsplash.com/photo-1559329007-40df8fdc5d38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      ctaText: 'View Pricing',
      ctaUrl: '/advertiser/dashboard',
      status: 'active',
      placement: ['sidebar', 'places_list'],
      targeting: {
        regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor'],
        placeTypes: ['restaurant', 'hotel', 'attraction']
      },
      isDefault: true,
      priority: 2
    }
  ]
};

// Default API functions that provide placeholder ads
export const defaultAdsAPI = {
  // Get default ads for specific placement
  getPlacementAds: (placement, params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allAds = [
          ...defaultAds.bannerAds,
          ...defaultAds.sponsoredPlaces,
          ...defaultAds.nativeAds
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

        // Sort by priority
        typeFilteredAds.sort((a, b) => a.priority - b.priority);

        // Limit results
        const limit = params.limit || 2;
        const result = typeFilteredAds.slice(0, limit);

        resolve(result);
      }, 200); // Simulate network delay
    });
  },

  // Track impression (default)
  trackImpression: (adId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📊 Default: Tracked impression for ad ${adId}`);
        resolve({ success: true });
      }, 100);
    });
  },

  // Track click (default)
  trackClick: (adId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`🖱️ Default: Tracked click for ad ${adId}`);
        resolve({ success: true });
      }, 100);
    });
  }
};

// Check if default ads should be shown
export const shouldShowDefaultAds = () => {
  // Always show default ads when no real ads are available
  return true;
};

// Get default ads configuration
export const getDefaultAdsConfig = () => {
  return {
    enabled: true,
    priority: 'lowest', // Show only when no real ads available
    message: 'Advertise your business here and boost your visibility!',
    ctaText: 'Get Started',
    ctaUrl: '/advertiser/dashboard'
  };
};

export default defaultAds; 