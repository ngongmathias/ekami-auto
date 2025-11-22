import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Clock, Shield, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ServicePackageCard from '../components/repairs/ServicePackageCard';
import type { ServicePackage } from '../types/repairs';
import toast from 'react-hot-toast';

export default function RepairsPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchServicePackages();
  }, []);

  const fetchServicePackages = async () => {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching service packages:', error);
      toast.error('Failed to load service packages');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(packages.map(p => p.category)))];

  const filteredPackages = selectedCategory === 'All'
    ? packages
    : packages.filter(p => p.category === selectedCategory);

  const handleSelectPackage = (pkg: ServicePackage) => {
    navigate('/repairs/request', { state: { selectedPackage: pkg } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      {/* Service Packages */}
      <section id="packages" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
              Our Service Packages
            </h2>
            <p className="text-base text-ekami-charcoal-600 dark:text-ekami-silver-400 max-w-2xl mx-auto mb-6">
              Professional maintenance and repairs by certified mechanics
            </p>

            {/* Quick Features */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-ekami-charcoal-700 dark:text-ekami-silver-300">
                <Shield className="w-4 h-4 text-ekami-gold-600" />
                <span>Certified Mechanics</span>
              </div>
              <div className="flex items-center gap-2 text-ekami-charcoal-700 dark:text-ekami-silver-300">
                <Clock className="w-4 h-4 text-ekami-gold-600" />
                <span>Fast Service</span>
              </div>
              <div className="flex items-center gap-2 text-ekami-charcoal-700 dark:text-ekami-silver-300">
                <CheckCircle className="w-4 h-4 text-ekami-gold-600" />
                <span>Quality Parts</span>
              </div>
              <div className="flex items-center gap-2 text-ekami-charcoal-700 dark:text-ekami-silver-300">
                <Star className="w-4 h-4 text-ekami-gold-600" />
                <span>Warranty Included</span>
              </div>
            </div>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-ekami-gold-600 text-white shadow-lg'
                    : 'bg-white dark:bg-ekami-charcoal-800 text-ekami-charcoal-700 dark:text-ekami-silver-300 hover:bg-ekami-gold-100 dark:hover:bg-ekami-charcoal-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Packages Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ekami-gold-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => (
                <ServicePackageCard
                  key={pkg.id}
                  package={pkg}
                  onSelect={handleSelectPackage}
                />
              ))}
            </div>
          )}

          {/* Custom Service CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-ekami-gold-500 to-ekami-gold-600 rounded-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Need a Custom Service?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Request a custom quote and our team will create a tailored service plan for your vehicle.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/repairs/request')}
              className="bg-white text-ekami-gold-600 font-semibold px-8 py-3 rounded-lg hover:bg-ekami-silver-100 transition-all duration-300"
            >
              Request Custom Quote
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-ekami-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center text-ekami-charcoal-900 dark:text-white mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Emmanuel Tabi',
                service: 'Engine Diagnostics',
                rating: 5,
                comment: 'Excellent service! They quickly identified the issue and fixed it at a fair price.'
              },
              {
                name: 'Grace Nkeng',
                service: 'Brake Service',
                rating: 5,
                comment: 'Professional team and great communication. My brakes feel brand new!'
              },
              {
                name: 'Patrick Fon',
                service: 'Full Inspection',
                rating: 5,
                comment: 'Very thorough inspection with detailed report. Highly recommend!'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-ekami-silver-50 dark:bg-ekami-charcoal-700 p-6 rounded-xl"
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-ekami-gold-500 text-ekami-gold-500" />
                  ))}
                </div>
                <p className="text-ekami-charcoal-700 dark:text-ekami-silver-300 mb-4">
                  "{testimonial.comment}"
                </p>
                <div>
                  <p className="font-semibold text-ekami-charcoal-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-ekami-charcoal-500 dark:text-ekami-silver-500">
                    {testimonial.service}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white dark:bg-ekami-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
              Why Choose Ekami Auto?
            </h2>
            <p className="text-lg text-ekami-charcoal-600 dark:text-ekami-silver-400">
              Quality service you can trust
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Certified Mechanics',
                description: 'ASE-certified technicians with years of experience'
              },
              {
                icon: Clock,
                title: 'Fast Service',
                description: 'Quick turnaround without compromising quality'
              },
              {
                icon: CheckCircle,
                title: 'Quality Parts',
                description: 'Only genuine and high-quality replacement parts'
              },
              {
                icon: Star,
                title: 'Satisfaction Guaranteed',
                description: 'Warranty on all repairs and services'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-ekami-gold-600" />
                </div>
                <h3 className="text-lg font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
