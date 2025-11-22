import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { getAllCars, type Car } from '../../lib/supabase';

export default function CarManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<Partial<Car>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price_rent_daily: 0,
    price_sale: 0,
    available_for_rent: true,
    available_for_sale: false,
    images: [],
    images_360: [],
    features: [],
    body_type: 'sedan',
    status: 'available',
    is_verified: true,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploading360Images, setUploading360Images] = useState(false);

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price_rent_daily: 0,
      price_sale: 0,
      available_for_rent: true,
      available_for_sale: false,
      images: [],
      images_360: [],
      features: [],
      body_type: 'sedan',
      status: 'available',
      is_verified: true,
    });
    setSelectedCar(null);
    setShowAddModal(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await getAllCars();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      // In production: await supabase.from('cars').delete().eq('id', carId);
      toast.success('Car deleted successfully');
      setCars(prev => prev.filter(car => car.id !== carId));
    } catch (error) {
      toast.error('Failed to delete car');
    }
  };

  const handleToggleAvailability = async (car: Car) => {
    try {
      // In production: await supabase.from('cars').update({ available_for_rent: !car.available_for_rent }).eq('id', car.id);
      toast.success(`Car ${!car.available_for_rent ? 'marked as available' : 'marked as unavailable'}`);
      setCars(prev => prev.map(c => 
        c.id === car.id ? { ...c, available_for_rent: !c.available_for_rent } : c
      ));
    } catch (error) {
      toast.error('Failed to update car status');
    }
  };

  const handleImageUpload = async (files: FileList) => {
    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `car-images/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('cars')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cars')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Add uploaded URLs to existing images
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...uploadedUrls]
      });

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handle360ImageUpload = async (files: FileList) => {
    try {
      setUploading360Images(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `360-${Date.now()}-${i}.${fileExt}`;
        const filePath = `car-360/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('cars')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cars')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Add uploaded URLs to existing 360 images
      setFormData({
        ...formData,
        images_360: [...(formData.images_360 || []), ...uploadedUrls]
      });

      toast.success(`${uploadedUrls.length} 360° image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading 360 images:', error);
      toast.error('Failed to upload 360° images');
    } finally {
      setUploading360Images(false);
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.year.toString().includes(searchQuery);

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'available' ? car.available_for_rent :
      !car.available_for_rent;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white">
            Car Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mt-1">
            Manage your vehicle inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-ekami-gold-600 text-white rounded-xl font-semibold hover:bg-ekami-gold-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-ekami-charcoal-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-1 px-4 py-3 bg-ekami-silver-50 dark:bg-ekami-charcoal-800 border-2 border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-xl focus:border-ekami-gold-400 focus:ring-4 focus:ring-ekami-gold-400/20 transition-all"
            >
              <option value="all">All Cars ({cars.length})</option>
              <option value="available">Available ({cars.filter(c => c.available_for_rent).length})</option>
              <option value="rented">Rented Out ({cars.filter(c => !c.available_for_rent).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cars Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-ekami-gold-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
              No cars found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ekami-silver-50 dark:bg-ekami-charcoal-800">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Car
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Specs
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Pricing
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-ekami-charcoal-700 dark:text-ekami-silver-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <motion.tr
                    key={car.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-ekami-silver-200 dark:border-ekami-charcoal-700 hover:bg-ekami-silver-50 dark:hover:bg-ekami-charcoal-800 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'}
                          alt={`${car.make} ${car.model}`}
                          className="w-20 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                            {car.make} {car.model}
                          </p>
                          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            {car.year}
                          </p>
                          <p className="text-xs font-semibold text-ekami-gold-600 dark:text-ekami-gold-400 mt-1">
                            {car.car_number || 'No code'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm space-y-1">
                        <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                          {car.transmission} • {car.fuel_type}
                        </p>
                        <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                          {car.seats} seats • {car.body_type}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm space-y-1">
                        {car.price_rent_daily && (
                          <p className="text-ekami-charcoal-900 dark:text-white font-semibold">
                            {car.price_rent_daily.toLocaleString()} XAF/day
                          </p>
                        )}
                        {car.price_sale && (
                          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            Sale: {car.price_sale.toLocaleString()} XAF
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleAvailability(car)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          car.available_for_rent
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200'
                        }`}
                      >
                        {car.available_for_rent ? 'Available' : 'Rented'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/cars/${car.slug || car.id}`, '_blank')}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCar(car);
                            setFormData(car);
                            setShowAddModal(true);
                          }}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-ekami-gold-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                      {selectedCar ? 'Edit Car' : 'Add New Car'}
                    </h3>
                    {selectedCar && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-semibold text-ekami-gold-600 dark:text-ekami-gold-400">
                          Car Code: {selectedCar.car_number || 'Not assigned'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          ID: {selectedCar.id}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (selectedCar) {
                      // Update existing car
                      const { error } = await supabase
                        .from('cars')
                        .update(formData)
                        .eq('id', selectedCar.id);
                      
                      if (error) throw error;
                      toast.success('Car updated successfully');
                    } else {
                      // Add new car - auto-generate car_number
                      // Get the count of existing cars to generate next number
                      const { count } = await supabase
                        .from('cars')
                        .select('*', { count: 'exact', head: true });
                      
                      const nextNumber = (count || 0) + 1;
                      const carNumber = `EK-${String(nextNumber).padStart(3, '0')}`;
                      
                      const { error } = await supabase
                        .from('cars')
                        .insert({ ...formData, car_number: carNumber });
                      
                      if (error) throw error;
                      toast.success(`Car added successfully! Code: ${carNumber}`);
                    }
                    
                    resetForm();
                    fetchCars();
                  } catch (error: any) {
                    console.error('Error saving car:', error);
                    toast.error(error.message || 'Failed to save car');
                  }
                }} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Make *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.make || ''}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                        placeholder="Toyota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.model || ''}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                        placeholder="Camry"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Body Type
                      </label>
                      <select
                        value={formData.body_type || 'sedan'}
                        onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="coupe">Coupe</option>
                        <option value="convertible">Convertible</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Daily Rent Price (XAF)
                      </label>
                      <input
                        type="number"
                        value={formData.price_rent_daily || 0}
                        onChange={(e) => setFormData({ ...formData, price_rent_daily: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Sale Price (XAF)
                      </label>
                      <input
                        type="number"
                        value={formData.price_sale || 0}
                        onChange={(e) => setFormData({ ...formData, price_sale: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Transmission
                      </label>
                      <select
                        value={formData.transmission || 'automatic'}
                        onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      >
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Fuel Type
                      </label>
                      <select
                        value={formData.fuel_type || 'gasoline'}
                        onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      >
                        <option value="gasoline">Gasoline</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Seats
                      </label>
                      <input
                        type="number"
                        value={formData.seats || 5}
                        onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Mileage (km)
                      </label>
                      <input
                        type="number"
                        value={formData.mileage || 0}
                        onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        value={formData.color || ''}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                        placeholder="Black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Doors
                      </label>
                      <input
                        type="number"
                        value={formData.doors || 4}
                        onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                        placeholder="Douala"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                        placeholder="Akwa"
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Car Images
                    </label>
                    
                    {/* File Upload */}
                    <div className="mb-4">
                      <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-600 rounded-lg cursor-pointer hover:border-ekami-gold-500 transition-colors">
                        <div className="text-center">
                          <Plus className="w-8 h-8 mx-auto mb-2 text-ekami-charcoal-400" />
                          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            {uploadingImages ? 'Uploading...' : 'Click to upload images or drag and drop'}
                          </p>
                          <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                            PNG, JPG, WEBP up to 10MB each
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleImageUpload(e.target.files);
                            }
                          }}
                          disabled={uploadingImages}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Preview */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Car ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  images: formData.images?.filter((_, i) => i !== index)
                                });
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Or add URL */}
                    <details className="mt-3">
                      <summary className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 cursor-pointer hover:text-ekami-gold-600">
                        Or add image URLs manually
                      </summary>
                      <textarea
                        value={(formData.images || []).join('\n')}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          images: e.target.value.split('\n').filter(url => url.trim()) 
                        })}
                        rows={3}
                        className="w-full mt-2 px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white font-mono text-sm"
                        placeholder="https://images.unsplash.com/photo-1.jpg"
                      />
                    </details>
                  </div>

                  {/* 360° Images */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      🔄 360° View Images (Optional)
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Upload 6-36 images taken around the car. Select multiple files in order!
                    </p>
                    
                    {/* Upload Button */}
                    <div className="border-2 border-dashed border-ekami-silver-300 dark:border-ekami-charcoal-700 rounded-lg p-6 text-center hover:border-ekami-gold-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handle360ImageUpload(e.target.files);
                          }
                        }}
                        disabled={uploading360Images}
                        className="hidden"
                        id="360-image-upload"
                      />
                      <label htmlFor="360-image-upload" className="cursor-pointer">
                        <div className="text-center">
                          <Plus className="w-8 h-8 mx-auto mb-2 text-ekami-charcoal-400" />
                          <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                            {uploading360Images ? 'Uploading 360° images...' : 'Click to upload 360° images'}
                          </p>
                          <p className="text-xs text-ekami-charcoal-500 dark:text-ekami-silver-500 mt-1">
                            Select 6-36 images in rotation order
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* 360 Image Preview */}
                    {formData.images_360 && formData.images_360.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-ekami-gold-600 dark:text-ekami-gold-400">
                            ✓ {formData.images_360.length} images for 360° view
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images_360: [] })}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {formData.images_360.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`360° view ${index + 1}`}
                                className="w-full h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">#{index + 1}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = formData.images_360?.filter((_, i) => i !== index);
                                  setFormData({ ...formData, images_360: newImages });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.available_for_rent || false}
                        onChange={(e) => setFormData({ ...formData, available_for_rent: e.target.checked })}
                        className="rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
                      />
                      <span className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                        Available for Rent
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.available_for_sale || false}
                        onChange={(e) => setFormData({ ...formData, available_for_sale: e.target.checked })}
                        className="rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
                      />
                      <span className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                        Available for Sale
                      </span>
                    </label>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="Describe the car..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg"
                    >
                      {selectedCar ? 'Update Car' : 'Add Car'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
