<template>
  <div
    v-show="modelValue"
    class="detail-panel"
    :class="{ show: show }"
    @click="handleClickOutside"
  >
    <div class="detail-panel-content">
      <button
        class="btn-close position-absolute"
        style="top: 20px; right: 20px"
        @click.stop="close"
        aria-label="Close panel"
      ></button>
      <div class="detail-panel-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading restaurant details...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="restaurant" class="restaurant-detail">
          <!-- Header with Photo -->
          <div class="restaurant-header">
            <div
              v-if="restaurant.photos && restaurant.photos.length > 0"
              class="restaurant-photo"
            >
              <img
                :src="getPhotoUrl(restaurant.photos[0].photo_reference)"
                :alt="restaurant.name"
                class="img-fluid w-100"
              />
            </div>
            <div class="restaurant-info">
              <h2 class="restaurant-name">{{ restaurant.name }}</h2>
              <div class="d-flex align-items-center gap-3 mb-2">
                <span
                  :class="[
                    'badge',
                    restaurant.opening_hours?.open_now
                      ? 'bg-success'
                      : 'bg-danger',
                  ]"
                >
                  {{
                    restaurant.opening_hours?.open_now ? "Open Now" : "Closed"
                  }}
                </span>
                <div class="d-flex align-items-center">
                  <span class="text-warning me-1">★</span>
                  <span class="fw-medium">{{ restaurant.rating }}</span>
                  <span class="review-count ms-1"
                    >({{ restaurant.user_ratings_total }})</span
                  >
                </div>
                <div class="price-level">
                  <span
                    v-for="n in restaurant.price_level"
                    :key="n"
                    class="text-muted"
                    >$</span
                  >
                </div>
              </div>
              <p class="address mb-0">{{ restaurant.formatted_address }}</p>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="quick-info mt-4">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="info-card">
                  <h6 class="mb-3">Contact & Location</h6>
                  <div v-if="restaurant.formatted_phone_number" class="mb-2">
                    <i class="bi bi-telephone me-2"></i>
                    <a
                      :href="`tel:${restaurant.international_phone_number}`"
                      class="text-decoration-none"
                    >
                      {{ restaurant.formatted_phone_number }}
                    </a>
                  </div>
                  <div v-if="restaurant.website" class="mb-2">
                    <i class="bi bi-globe me-2"></i>
                    <a
                      :href="restaurant.website"
                      target="_blank"
                      class="text-decoration-none"
                    >
                      Website
                    </a>
                  </div>
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${restaurant.geometry.location.lat},${restaurant.geometry.location.lng}`"
                    target="_blank"
                    class="map-link"
                  >
                    <i class="bi bi-map me-1"></i>
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-card">
                  <h6 class="mb-3">Services</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-if="restaurant.delivery"
                      class="badge bg-light text-dark"
                      >Delivery</span
                    >
                    <span
                      v-if="restaurant.takeout"
                      class="badge bg-light text-dark"
                      >Takeout</span
                    >
                    <span
                      v-if="restaurant.dine_in"
                      class="badge bg-light text-dark"
                      >Dine-in</span
                    >
                    <span
                      v-if="restaurant.serves_breakfast"
                      class="badge bg-light text-dark"
                      >Breakfast</span
                    >
                    <span
                      v-if="restaurant.serves_lunch"
                      class="badge bg-light text-dark"
                      >Lunch</span
                    >
                    <span
                      v-if="restaurant.serves_dinner"
                      class="badge bg-light text-dark"
                      >Dinner</span
                    >
                    <span
                      v-if="restaurant.wheelchair_accessible_entrance"
                      class="badge bg-light text-dark"
                      >Wheelchair Accessible</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="opening-hours mt-4">
            <h6 class="mb-3">Opening Hours</h6>
            <div class="info-card">
              <div
                v-if="restaurant.opening_hours?.weekday_text"
                class="weekday-list"
              >
                <div
                  v-for="(day, index) in restaurant.opening_hours.weekday_text"
                  :key="index"
                  class="weekday-item"
                >
                  {{ day }}
                </div>
              </div>
              <div v-else class="text-muted">Hours not available</div>
            </div>
          </div>

          <!-- Reviews -->
          <div class="reviews mt-4">
            <h6 class="mb-3">Reviews</h6>
            <div
              v-if="restaurant.reviews && restaurant.reviews.length > 0"
              class="review-list"
            >
              <div
                v-for="review in restaurant.reviews"
                :key="review.time"
                class="review-item"
              >
                <div class="d-flex align-items-center mb-2">
                  <div>
                    <div class="reviewer-name">{{ review.author_name }}</div>
                    <div class="review-meta">
                      <span class="text-warning me-1">★</span>
                      <span class="me-2">{{ review.rating }}</span>
                      <span class="text-muted small">{{
                        review.relative_time_description
                      }}</span>
                    </div>
                  </div>
                </div>
                <p class="review-text mb-0">{{ review.text }}</p>
              </div>
            </div>
            <div v-else class="text-muted">No reviews available</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { RestaurantDetail } from "../composables/useRestaurants";
import { useRestaurants } from "../composables/useRestaurants";

const props = defineProps<{
  modelValue: boolean;
  show: boolean;
  placeId?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const { fetchRestaurantDetail, getPhotoUrl } = useRestaurants();
const restaurant = ref<RestaurantDetail | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("detail-panel")) {
    close();
  }
};

// Use watchEffect to handle API calls
watchEffect(async () => {
  // Only fetch if panel is shown and we have a placeId
  if (props.show && props.placeId) {
    loading.value = true;
    error.value = null;

    try {
      const details = await fetchRestaurantDetail(props.placeId);
      if (details) {
        restaurant.value = details;
      } else {
        error.value = "Failed to load restaurant details";
      }
    } catch (err) {
      error.value = "An error occurred while loading restaurant details";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.detail-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.detail-panel.show {
  opacity: 1;
  visibility: visible;
}

.detail-panel-content {
  background: white;
  width: 100%;
  max-width: 1000px;
  height: 85vh;
  border-radius: 20px 20px 0 0;
  position: relative;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.detail-panel.show .detail-panel-content {
  transform: translateY(0);
}

.detail-panel-body {
  padding: 60px 30px 30px;
  height: 100%;
  overflow-y: auto;
}

.btn-close {
  z-index: 1;
  opacity: 0.7;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  position: absolute;
  top: 20px;
  right: 20px;
  transform: translate(0, 0);
}

.btn-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.7);
}

.btn-close::before {
  content: "×";
  color: white;
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transform: translateY(-1px);
}

.restaurant-header {
  position: relative;
  margin: -60px -30px 0;
}

.restaurant-photo {
  height: 300px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.restaurant-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.7) 50%,
    transparent
  );
  color: white;
}

.restaurant-name {
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.address {
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}

.badge {
  text-shadow: none;
  font-weight: 500;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
}

.weekday-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weekday-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #dee2e6;
}

.weekday-item:last-child {
  border-bottom: none;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.review-meta {
  font-size: 0.875rem;
}

.review-text {
  color: #495057;
  line-height: 1.5;
}

.price-level {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.review-count {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.map-link {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.map-link:hover {
  background: #1976d2;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
  transform: translateY(-1px);
}

.map-link:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.map-link i {
  font-size: 1rem;
  margin-right: 6px;
}
</style>

<script lang="ts">
export default {
  name: "DetailPanel",
};
</script> 