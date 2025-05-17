import { ref } from "vue";

interface Restaurant {
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

interface ApiResponse {
  results: Restaurant[];
  next_page_token?: string;
}

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

  const getPhotoUrl = (photoReference: string) => {
    return `${API_BASE_URL}/photo?photo_reference=${photoReference}`;
  };

  const fetchRestaurants = async (
    keyword: string = "",
    address: string = "",
    isLoadMore: boolean = false
  ) => {
    // Prevent duplicate fetches
    if (isFetching.value) return;
    isFetching.value = true;

    if (!isLoadMore) {
      loading.value = true;
      error.value = null;
      restaurants.value = [];
      nextPageToken.value = null;
      hasMore.value = true;
    }

    try {
      const params = new URLSearchParams({
        keyword,
        address,
        ...(nextPageToken.value && { next_page_token: nextPageToken.value }),
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

  return {
    restaurants,
    loading,
    error,
    hasMore,
    fetchRestaurants,
    loadMore,
    getPhotoUrl,
  };
};
