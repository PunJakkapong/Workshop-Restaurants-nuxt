import { ref } from "vue";

// Use for data from API /restaurants
export interface Restaurant {
  place_id: string;
  name: string;
  formatted_address: string;
  opening_hours: {
    open_now: boolean;
  };
  rating: number;
  user_ratings_total: number;
  business_status: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface ApiResponse {
  results: Restaurant[];
  next_page_token?: string;
}

// Use for data from API /restaurants/:place_id
export interface RestaurantDetail {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  adr_address: string;
  business_status: string;
  current_opening_hours: {
    open_now: boolean;
    periods: {
      close: {
        date: string;
        day: number;
        time: string;
      };
      open: {
        date: string;
        day: number;
        time: string;
      };
    }[];
    weekday_text: string[];
  };
  delivery: boolean;
  dine_in: boolean;
  editorial_summary?: {
    language: string;
    overview: string;
  };
  formatted_address: string;
  formatted_phone_number: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  international_phone_number: string;
  name: string;
  opening_hours: {
    open_now: boolean;
    periods: {
      close: {
        day: number;
        time: string;
      };
      open: {
        day: number;
        time: string;
      };
    }[];
    weekday_text: string[];
  };
  photos: {
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }[];
  place_id: string;
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  price_level: number;
  rating: number;
  reference: string;
  reviews: {
    author_name: string;
    author_url: string;
    language: string;
    original_language: string;
    profile_photo_url: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
    translated: boolean;
  }[];
  serves_beer: boolean;
  serves_breakfast: boolean;
  serves_dinner: boolean;
  serves_lunch: boolean;
  serves_wine: boolean;
  takeout: boolean;
  types: string[];
  url: string;
  user_ratings_total: number;
  utc_offset: number;
  vicinity: string;
  website: string;
  wheelchair_accessible_entrance: boolean;
}

// Interface for the response from the restaurant detail API endpoint
export interface RestaurantDetailResponse {
  result: RestaurantDetail;
}

// Read api base url from .env file
const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

// Debounce function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const useRestaurants = () => {
  const restaurants = ref<Restaurant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const nextPageToken = ref<string | null>(null);
  const hasMore = ref(true);
  const isFetching = ref(false);

  // Get photo of restaurant by send photo_reference from API endpoint
  const getPhotoUrl = (photoReference: string) => {
    return `${API_BASE_URL}/photo?photo_reference=${photoReference}`;
  };

  // Get list of restaurant, send keyword and address from API endpoint
  const fetchRestaurants = async (
    keyword: string = "",
    address: string = "",
    isLoadMore: boolean = false
  ) => {
    // Handle some time duplicate fetches
    if (isFetching.value) return;
    isFetching.value = true;

    if (!isLoadMore) {
      loading.value = true;
      error.value = null;
      restaurants.value = [];
      nextPageToken.value = null; // Use for when need featch next page restaurant
      hasMore.value = true;
    }

    try {
      const params = new URLSearchParams({
        keyword,
        address,
        ...(nextPageToken.value && { next_page_token: nextPageToken.value }), // When it's first time search value is ""
      });

      const response = await fetch(
        `${API_BASE_URL}/restaurants?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }

      const data: ApiResponse = await response.json();

      if (isLoadMore) {
        restaurants.value = [...restaurants.value, ...(data.results || [])];
      } else {
        restaurants.value = data.results || [];
      }

      nextPageToken.value = data.next_page_token || null;
      hasMore.value = !!data.next_page_token;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
      isFetching.value = false;
    }
  };

  // Debounced load more function
  const loadMore = debounce(() => {
    if (hasMore.value && !loading.value && !isFetching.value) {
      fetchRestaurants("", "", true);
    }
  }, 500); // 500ms delay

  // Get next page list of restaurant, send keyword and address from API endpoint
  const fetchRestaurantDetail = async (
    placeId: string
  ): Promise<RestaurantDetail | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/${placeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch restaurant details");
      }
      const data: RestaurantDetailResponse = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      return null;
    }
  };

  return {
    restaurants,
    loading,
    error,
    hasMore,
    fetchRestaurants,
    loadMore,
    getPhotoUrl,
    fetchRestaurantDetail,
  };
};
