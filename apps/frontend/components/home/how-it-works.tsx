import { Upload, Gavel, Shield } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: 'Farmer Posts Crop',
      description: 'Upload photos/videos, set desired price, choose auction or fixed + bargaining mode.',
      details: [
        'Crop type, variety, grade & quality',
        'Quantity in quintals/tonnes',
        'Location with map coordinates',
        'Harvest date & storage details',
        'Moisture percentage & quality claims'
      ]
    },
    {
      icon: Gavel,
      title: 'Buyers Bargain or Bid',
      description: 'Make offers, counter-offers, or join live auctions with real-time bidding.',
      details: [
        'Direct bargaining with farmers',
        'Live auction participation',
        'Anti-sniping protection',
        'Bid history & transparency',
        'Reserve price validation'
      ]
    },
    {
      icon: Shield,
      title: 'Secure Escrow & Visit',
      description: '10% deposit secures the deal, on-site inspection, then finalize payment.',
      details: [
        '10% buyer deposit in escrow',
        'Schedule on-site inspection',
        'Quality verification & weighment',
        'Secure payment release',
        'Dispute protection if needed'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
            How OnlyFarmers.in Works
          </h2>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            A simple 3-step process that eliminates middlemen and connects farmers 
            directly with buyers for better prices and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              {/* Step Card */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-earth-100 hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-earth-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-earth-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step Details */}
                <div className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-earth-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-primary-200"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-earth-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-earth-600 mb-6">
              Join thousands of farmers and buyers who are already benefiting from 
              direct connections and better prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sell"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Start Selling as Farmer
              </a>
              <a
                href="/farmers"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-colors duration-200"
              >
                Browse Crops as Buyer
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
