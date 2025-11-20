import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List, 
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAvailableCarsForSale, type Car } from '../lib/supabase';
import FilterSidebar from '../components/cars/FilterSidebar';
import CarGrid from '../components/cars/CarGrid';

type SortOption = 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'name-asc';

export default function BuyPage() {
  const { t } = useTranslation();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState({
    priceRange: [0, 100000000] as [number, number], // Higher range for sale prices
    bodyTypes: [] as string[],
    transmissions: [] as string[],
    fuelTypes: [] as string[],
    seats: [] as string[],
    cities: [] as string[],
  });

  // Fetch cars for sale
  useEffect(() => {
    async function fetchCars() {
      try {
        setLoading(true);
        const data = await getAvailableCarsForSale();
        setCars(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load cars for sale');
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let filtered = [...cars];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car =>
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.body_type?.toLowerCase().includes(query) ||
        car.year.toString().includes(query)
      );
    }

    // Price range filter (using sale price)
    filtered = filtered.filter(car => {
      const price = car.price_sale || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Body type filter
    if (filters.bodyTypes.length > 0) {
      filtered = filtered.filter(car =>
        car.body_type && filters.bodyTypes.includes(car.body_type)
      );
    }

    // Transmission filter
    if (filters.transmissions.length > 0) {
      filtered = filtered.filter(car =>
        car.transmission && filters.transmissions.includes(car.transmission)
      );
    }

    // Fuel type filter
    if (filters.fuelTypes.length > 0) {
      filtered = filtered.filter(car =>
        car.fuel_type && filters.fuelTypes.includes(car.fuel_type)
      );
    }

    // Seats filter
    if (filters.seats.length > 0) {
      filtered = filtered.filter(car => {
        if (!car.seats) return false;
        const seatStr = car.seats.toString();
        return filters.seats.some(s => {
          if (s === '7') return car.seats! >= 7;
          return seatStr === s;
        });
      });
    }

    // City filter
    if (filters.cities.length > 0) {
      filtered = filtered.filter(car =>
        car.city && filters.cities.includes(car.city)
      );
    }

    // Sort (using sale price instead of rental price)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price_sale || 0) - (b.price_sale || 0);
        case 'price-desc':
          return (b.price_sale || 0) - (a.price_sale || 0);
        case 'year-desc':
          return b.year - a.year;
        case 'year-asc':
          return a.year - b.year;
        case 'name-asc':
          return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cars, searchQuery, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCars.length / itemsPerPage);
  const paginatedCars = filteredAndSortedCars.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: [0, 100000000],
      bodyTypes: [],
      transmissions: [],
      fuelTypes: [],
      seats: [],
      cities: [],
    });
    setSearchQuery('');
    setSortBy('price-asc');
  };

  const sortOptions = [
    { value: 'price-asc' as SortOption, label: 'Price: Low to High' },
    { value: 'price-desc' as SortOption, label: 'Price: High to Low' },
    { value: 'year-desc' as SortOption, label: 'Year: Newest First' },
    { value: 'year-asc' as SortOption, label: 'Year: Oldest First' },
    { value: 'name-asc' as SortOption, label: 'Name: A to Z' },
  ];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-gold-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-ekami-gold-600 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white">
                Buy a Car
              </h1>
              <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300 mt-1">
                Own your dream luxury vehicle today
              </p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-ekami-gold-100 to-ekami-gold-50 dark:from-ekami-gold-900/20 dark:to-ekami-charcoal-800 rounded-xl border border-ekami-gold-200 dark:border-ekami-gold-800">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-ekami-gold-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                <strong className="text-ekami-gold-700 dark:text-ekami-gold-400">Flexible Financing Available!</strong>
                <span className="ml-2">Get pre-approved in minutes. Competitive rates starting from 8.5% APR.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search by make, model, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-gold-200 dark:border-ekami-charcoal-700 rounded-2xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white placeholder-ekami-charcoal-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-ekami-charcoal-400" />
              </button>
            )}
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Results Count */}
            <div className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                {filteredAndSortedCars.length}
              </span>{' '}
              {filteredAndSortedCars.length === 1 ? 'vehicle' : 'vehicles'} for sale
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-gold-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-2 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ekami-charcoal-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center space-x-1 p-1 bg-ekami-gold-100 dark:bg-ekami-charcoal-800 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-ekami-charcoal-700 text-ekami-gold-600 shadow-md'
                      : 'text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-charcoal-900 dark:hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-ekami-charcoal-700 text-ekami-gold-600 shadow-md'
                      : 'text-ekami-charcoal-600 dark:text-ekami-silver-400 hover:text-ekami-charcoal-900 dark:hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center space-x-2 px-4 py-2 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              mode="sale"
            />
          </div>

          {/* Car Grid/List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-56 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedCars.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                  No vehicles found
                </h3>
                <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <CarGrid cars={paginatedCars} viewMode={viewMode} mode="sale" />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border-2 border-ekami-gold-200 dark:border-ekami-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-ekami-gold-400 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first, last, current, and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] h-10 rounded-xl font-semibold transition-all ${
                              page === currentPage
                                ? 'bg-ekami-gold-600 text-white shadow-lg'
                                : 'border-2 border-ekami-gold-200 dark:border-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:border-ekami-gold-400'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border-2 border-ekami-gold-200 dark:border-ekami-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-ekami-gold-400 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-ekami-charcoal-900 z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-800 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    handleFilterChange(newFilters);
                    setShowMobileFilters(false);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                  mode="sale"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
