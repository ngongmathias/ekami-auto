import { motion } from 'framer-motion';
import { Car, Shield, Award, Users, Heart, Target, TrendingUp, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-ekami-silver-50 to-white dark:from-ekami-charcoal-900 dark:to-ekami-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            About Ekami Auto
          </h1>
          <p className="text-xl text-ekami-charcoal-600 dark:text-ekami-silver-300 max-w-3xl mx-auto">
            Your trusted partner for premium car rentals and sales in Cameroon
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 rounded-xl">
                <Target className="w-6 h-6 text-ekami-gold-600" />
              </div>
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                Our Mission
              </h2>
            </div>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed">
              To provide exceptional car rental and sales services that exceed customer expectations, 
              making quality vehicles accessible and affordable for everyone in Cameroon. We strive 
              to deliver convenience, reliability, and outstanding customer service in every interaction.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white">
                Our Vision
              </h2>
            </div>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed">
              To become Cameroon's leading automotive service provider, recognized for innovation, 
              quality, and customer satisfaction. We envision a future where every Cameroonian has 
              access to reliable transportation solutions that enhance their mobility and lifestyle.
            </p>
          </motion.div>
        </div>

        {/* Company Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-16"
        >
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white mb-6">
            Our Story
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed mb-4">
              Founded in Yaoundé, Ekami Auto was born from a simple vision: to revolutionize the car 
              rental and sales experience in Cameroon. We recognized the need for a reliable, transparent, 
              and customer-focused automotive service provider that could meet the diverse needs of both 
              individuals and businesses.
            </p>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed mb-4">
              Starting with a small fleet of well-maintained vehicles, we've grown into a trusted name 
              in the industry. Our success is built on three pillars: quality vehicles, exceptional 
              service, and competitive pricing. Every car in our fleet is carefully selected, thoroughly 
              inspected, and maintained to the highest standards.
            </p>
            <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 leading-relaxed">
              Today, we serve customers across Cameroon, from Yaoundé to Douala, Bamenda to Bafoussam, 
              and beyond. Our commitment to innovation has led us to develop cutting-edge digital 
              solutions, making it easier than ever to rent or buy your perfect vehicle.
            </p>
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Trust & Reliability',
                description: 'We build lasting relationships through transparency and dependability',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We maintain the highest standards in every aspect of our service',
                color: 'from-ekami-gold-500 to-ekami-gold-600'
              },
              {
                icon: Heart,
                title: 'Customer First',
                description: 'Your satisfaction and safety are our top priorities',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: Users,
                title: 'Community',
                description: 'We\'re committed to serving and supporting our local community',
                color: 'from-green-500 to-green-600'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="card text-center group hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ekami-charcoal-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card mb-16"
        >
          <h2 className="text-3xl font-bold text-ekami-charcoal-900 dark:text-white mb-8">
            Why Choose Ekami Auto?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Wide selection of quality vehicles',
              'Competitive and transparent pricing',
              'Flexible rental and purchase options',
              'Professional maintenance and inspection',
              '24/7 customer support',
              'Convenient delivery across Cameroon',
              'Comprehensive insurance coverage',
              'Easy online booking and payment',
              'Loyalty rewards program',
              'No hidden fees or surprises'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-ekami-charcoal-700 dark:text-ekami-silver-300">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="card text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ekami-gold-100 dark:bg-ekami-gold-900/30 rounded-2xl mb-4">
            <Car className="w-8 h-8 text-ekami-gold-600" />
          </div>
          <h2 className="text-2xl font-bold text-ekami-charcoal-900 dark:text-white mb-4">
            Visit Us
          </h2>
          <p className="text-lg text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-2">
            <strong>Headquarters:</strong> Yaoundé, Cameroon
          </p>
          <p className="text-ekami-charcoal-600 dark:text-ekami-silver-400 mb-6">
            We serve customers across all major cities in Cameroon
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="btn-primary"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/237652765281"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
