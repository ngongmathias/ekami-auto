// Utility for calculating delivery time estimates between cities in Cameroon

export interface DeliveryEstimate {
  time: string;
  distance: string;
  available: 'immediate' | 'same-day' | 'next-day';
}

// Delivery time matrix between major cities
const deliveryTimes: Record<string, DeliveryEstimate> = {
  // Same city - immediate availability
  'Douala-Douala': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Yaoundé-Yaoundé': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Bamenda-Bamenda': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Bafoussam-Bafoussam': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Garoua-Garoua': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Maroua-Maroua': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  'Ngaoundéré-Ngaoundéré': { time: '30 minutes', distance: 'Local', available: 'immediate' },
  
  // Douala to other cities
  'Douala-Yaoundé': { time: '3-4 hours', distance: '250 km', available: 'same-day' },
  'Douala-Bamenda': { time: '5-6 hours', distance: '370 km', available: 'same-day' },
  'Douala-Bafoussam': { time: '4-5 hours', distance: '280 km', available: 'same-day' },
  'Douala-Garoua': { time: '12-14 hours', distance: '950 km', available: 'next-day' },
  'Douala-Maroua': { time: '14-16 hours', distance: '1,100 km', available: 'next-day' },
  'Douala-Ngaoundéré': { time: '10-12 hours', distance: '750 km', available: 'next-day' },
  
  // Yaoundé to other cities
  'Yaoundé-Douala': { time: '3-4 hours', distance: '250 km', available: 'same-day' },
  'Yaoundé-Bamenda': { time: '6-7 hours', distance: '400 km', available: 'same-day' },
  'Yaoundé-Bafoussam': { time: '3-4 hours', distance: '270 km', available: 'same-day' },
  'Yaoundé-Garoua': { time: '10-12 hours', distance: '700 km', available: 'next-day' },
  'Yaoundé-Maroua': { time: '12-14 hours', distance: '850 km', available: 'next-day' },
  'Yaoundé-Ngaoundéré': { time: '8-10 hours', distance: '500 km', available: 'next-day' },
  
  // Bamenda to other cities
  'Bamenda-Douala': { time: '5-6 hours', distance: '370 km', available: 'same-day' },
  'Bamenda-Yaoundé': { time: '6-7 hours', distance: '400 km', available: 'same-day' },
  'Bamenda-Bafoussam': { time: '2-3 hours', distance: '120 km', available: 'same-day' },
  'Bamenda-Garoua': { time: '10-12 hours', distance: '650 km', available: 'next-day' },
  'Bamenda-Maroua': { time: '12-14 hours', distance: '800 km', available: 'next-day' },
  'Bamenda-Ngaoundéré': { time: '8-10 hours', distance: '450 km', available: 'next-day' },
  
  // Bafoussam to other cities
  'Bafoussam-Douala': { time: '4-5 hours', distance: '280 km', available: 'same-day' },
  'Bafoussam-Yaoundé': { time: '3-4 hours', distance: '270 km', available: 'same-day' },
  'Bafoussam-Bamenda': { time: '2-3 hours', distance: '120 km', available: 'same-day' },
  'Bafoussam-Garoua': { time: '9-11 hours', distance: '600 km', available: 'next-day' },
  'Bafoussam-Maroua': { time: '11-13 hours', distance: '750 km', available: 'next-day' },
  'Bafoussam-Ngaoundéré': { time: '7-9 hours', distance: '400 km', available: 'next-day' },
};

/**
 * Get delivery time estimate between two cities
 * @param carCity - City where the car is currently located
 * @param customerCity - City where customer wants the car delivered
 * @returns Delivery estimate with time, distance, and availability
 */
export function getDeliveryEstimate(
  carCity: string,
  customerCity: string
): DeliveryEstimate {
  // Normalize city names (trim and capitalize)
  const normalizedCarCity = carCity.trim();
  const normalizedCustomerCity = customerCity.trim();
  
  // Create lookup key
  const key = `${normalizedCarCity}-${normalizedCustomerCity}`;
  
  // Return estimate if found
  if (deliveryTimes[key]) {
    return deliveryTimes[key];
  }
  
  // Default fallback for unknown routes
  return {
    time: 'Contact us',
    distance: 'Unknown',
    available: 'same-day'
  };
}

/**
 * Get a user-friendly message about delivery
 * @param carCity - City where the car is currently located
 * @param customerCity - City where customer wants the car delivered
 * @returns Formatted message string
 */
export function getDeliveryMessage(
  carCity: string,
  customerCity: string
): string {
  const estimate = getDeliveryEstimate(carCity, customerCity);
  
  if (carCity === customerCity) {
    return `✅ Available now in ${carCity} - Ready for immediate pickup`;
  }
  
  if (estimate.available === 'same-day') {
    return `🚗 Delivery from ${carCity} to ${customerCity}: ${estimate.time} (${estimate.distance})`;
  }
  
  if (estimate.available === 'next-day') {
    return `📅 Next-day delivery from ${carCity} to ${customerCity}: ${estimate.time} (${estimate.distance})`;
  }
  
  return `📞 Contact us for delivery from ${carCity} to ${customerCity}`;
}

/**
 * Check if car is immediately available in customer's city
 * @param carCity - City where the car is currently located
 * @param customerCity - City where customer wants the car delivered
 * @returns true if car is in same city
 */
export function isImmediatelyAvailable(
  carCity: string,
  customerCity: string
): boolean {
  return carCity.trim() === customerCity.trim();
}

/**
 * Get availability badge color based on delivery estimate
 * @param carCity - City where the car is currently located
 * @param customerCity - City where customer wants the car delivered
 * @returns Tailwind color classes
 */
export function getAvailabilityBadgeColor(
  carCity: string,
  customerCity: string
): string {
  const estimate = getDeliveryEstimate(carCity, customerCity);
  
  switch (estimate.available) {
    case 'immediate':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'same-day':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'next-day':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}
