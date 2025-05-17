<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <h1 class="text-center mb-5">Restaurants</h1>

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
        <div v-if="loading" class="text-center py-5">
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
            <div class="card h-100 shadow-sm hover-shadow d-flex flex-column">
              <!-- Restaurant Photo -->
              <div
                v-if="restaurant.photos && restaurant.photos.length > 0"
                class="restaurant-photo"
              >
                <img
                  :src="getPhotoUrl(restaurant.photos[0].photo_reference)"
                  class="img-fluid w-100"
                  :alt="restaurant.name"
                />
              </div>
              <div
                v-else
                class="restaurant-photo bg-light d-flex align-items-center justify-content-center"
              >
                <span class="text-muted">No photo</span>
              </div>

              <!-- Restaurant Info -->
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate">{{ restaurant.name }}</h5>
                <p class="card-text text-muted small mb-3">
                  {{ restaurant.formatted_address }}
                </p>

                <div class="mt-auto pt-3">
                  <div class="d-flex align-items-center gap-3">
                    <span
                      :class="[
                        'badge',
                        restaurant.opening_hours?.open_now
                          ? 'bg-success'
                          : 'bg-danger',
                      ]"
                    >
                      {{
                        restaurant.opening_hours?.open_now
                          ? "Open Now"
                          : "Closed"
                      }}
                    </span>
                    <div class="d-flex align-items-center">
                      <template v-if="restaurant.rating">
                        <span class="text-warning me-1">★</span>
                        <span class="fw-medium">{{ restaurant.rating }}</span>
                        <span class="text-muted small ms-1"
                          >({{ restaurant.user_ratings_total }})</span
                        >
                      </template>
                      <template v-else>
                        <span class="text-muted small">No Rating</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

const { restaurants, loading, error, fetchRestaurants, getPhotoUrl } =
  useRestaurants();
const searchKeyword = ref("Bang sue");
const searchAddress = ref("");
const showScrollTop = ref(false);

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
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
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  transition: all 0.2s ease-in-out;
}

.restaurant-photo {
  height: 120px;
  overflow: hidden;
}

.restaurant-photo img {
  height: 100%;
  object-fit: cover;
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

.search-panel {
  position: sticky;
  top: 20px;
  z-index: 1000;
  background: white;
  transition: all 0.3s ease;
}

.search-panel:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
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