import { useState } from 'react';
import { 
  Wrench, 
  DollarSign, 
  Fuel, 
  Calculator, 
  Shield,
  FileText,
  Bell,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import MaintenanceReminder from '../components/tools/MaintenanceReminder';
import CarValueCalculator from '../components/tools/CarValueCalculator';

type ToolType = 'home' | 'maintenance' | 'value' | 'fuel' | 'loan' | 'insurance';

export default function CarToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType>('home');

  const tools = [
    {
      id: 'maintenance' as ToolType,
      name: 'Maintenance Reminders',
      description: 'Never miss oil changes, tire rotations, or inspections',
      icon: Bell,
      color: 'from-blue-500 to-blue-600',
      features: ['Track service history', 'Get timely alerts', 'Save maintenance records']
    },
    {
      id: 'value' as ToolType,
      name: 'Car Value Calculator',
      description: 'Estimate your car\'s current market value',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      features: ['Instant valuation', 'Market trends', 'Trade-in estimates']
    },
    {
      id: 'fuel' as ToolType,
      name: 'Fuel Cost Calculator',
      description: 'Calculate trip costs and fuel efficiency',
      icon: Fuel,
      color: 'from-orange-500 to-orange-600',
      features: ['Trip cost estimates', 'Fuel efficiency', 'Cost comparisons']
    },
    {
      id: 'loan' as ToolType,
      name: 'Car Loan Calculator',
      description: 'Calculate monthly payments and total interest',
      icon: Calculator,
      color: 'from-purple-500 to-purple-600',
      features: ['Monthly payments', 'Interest breakdown', 'Amortization schedule']
    },
    {
      id: 'insurance' as ToolType,
      name: 'Insurance Estimator',
      description: 'Estimate insurance costs for your vehicle',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      features: ['Coverage options', 'Premium estimates', 'Compare plans']
    },
  ];

  const renderTool = () => {
    switch (activeTool) {
      case 'maintenance':
        return <MaintenanceReminder />;
      case 'value':
        return <CarValueCalculator />;
      case 'fuel':
        return <ComingSoonTool name="Fuel Cost Calculator" />;
      case 'loan':
        return <ComingSoonTool name="Car Loan Calculator" />;
      case 'insurance':
        return <ComingSoonTool name="Insurance Estimator" />;
      default:
        return <ToolsHome tools={tools} onSelectTool={setActiveTool} />;
    }
  };

  if (activeTool !== 'home') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-ekami-charcoal-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setActiveTool('home')}
            className="mb-6 px-4 py-2 bg-white dark:bg-ekami-charcoal-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-ekami-charcoal-700 transition-colors"
          >
            ← Back to Tools
          </button>
          {renderTool()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ekami-charcoal-900 py-12">
      {renderTool()}
    </div>
  );
}

function ToolsHome({ tools, onSelectTool }: { 
  tools: any[]; 
  onSelectTool: (tool: ToolType) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 rounded-2xl flex items-center justify-center">
            <Wrench className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Car Tools & Calculators
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Your complete automotive toolkit - maintenance tracking, value estimation, cost calculators, and more
        </motion.p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectTool(tool.id)}
            className="bg-white dark:bg-ekami-charcoal-800 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
            <div className="p-6">
              <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {tool.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {tool.description}
              </p>
              <ul className="space-y-2">
                {tool.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-ekami-gold-500 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-ekami-gold-500 font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                  Open Tool
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-ekami-gold-500 to-ekami-gold-600 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Why Use Our Car Tools?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Save Money</h3>
              <p className="text-white/90 text-sm">
                Track maintenance, avoid costly repairs, and make informed decisions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Stay Organized</h3>
              <p className="text-white/90 text-sm">
                Keep all your car information and records in one place
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Never Miss</h3>
              <p className="text-white/90 text-sm">
                Get timely reminders for maintenance and important deadlines
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonTool({ name }: { name: string }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-ekami-charcoal-800 rounded-lg p-12 shadow-lg text-center">
        <div className="w-20 h-20 bg-ekami-gold-100 dark:bg-ekami-gold-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-ekami-gold-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {name}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Coming Soon!
        </p>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          We're working hard to bring you this tool. Check back soon for updates!
        </p>
      </div>
    </div>
  );
}
