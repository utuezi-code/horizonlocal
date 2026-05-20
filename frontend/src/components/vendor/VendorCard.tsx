import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Package } from 'lucide-react';
import { Vendor } from '@/types';

interface VendorCardProps {
  vendor: Vendor;
  productCount?: number;
}

export function VendorCard({ vendor, productCount }: VendorCardProps) {
  return (
    <Link
      href={`/stores/${vendor.store_slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-r from-[#1c61e7] to-[#1648b0] overflow-hidden">
        {vendor.banner_url && (
          <Image
            src={vendor.banner_url}
            alt={`Bannière ${vendor.store_name}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}
      </div>

      {/* Logo */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
          {vendor.logo_url ? (
            <Image
              src={vendor.logo_url}
              alt={`Logo ${vendor.store_name}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full bg-[#eff6ff] flex items-center justify-center">
              <span className="text-xl font-bold text-[#1c61e7]">
                {vendor.store_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-10">
          <h3 className="font-bold text-gray-900 group-hover:text-[#1c61e7] transition-colors">
            {vendor.store_name}
          </h3>
          {vendor.city && vendor.province && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{vendor.city}, {vendor.province}</span>
            </div>
          )}
          {vendor.description && (
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">{vendor.description}</p>
          )}
          {productCount !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Package className="h-3 w-3" />
              <span>{productCount} produit{productCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
