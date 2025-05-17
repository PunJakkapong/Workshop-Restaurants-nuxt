<template>
  <div
    class="card h-100 shadow-sm hover-shadow d-flex flex-column"
    @click.stop="$emit('click', restaurant)"
    style="cursor: pointer"
  >
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
              restaurant.opening_hours?.open_now ? 'bg-success' : 'bg-danger',
            ]"
          >
            {{ restaurant.opening_hours?.open_now ? "Open Now" : "Closed" }}
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
</template>

<script setup lang="ts">
import type { Restaurant } from "../composables/useRestaurants";

defineProps<{
  restaurant: Restaurant;
  getPhotoUrl: (photoReference: string) => string;
}>();

defineEmits<{
  (e: "click", restaurant: Restaurant): void;
}>();
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
</style>

<script lang="ts">
export default {
  name: "RestaurantCard",
};
</script> 