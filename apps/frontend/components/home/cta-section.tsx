import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Farming Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of farmers and buyers who are already benefiting from direct connections, 
            better prices, and secure transactions. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 border-white"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                size="lg" 
                variant="ghost" 
                className="w-full sm:w-auto text-lg px-8 py-4 text-white hover:bg-primary-500"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-6">
              Need Help Getting Started?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-5 h-5" />
                <span className="text-lg">+91 1800-123-4567</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-5 h-5" />
                <span className="text-lg">support@onlyfarmers.in</span>
              </div>
            </div>
            <p className="text-primary-100 mt-4 text-sm">
              Our team is available 24/7 to help you get started and answer any questions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link href="/farmers" className="text-primary-100 hover:text-white transition-colors">
              Browse Crops
            </Link>
            <Link href="/auctions" className="text-primary-100 hover:text-white transition-colors">
              Live Auctions
            </Link>
            <Link href="/sell" className="text-primary-100 hover:text-white transition-colors">
              Sell Crops
            </Link>
            <Link href="/help" className="text-primary-100 hover:text-white transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
