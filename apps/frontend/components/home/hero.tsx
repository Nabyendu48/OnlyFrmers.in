'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';

export function Hero() {
  const stats = [
    { label: 'Active Farmers', value: '2,500+', icon: Users },
    { label: 'Successful Deals', value: '15,000+', icon: TrendingUp },
    { label: 'Secure Transactions', value: '₹50Cr+', icon: Shield },
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-harvest-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-earth-900 leading-tight">
                Direct-from-farm{' '}
                <span className="text-primary-600">marketplace</span>
              </h1>
              <p className="text-xl lg:text-2xl text-earth-600 leading-relaxed">
                Better prices for farmers. Better deals for buyers. 
                Connect directly through live auctions and bargaining.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-earth-700">
                Commission-free • Secure escrow • KYC verified • Live auctions
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sell">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    Create Listing
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/farmers">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                    Browse Crops
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-earth-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>10% Escrow Protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-600" />
                <span>KYC Verified</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-6 shadow-lg border border-earth-100 text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-earth-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-earth-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Auction Ticker */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-earth-100">
              <h3 className="text-lg font-semibold text-earth-900 mb-4">
                Live Auction Updates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-600">Wheat - Punjab</span>
                  <span className="font-medium text-primary-600">₹2,450/quintal</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-600">Rice - Haryana</span>
                  <span className="font-medium text-primary-600">₹1,850/quintal</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-earth-600">Cotton - Gujarat</span>
                  <span className="font-medium text-primary-600">₹6,200/quintal</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-earth-100">
                <Link href="/auctions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All Auctions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
