import axios from 'axios';

// In-memory access token storage
let memoryAccessToken = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Queue handling for silent refresh synchronization
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token
client.interceptors.request.use(
  (config) => {
    if (memoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Refresh & Auto-Mock Fallback on Network Error
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is network connection failure (Backend Offline Fallback)
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_CONNECTION_REFUSED' ||
      [502, 503, 504].includes(error.response?.status);

    if (isNetworkError) {
      console.warn('⚠️ [API Client] Backend unavailable or network error. Executing Auto-Mock Fallback:', originalRequest.url);
      return handleMockFallback(originalRequest);
    }

    // Handle 401 Unauthorized (Token Refresh Flow)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await client.post('/auth/refresh');
        const newToken = refreshResponse.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ==========================================================================
   AUTO-MOCK FALLBACK BACKEND (Offline Dev Support)
   ========================================================================== */

const MOCK_HISTORICAL_DETECTIONS = [
  {
    id: 'det_001',
    domain: 'amazon.com',
    url: 'https://amazon.com/dp/B08N5WRWNW',
    snippet: 'Only 1 item left in stock - order soon!',
    patternType: 'dark-pattern',
    confidence: 0.98,
    timestamp: '2026-07-30T18:45:00Z',
    pageTitle: 'Wireless Headphones - Limited Deal'
  },
  {
    id: 'det_002',
    domain: 'booking.com',
    url: 'https://booking.com/hotel/us/grand-resort.html',
    snippet: '14 other people are looking at this hotel right now.',
    patternType: 'dark-pattern',
    confidence: 0.94,
    timestamp: '2026-07-30T17:30:00Z',
    pageTitle: 'Grand Luxury Resort & Spa'
  },
  {
    id: 'det_003',
    domain: 'temu.com',
    url: 'https://temu.com/flash-sale-gadget.html',
    snippet: 'Claim your 90% OFF voucher before timer expires in 01:59!',
    patternType: 'dark-pattern',
    confidence: 0.99,
    timestamp: '2026-07-30T16:15:00Z',
    pageTitle: 'Temu Exclusive Flash Coupon'
  },
  {
    id: 'det_004',
    domain: 'shein.com',
    url: 'https://shein.com/summer-dress-v2.html',
    snippet: 'Added to cart by 84 shoppers in the last hour.',
    patternType: 'dark-pattern',
    confidence: 0.91,
    timestamp: '2026-07-30T15:00:00Z',
    pageTitle: 'Summer Floral Printed Mini Dress'
  },
  {
    id: 'det_005',
    domain: 'wish.com',
    url: 'https://wish.com/product/smart-watch-ultra',
    snippet: 'Free gift added! (Just pay $14.99 processing fee)',
    patternType: 'dark-pattern',
    confidence: 0.96,
    timestamp: '2026-07-30T14:10:00Z',
    pageTitle: 'Smart Watch Pro Series'
  },
  {
    id: 'det_006',
    domain: 'ticketmaster.com',
    url: 'https://ticketmaster.com/event/rock-concert-2026',
    snippet: 'Service fee ($24.50) automatically added during checkout step 4.',
    patternType: 'dark-pattern',
    confidence: 0.93,
    timestamp: '2026-07-29T21:40:00Z',
    pageTitle: 'Rock World Tour Tickets'
  },
  {
    id: 'det_007',
    domain: 'expedia.com',
    url: 'https://expedia.com/flights/nyc-to-lon',
    snippet: 'Prices for this flight usually increase by 35% in 2 hours!',
    patternType: 'dark-pattern',
    confidence: 0.89,
    timestamp: '2026-07-29T19:20:00Z',
    pageTitle: 'NYC to London Express Flights'
  },
  {
    id: 'det_008',
    domain: 'aliexpress.com',
    url: 'https://aliexpress.com/item/10050032.html',
    snippet: 'Uncheck this box if you DO NOT wish to subscribe to weekly $9.99 VIP club.',
    patternType: 'dark-pattern',
    confidence: 0.97,
    timestamp: '2026-07-29T18:00:00Z',
    pageTitle: 'AliExpress Global Super Deals'
  },
  {
    id: 'det_009',
    domain: 'adobe.com',
    url: 'https://adobe.com/creativecloud/plans.html',
    snippet: 'Annual plan paid monthly - Early cancellation fee applies ($120).',
    patternType: 'dark-pattern',
    confidence: 0.95,
    timestamp: '2026-07-28T14:45:00Z',
    pageTitle: 'Adobe Creative Cloud Pricing'
  },
  {
    id: 'det_010',
    domain: 'ryanair.com',
    url: 'https://ryanair.com/booking/extras',
    snippet: 'No thanks, I prefer risking my luggage without travel protection insurance.',
    patternType: 'dark-pattern',
    confidence: 0.92,
    timestamp: '2026-07-28T11:15:00Z',
    pageTitle: 'Flight Add-ons & Travel Extras'
  },
  {
    id: 'det_011',
    domain: 'amazon.com',
    url: 'https://amazon.com/cart',
    snippet: 'Prime 30-Day Free Trial pre-selected at checkout.',
    patternType: 'dark-pattern',
    confidence: 0.88,
    timestamp: '2026-07-27T16:30:00Z',
    pageTitle: 'Amazon Shopping Cart'
  },
  {
    id: 'det_012',
    domain: 'booking.com',
    url: 'https://booking.com/searchresults.html',
    snippet: '98% of rooms in New York are already booked for your dates!',
    patternType: 'dark-pattern',
    confidence: 0.94,
    timestamp: '2026-07-27T09:10:00Z',
    pageTitle: 'Hotel Search Results'
  },
  {
    id: 'det_013',
    domain: 'temu.com',
    url: 'https://temu.com/spin-wheel-win.html',
    snippet: 'JACKPOT! You won $100 store credit (Minimum spend $300 required).',
    patternType: 'dark-pattern',
    confidence: 0.99,
    timestamp: '2026-07-26T22:00:00Z',
    pageTitle: 'Temu Wheel Spin Game'
  },
  {
    id: 'det_014',
    domain: 'godaddy.com',
    url: 'https://godaddy.com/domains/checkout',
    snippet: 'Added 5 domain privacy & protection addons to cart automatically.',
    patternType: 'dark-pattern',
    confidence: 0.91,
    timestamp: '2026-07-26T13:40:00Z',
    pageTitle: 'GoDaddy Cart Review'
  },
  {
    id: 'det_015',
    domain: 'justfab.com',
    url: 'https://justfab.com/checkout',
    snippet: 'Become a VIP member today ($49.95/mo recurring charge unless canceled by phone).',
    patternType: 'dark-pattern',
    confidence: 0.98,
    timestamp: '2026-07-25T15:20:00Z',
    pageTitle: 'JustFab VIP Membership Checkout'
  }
];

const MOCK_WEBSITE_SCORES = [
  { domain: 'temu.com', riskScore: 94.8, totalScans: 850, totalDetections: 412 },
  { domain: 'wish.com', riskScore: 91.2, totalScans: 520, totalDetections: 289 },
  { domain: 'booking.com', riskScore: 86.5, totalScans: 1420, totalDetections: 512 },
  { domain: 'amazon.com', riskScore: 78.4, totalScans: 3100, totalDetections: 620 },
  { domain: 'shein.com', riskScore: 76.1, totalScans: 940, totalDetections: 245 },
  { domain: 'godaddy.com', riskScore: 71.3, totalScans: 430, totalDetections: 110 },
  { domain: 'adobe.com', riskScore: 68.0, totalScans: 610, totalDetections: 140 },
  { domain: 'ryanair.com', riskScore: 65.5, totalScans: 380, totalDetections: 88 },
  { domain: 'expedia.com', riskScore: 59.2, totalScans: 720, totalDetections: 104 },
  { domain: 'ticketmaster.com', riskScore: 54.0, totalScans: 890, totalDetections: 98 }
];

async function handleMockFallback(config) {
  const url = config.url || '';
  const params = config.params || {};
  
  // Artificial slight delay for realistic UI feel
  await new Promise((r) => setTimeout(r, 200));

  if (url.includes('/auth/login') || url.includes('/auth/signup')) {
    const payload = JSON.parse(config.data || '{}');
    const mockUser = {
      id: 'usr_cyber_001',
      email: payload.email || 'analyst@darkpattern.ai',
      name: 'Cyber Threat Analyst',
      role: 'Lead Researcher'
    };
    const mockToken = 'mock_jwt_access_token_cyberpunk_2026';
    setAccessToken(mockToken);
    return { data: { user: mockUser, accessToken: mockToken }, status: 200 };
  }

  if (url.includes('/auth/refresh')) {
    const mockToken = 'mock_jwt_refreshed_token_2026';
    setAccessToken(mockToken);
    return { data: { accessToken: mockToken }, status: 200 };
  }

  if (url.includes('/auth/logout')) {
    setAccessToken(null);
    return { data: { message: 'Logged out successfully' }, status: 200 };
  }

  if (url.includes('/dashboard/overview')) {
    return {
      data: {
        totalScans: 9840,
        totalDetections: 2819,
        topPatternTypes: [
          { type: 'dark-pattern', count: 2819, percentage: 100 }
        ],
        recentActivity: MOCK_HISTORICAL_DETECTIONS.slice(0, 5)
      },
      status: 200
    };
  }

  if (url.includes('/dashboard/trends')) {
    const range = params.range || '7d';
    let countDays = 7;
    if (range === '30d') countDays = 30;
    if (range === '90d') countDays = 90;

    const series = [];
    const today = new Date();
    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const baseCount = Math.floor(Math.random() * 40) + 80;
      series.push({ date: dateStr, count: baseCount });
    }

    return { data: { series }, status: 200 };
  }

  if (url.includes('/dashboard/website-scores')) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const start = (page - 1) * limit;
    const paginatedItems = MOCK_WEBSITE_SCORES.slice(start, start + limit);
    return {
      data: {
        items: paginatedItems,
        total: MOCK_WEBSITE_SCORES.length,
        page,
        limit
      },
      status: 200
    };
  }

  if (url.includes('/detections/')) {
    const id = url.split('/detections/')[1];
    const found = MOCK_HISTORICAL_DETECTIONS.find((d) => d.id === id) || MOCK_HISTORICAL_DETECTIONS[0];
    return { data: found, status: 200 };
  }

  if (url.includes('/detections')) {
    let filtered = [...MOCK_HISTORICAL_DETECTIONS];
    if (params.domain) {
      filtered = filtered.filter((item) =>
        item.domain.toLowerCase().includes(params.domain.toLowerCase())
      );
    }
    if (params.patternType) {
      filtered = filtered.filter((item) => item.patternType === params.patternType);
    }

    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const start = (page - 1) * limit;
    const paginatedItems = filtered.slice(start, start + limit);

    return {
      data: {
        items: paginatedItems,
        total: filtered.length,
        page,
        limit
      },
      status: 200
    };
  }

  // Default fallback for any unhandled mock route
  return {
    data: { message: 'Mock response success', ok: true },
    status: 200
  };
}

export default client;
