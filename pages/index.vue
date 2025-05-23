<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="title-wrapper">
          <h1 class="modern-title">
            <span class="title-icon">🍽️</span>
            <span class="title-text">Restaurants</span>
          </h1>
        </div>

        <!-- Search Form -->
        <div class="card shadow-sm mb-5 search-panel">
          <div class="card-body">
            <form @submit.prevent="handleSearch" class="row g-3">
              <div class="col-md-5 position-relative">
                <input
                  v-model="searchKeyword"
                  type="text"
                  class="form-control pe-5"
                  placeholder="Search by name..."
                />
                <button
                  v-if="searchKeyword"
                  type="button"
                  class="btn-clear position-absolute"
                  style="right: 15px; top: 50%; transform: translateY(-50%)"
                  @click="searchKeyword = ''"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-x"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </button>
              </div>
              <div class="col-md-5 position-relative">
                <input
                  v-model="searchAddress"
                  type="text"
                  class="form-control pe-5"
                  placeholder="Search by location..."
                />
                <button
                  v-if="searchAddress"
                  type="button"
                  class="btn-clear position-absolute"
                  style="right: 15px; top: 50%; transform: translateY(-50%)"
                  @click="searchAddress = ''"
                  aria-label="Clear location"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    class="bi bi-x"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </button>
              </div>
              <div class="col-md-2">
                <button
                  type="submit"
                  class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 search-btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                    />
                  </svg>
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="loading && restaurants.length === 0"
          class="text-center py-5"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading restaurants...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger text-center">
          {{ error }}
        </div>

        <!-- Restaurant List -->
        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div
            v-for="restaurant in restaurants"
            :key="restaurant.place_id"
            class="col"
          >
            <RestaurantCard
              :restaurant="restaurant"
              :get-photo-url="getPhotoUrl"
              @click="openPanel"
            />
          </div>
        </div>

        <!-- Loading More Indicator -->
        <div v-if="loading && restaurants.length > 0" class="text-center py-4">
          <div
            class="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span class="visually-hidden">Loading more...</span>
          </div>
          <p class="mt-2 text-muted small">Loading more restaurants...</p>
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && !error && restaurants.length === 0"
          class="alert alert-info text-center"
        >
          No restaurants found. Try adjusting your search criteria.
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Panel -->
  <DetailPanel
    v-model="showPanel"
    :show="showPanel"
    :place-id="selectedRestaurant?.place_id"
    @close="closePanel"
  >
    <!-- Panel content will be added here -->
  </DetailPanel>

  <!-- Scroll to Top Button -->
  <button
    v-show="showScrollTop"
    @click="scrollToTop"
    class="scroll-top-btn"
    aria-label="Scroll to top"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      class="bi bi-arrow-up"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRestaurants } from "../composables/useRestaurants";
import type { Restaurant } from "../composables/useRestaurants";
import RestaurantCard from "../components/RestaurantCard.vue";
import DetailPanel from "../components/DetailPanel.vue";

const {
  restaurants,
  loading,
  error,
  hasMore,
  fetchRestaurants,
  loadMore,
  getPhotoUrl,
} = useRestaurants();

// Default keyword set to "Bang sue"
const searchKeyword = ref("Bang sue");
const searchAddress = ref("");
const showScrollTop = ref(false);
const showPanel = ref(false);
const selectedRestaurant = ref<Restaurant | null>(null);

// Use for open DetailPanel
const openPanel = (restaurant: Restaurant) => {
  selectedRestaurant.value = restaurant;
  showPanel.value = true;
  document.body.style.overflow = "hidden";
};

// Use for close DetailPanel
const closePanel = () => {
  showPanel.value = false;
  setTimeout(() => {
    selectedRestaurant.value = null;
    document.body.style.overflow = "";
  }, 300);
};

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;

  // Check if we need to load more restaurants
  if (hasMore.value && !loading.value) {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 1000;

    // If scroll postion is trigger point then need load data more
    if (scrollPosition >= threshold) {
      loadMore();
    }
  }
};

onMounted(() => {
  fetchRestaurants(searchKeyword.value);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleSearch = () => {
  fetchRestaurants(searchKeyword.value, searchAddress.value);
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<style scoped>
.title-wrapper {
  text-align: center;
  margin-bottom: 1rem;
}

.modern-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
}

.title-text {
  background: linear-gradient(45deg, #2196f3, #1976d2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-panel {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  transition: all 0.3s ease;
}

.search-panel:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.btn-clear {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e9ecef;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-clear:hover {
  background-color: #dee2e6;
  color: #495057;
}

.search-btn {
  background: linear-gradient(45deg, #2196f3, #1976d2);
  border: none;
  padding: 0.375rem 1.2rem;
  height: 38px;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: linear-gradient(45deg, #1976d2, #1565c0);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(45deg, #2196f3, #1976d2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
}

.scroll-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #1976d2, #1565c0);
}

.scroll-top-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style> 