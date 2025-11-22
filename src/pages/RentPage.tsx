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
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAvailableCarsForRent, type Car } from '../lib/supabase';
import FilterSidebar from '../components/cars/FilterSidebar';
import CarGrid from '../components/cars/CarGrid';
import { fuzzySearch, autoCorrect, getSearchSuggestions, COMMON_CAR_MAKES } from '../lib/fuzzySearch';

type SortOption = 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'name-asc';

export default function RentPage() {
  const { t } = useTranslation();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState({
    priceRange: [0, 50000000] as [number, number],
    bodyTypes: [] as string[],
    transmissions: [] as string[],
    fuelTypes: [] as string[],
    seats: [] as string[],
    cities: [] as string[],
  });

  // Fetch cars
  useEffect(() => {
    async function fetchCars() {
      try {
        setLoading(true);
        const data = await getAvailableCarsForRent();
        setCars(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load cars');
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  // Filter and sort cars
  const filteredAndSortedCars = useMemo(() => {
    let filtered = [...cars];

    // Fuzzy search filter
    if (searchQuery) {
      const corrected = autoCorrect(searchQuery);
      if (corrected !== searchQuery.toLowerCase()) {
        setCorrectedQuery(corrected);
      } else {
        setCorrectedQuery('');
      }
      
      filtered = fuzzySearch(
        filtered,
        corrected,
        (car) => [
          car.make,
          car.model,
          `${car.make} ${car.model}`,
          car.body_type || '',
          car.year.toString(),
          car.features?.join(' ') || '',
        ],
        0.6 // 60% similarity threshold
      );
    } else {
      setCorrectedQuery('');
    }

    // Price range filter
    filtered = filtered.filter(car => {
      const price = car.price_rent_daily || 0;
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

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.price_rent_daily || 0) - (b.price_rent_daily || 0);
        case 'price-desc':
          return (b.price_rent_daily || 0) - (a.price_rent_daily || 0);
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
      priceRange: [0, 50000000],
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
    <div className="min-h-screen py-8 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Rent a Car
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300">
            Choose from our premium selection of vehicles
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search by make, model, or type... (e.g., Toyota, SUV, 2023)"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                
                // Generate suggestions
                if (value.length >= 2) {
                  const allSearchableTerms = [
                    ...COMMON_CAR_MAKES,
                    ...cars.map(car => car.make),
                    ...cars.map(car => car.model),
                    ...cars.map(car => `${car.make} ${car.model}`),
                  ];
                  const uniqueTerms = [...new Set(allSearchableTerms)];
                  const suggestions = getSearchSuggestions(value, uniqueTerms, 5);
                  setSearchSuggestions(suggestions);
                  setShowSuggestions(suggestions.length > 0);
                } else {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay to allow clicking suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-2xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white placeholder-ekami-charcoal-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-ekami-charcoal-400" />
              </button>
            )}
            
            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl shadow-2xl overflow-hidden"
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-ekami-gold-50 dark:hover:bg-ekami-charcoal-700 transition-colors text-ekami-charcoal-900 dark:text-white border-b border-ekami-silver-100 dark:border-ekami-charcoal-700 last:border-b-0"
                    >
                      <Search className="w-4 h-4 inline mr-2 text-ekami-charcoal-400" />
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Autocorrect Message */}
          {correctedQuery && (
            <div className="flex items-center gap-2 text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <span>Showing results for</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">"{correctedQuery}"</span>
            </div>
          )}

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Results Count */}
            <div className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              <span className="font-semibold text-ekami-charcoal-900 dark:text-white">
                {filteredAndSortedCars.length}
              </span>{' '}
              {filteredAndSortedCars.length === 1 ? 'car' : 'cars'} available
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-10 pr-10 py-2 bg-white dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-2 focus:ring-ekami-gold-400/20 transition-all text-ekami-charcoal-900 dark:text-white cursor-pointer"
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
              <div className="hidden md:flex items-center space-x-1 p-1 bg-ekami-silver-100 dark:bg-ekami-charcoal-800 rounded-xl">
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
            ) : (
              <>
                <CarGrid cars={paginatedCars} viewMode={viewMode} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-ekami-gold-400 transition-colors"
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
                                : 'border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:border-ekami-gold-400'
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
                      className="p-2 rounded-xl border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-ekami-gold-400 transition-colors"
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
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
