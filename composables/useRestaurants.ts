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

export const useRestaurants = () => {
  const restaurants = ref<Restaurant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getPhotoUrl = (photoReference: string) => {
    return `http://127.0.0.1:8000/api/photo?photo_reference=${photoReference}`;
  };

  const fetchRestaurants = async (
    keyword: string = "",
    address: string = ""
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/restaurants?keyword=${keyword}&address=${address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      restaurants.value = data.results || [];
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  };

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    getPhotoUrl,
  };
};
