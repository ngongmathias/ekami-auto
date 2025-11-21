import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Star,
  Award,
  Phone,
  Mail,
  XCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Mechanic } from '../../types/repairs';
import toast from 'react-hot-toast';

export default function MechanicsManagement() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    years_experience: 0,
    certifications: [] as string[],
    photo_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMechanics(data || []);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      toast.error('Failed to load mechanics');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('mechanics')
        .insert({
          ...formData,
          rating: 0,
          total_reviews: 0,
        });

      if (error) throw error;

      toast.success('Mechanic added successfully');
      setShowAddModal(false);
      resetForm();
      fetchMechanics();
    } catch (error) {
      console.error('Error adding mechanic:', error);
      toast.error('Failed to add mechanic');
    }
  };

  const handleEdit = async () => {
    if (!selectedMechanic) return;

    try {
      const { error } = await supabase
        .from('mechanics')
        .update(formData)
        .eq('id', selectedMechanic.id);

      if (error) throw error;

      toast.success('Mechanic updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchMechanics();
    } catch (error) {
      console.error('Error updating mechanic:', error);
      toast.error('Failed to update mechanic');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mechanic?')) return;

    try {
      const { error } = await supabase
        .from('mechanics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Mechanic deleted successfully');
      fetchMechanics();
    } catch (error) {
      console.error('Error deleting mechanic:', error);
      toast.error('Failed to delete mechanic');
    }
  };

  const toggleActive = async (mechanic: Mechanic) => {
    try {
      const { error } = await supabase
        .from('mechanics')
        .update({ is_active: !mechanic.is_active })
        .eq('id', mechanic.id);

      if (error) throw error;

      toast.success(`Mechanic ${!mechanic.is_active ? 'activated' : 'deactivated'}`);
      fetchMechanics();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      years_experience: 0,
      certifications: [],
      photo_url: '',
      is_active: true,
    });
    setSelectedMechanic(null);
  };

  const openEditModal = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setFormData({
      name: mechanic.name,
      email: mechanic.email,
      phone: mechanic.phone,
      specialties: mechanic.specialties,
      years_experience: mechanic.years_experience,
      certifications: mechanic.certifications,
      photo_url: mechanic.photo_url || '',
      is_active: mechanic.is_active,
    });
    setShowEditModal(true);
  };

  const filteredMechanics = mechanics.filter(mechanic =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: mechanics.length,
    active: mechanics.filter(m => m.is_active).length,
    inactive: mechanics.filter(m => !m.is_active).length,
    avgExperience: mechanics.length > 0 
      ? Math.round(mechanics.reduce((sum, m) => sum + m.years_experience, 0) / mechanics.length)
      : 0,
  };

  const specialtyOptions = [
    'Engine Repair',
    'Transmission',
    'Brakes',
    'Electrical',
    'Air Conditioning',
    'Suspension',
    'Oil Change',
    'Tire Service',
    'Diagnostics',
    'Body Work',
  ];

  const certificationOptions = [
    'ASE Certified',
    'Master Technician',
    'Hybrid Specialist',
    'Diesel Specialist',
    'Electrical Systems',
    'Engine Performance',
    'Brake Systems',
    'HVAC Systems',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
            Mechanics Management
          </h2>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">
            Manage your team of mechanics
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Mechanic
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Total Mechanics</p>
              <p className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">{stats.total}</p>
            </div>
            <User className="w-8 h-8 text-ekami-gold-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">Avg Experience</p>
              <p className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">{stats.avgExperience} yrs</p>
            </div>
            <Award className="w-8 h-8 text-ekami-gold-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ekami-charcoal-400" />
          <input
            type="text"
            placeholder="Search mechanics by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-800 dark:text-white"
          />
        </div>
      </div>

      {/* Mechanics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMechanics.length === 0 ? (
        <div className="card text-center py-12">
          <Wrench className="w-16 h-16 text-ekami-charcoal-300 dark:text-ekami-charcoal-600 mx-auto mb-4" />
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400">No mechanics found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMechanics.map((mechanic) => (
            <motion.div
              key={mechanic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:shadow-lg transition-shadow"
            >
              {/* Photo */}
              <div className="relative mb-4">
                {mechanic.photo_url ? (
                  <img
                    src={mechanic.photo_url}
                    alt={mechanic.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 rounded-lg flex items-center justify-center">
                    <User className="w-20 h-20 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    mechanic.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {mechanic.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white">
                    {mechanic.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-ekami-charcoal-900 dark:text-white">
                      {mechanic.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                      ({mechanic.total_reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Mail className="w-4 h-4" />
                    {mechanic.email}
                  </div>
                  <div className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Phone className="w-4 h-4" />
                    {mechanic.phone}
                  </div>
                  <div className="flex items-center gap-2 text-ekami-charcoal-600 dark:text-ekami-silver-400">
                    <Award className="w-4 h-4" />
                    {mechanic.years_experience} years experience
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <p className="text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                    Specialties:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {mechanic.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-ekami-gold-100 dark:bg-ekami-gold-900/20 text-ekami-gold-800 dark:text-ekami-gold-200 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {mechanic.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
                      Certifications:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {mechanic.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-ekami-silver-200 dark:border-ekami-charcoal-700">
                  <button
                    onClick={() => toggleActive(mechanic)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      mechanic.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
                    }`}
                  >
                    {mechanic.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(mechanic)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mechanic.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-ekami-charcoal-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                    {showAddModal ? 'Add Mechanic' : 'Edit Mechanic'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="text-ekami-charcoal-400 hover:text-ekami-charcoal-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      min="0"
                    />
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Specialties (Select multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {specialtyOptions.map((specialty) => (
                        <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.specialties.includes(specialty)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, specialties: [...formData.specialties, specialty] });
                              } else {
                                setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== specialty) });
                              }
                            }}
                            className="rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
                          />
                          <span className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                            {specialty}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Certifications (Select multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {certificationOptions.map((cert) => (
                        <label key={cert} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.certifications.includes(cert)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, certifications: [...formData.certifications, cert] });
                              } else {
                                setFormData({ ...formData, certifications: formData.certifications.filter(c => c !== cert) });
                              }
                            }}
                            className="rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
                          />
                          <span className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                            {cert}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-sm font-medium text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-2">
                      Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      className="w-full px-4 py-2 border border-ekami-silver-200 dark:border-ekami-charcoal-700 rounded-lg focus:ring-2 focus:ring-ekami-gold-500 dark:bg-ekami-charcoal-900 dark:text-white"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-ekami-silver-300 text-ekami-gold-600 focus:ring-ekami-gold-500"
                    />
                    <label htmlFor="is_active" className="text-sm text-ekami-charcoal-700 dark:text-ekami-silver-300">
                      Active (Available for assignments)
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-silver-100 dark:hover:bg-ekami-charcoal-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showAddModal ? handleAdd : handleEdit}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="px-4 py-2 bg-ekami-gold-600 hover:bg-ekami-gold-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showAddModal ? 'Add Mechanic' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
