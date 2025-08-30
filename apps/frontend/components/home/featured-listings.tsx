'use client';

import Link from 'next/link';
import { MapPin, Clock, Gavel, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function FeaturedListings() {
  const featuredListings = [
    {
      id: '1',
      title: 'Premium Wheat - Sharbati Variety',
      crop: 'Wheat',
      variety: 'Sharbati',
      quantity: 50,
      unit: 'quintal',
      location: 'Punjab, India',
      desiredPrice: 2500,
      minPrice: 2200,
      image: '/api/placeholder/400/300',
      farmer: 'Rajinder Singh',
      rating: 4.8,
      reviews: 127,
      auctionEnds: '2024-02-15T18:00:00Z',
      isAuction: true,
      currentBid: 2350,
      totalBids: 23,
    },
    {
      id: '2',
      title: 'Organic Basmati Rice - 1121',
      crop: 'Rice',
      variety: 'Basmati 1121',
      quantity: 25,
      unit: 'quintal',
      location: 'Haryana, India',
      desiredPrice: 3200,
      minPrice: 2800,
      image: '/api/placeholder/400/300',
      farmer: 'Sukhwinder Kaur',
      rating: 4.9,
      reviews: 89,
      auctionEnds: null,
      isAuction: false,
      currentBid: null,
      totalBids: null,
    },
    {
      id: '3',
      title: 'Premium Cotton - Bt Variety',
      crop: 'Cotton',
      variety: 'Bt Cotton',
      quantity: 100,
      unit: 'quintal',
      location: 'Gujarat, India',
      desiredPrice: 6500,
      minPrice: 5800,
      image: '/api/placeholder/400/300',
      farmer: 'Patel Farms',
      rating: 4.7,
      reviews: 203,
      auctionEnds: '2024-02-20T20:00:00Z',
      isAuction: true,
      currentBid: 6200,
      totalBids: 45,
    },
  ];

  return (
    <section className="py-20 bg-earth-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-earth-900 mb-4">
            Featured Crop Listings
          </h2>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            Discover quality crops from verified farmers across India. 
            Browse through our featured listings or explore all available crops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl shadow-lg border border-earth-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-earth-100">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.isAuction && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-harvest-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Live Auction
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {listing.crop}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-earth-900 mb-2">
                    {listing.title}
                  </h3>
                  <p className="text-earth-600 text-sm mb-3">
                    {listing.quantity} {listing.unit} • {listing.variety}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center text-earth-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.location}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(listing.rating)
                              ? 'text-harvest-400 fill-current'
                              : 'text-earth-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-earth-600 ml-2">
                      {listing.rating} ({listing.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-earth-600">Desired Price:</span>
                    <span className="font-semibold text-lg text-earth-900">
                      {formatCurrency(listing.desiredPrice)}/{listing.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-earth-600">Min Acceptable:</span>
                    <span className="text-sm text-earth-700">
                      {formatCurrency(listing.minPrice)}/{listing.unit}
                    </span>
                  </div>
                </div>

                {/* Auction Info or Bargain */}
                {listing.isAuction ? (
                  <div className="mb-4 p-3 bg-harvest-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-harvest-800">Current Bid:</span>
                      <span className="text-lg font-bold text-harvest-900">
                        {formatCurrency(listing.currentBid)}/{listing.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-harvest-700">
                      <span>{listing.totalBids} bids</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Ends {new Date(listing.auctionEnds!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center text-primary-700">
                      <Gavel className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Open for Bargaining</span>
                    </div>
                  </div>
                )}

                {/* Farmer Info */}
                <div className="mb-4 p-3 bg-earth-50 rounded-lg">
                  <p className="text-sm text-earth-700">
                    <span className="font-medium">Farmer:</span> {listing.farmer}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href={`/listing/${listing.id}`}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center block"
                  >
                    {listing.isAuction ? 'Join Auction' : 'Make Offer'}
                  </Link>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="w-full border border-earth-300 text-earth-700 font-medium py-2 px-4 rounded-lg hover:bg-earth-50 transition-colors duration-200 text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/farmers"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
}
