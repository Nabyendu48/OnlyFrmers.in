import { Shield, Users, Award, Clock, CheckCircle, Star } from 'lucide-react';

export function TrustSignals() {
  const trustFeatures = [
    {
      icon: Shield,
      title: '10% Escrow Protection',
      description: 'Secure buyer deposits held until quality verification and handover completion.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      title: 'KYC Verified Users',
      description: 'All farmers and buyers undergo identity verification for platform safety.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'On-site inspection, moisture testing, and weighment verification.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for dispute resolution and assistance.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const testimonials = [
    {
      name: 'Rajinder Singh',
      role: 'Farmer, Punjab',
      content: 'OnlyFarmers.in helped me get 15% better prices than local mandis. The escrow system gives me confidence.',
      rating: 5,
    },
    {
      name: 'Amit Patel',
      role: 'Buyer, Mumbai',
      content: 'Direct connection with farmers means fresher produce and better prices. KYC verification adds trust.',
      rating: 5,
    },
    {
      name: 'Sukhwinder Kaur',
      role: 'Farmer, Haryana',
      content: 'Live auctions are transparent and fair. No more middlemen taking cuts from my hard work.',
      rating: 5,
    },
  ];

  const stats = [
    { label: 'Active Users', value: '25,000+' },
    { label: 'Successful Transactions', value: '50,000+' },
    { label: 'Total Value Traded', value: '₹500Cr+' },
    { label: 'Average Rating', value: '4.8/5' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
            Why Trust OnlyFarmers.in?
          </h2>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            We've built a secure, transparent marketplace that protects both farmers and buyers 
            through multiple layers of verification and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustFeatures.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-earth-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-earth-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-primary-50 rounded-2xl p-8 mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-earth-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-16">
          <h3 className="text-2xl lg:text-3xl font-bold text-earth-900 mb-4">
            What Our Users Say
          </h3>
          <p className="text-lg text-earth-600 max-w-2xl mx-auto">
            Real feedback from farmers and buyers who have transformed their trading experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl p-6 shadow-lg border border-earth-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-harvest-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-earth-700 mb-4 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-earth-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-earth-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div className="mt-16 text-center">
          <div className="bg-earth-50 rounded-xl p-8">
            <h4 className="text-lg font-semibold text-earth-900 mb-4">
              Security & Compliance
            </h4>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-earth-700">SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-earth-700">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-earth-700">PCI DSS Level 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-earth-700">ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
