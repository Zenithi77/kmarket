'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shirt, Footprints, Wind, TrendingUp, Award, Package, Tag, Truck, Star, LucideIcon } from 'lucide-react';

// Cloudinary on-the-fly transform: tiny + auto format/quality, bypasses /_next/image
function cdnIcon(url: string | undefined, size: number): string | undefined {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,w_${size},h_${size}/`);
  }
  return url;
}

const isCloudinary = (url?: string) => !!url && url.includes('res.cloudinary.com');

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

interface CategorySliderProps {
  categories?: CategoryItem[];
}

// Slug-based icon & color mapping (Korean shop style — soft pastel)
const SLUG_MAP: Record<string, { icon: LucideIcon; bg: string; iconColor: string }> = {
  beauty:   { icon: Sparkles,   bg: 'bg-pink-50',    iconColor: 'text-pink-500' },
  fashion:  { icon: Shirt,      bg: 'bg-purple-50',  iconColor: 'text-purple-500' },
  shoes:    { icon: Footprints, bg: 'bg-blue-50',    iconColor: 'text-blue-500' },
  dyson:    { icon: Wind,       bg: 'bg-cyan-50',    iconColor: 'text-cyan-500' },
  trendy:   { icon: TrendingUp, bg: 'bg-rose-50',    iconColor: 'text-rose-500' },
  best:     { icon: Award,      bg: 'bg-amber-50',   iconColor: 'text-amber-500' },
  sale:     { icon: Tag,        bg: 'bg-red-50',     iconColor: 'text-red-500' },
  new:      { icon: Star,       bg: 'bg-green-50',   iconColor: 'text-green-500' },
  delivery: { icon: Truck,      bg: 'bg-indigo-50',  iconColor: 'text-indigo-500' },
};

const FALLBACK_CONFIGS = [
  { bg: 'bg-orange-50',  iconColor: 'text-orange-500' },
  { bg: 'bg-teal-50',    iconColor: 'text-teal-500' },
  { bg: 'bg-violet-50',  iconColor: 'text-violet-500' },
  { bg: 'bg-lime-50',    iconColor: 'text-lime-600' },
  { bg: 'bg-sky-50',     iconColor: 'text-sky-500' },
  { bg: 'bg-fuchsia-50', iconColor: 'text-fuchsia-500' },
];

export default function CategorySlider({ categories }: CategorySliderProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* ── MOBILE: Coupang-style 3-col grid (2 rows max = 6 items) ── */}
        <div className="md:hidden grid grid-cols-3 gap-y-5 gap-x-2 px-3 py-5">
          {categories.slice(0, 6).map((category, index) => {
            const slugKey = category.slug?.split('-')[0]?.toLowerCase() || '';
            const config = SLUG_MAP[slugKey] || FALLBACK_CONFIGS[index % FALLBACK_CONFIGS.length];
            const IconComponent = (config as any).icon || Package;
            const initial = category.name.charAt(0).toUpperCase();

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2.5 group active:opacity-70"
              >
                <div
                  className={`w-20 h-20 rounded-3xl ${config.bg} flex items-center justify-center group-active:scale-95 transition-transform duration-150 overflow-hidden shadow-sm`}
                >
                  {category.image ? (
                    <Image
                      src={cdnIcon(category.image, 160)!}
                      alt={category.name}
                      width={80}
                      height={80}
                      sizes="80px"
                      priority={index < 6}
                      unoptimized={isCloudinary(category.image)}
                      className="w-full h-full object-cover"
                    />
                  ) : (config as any).icon ? (
                    <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
                  ) : (
                    <span className={`text-3xl font-bold ${config.iconColor}`}>{initial}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight line-clamp-1">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── DESKTOP: small horizontal row (search-bar adjunct, max 8) ── */}
        <div className="hidden md:flex items-center justify-center gap-6 px-4 py-3">
          {categories.slice(0, 8).map((category, index) => {
            const slugKey = category.slug?.split('-')[0]?.toLowerCase() || '';
            const config = SLUG_MAP[slugKey] || FALLBACK_CONFIGS[index % FALLBACK_CONFIGS.length];
            const IconComponent = (config as any).icon || Package;
            const initial = category.name.charAt(0).toUpperCase();

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-1.5 group min-w-0"
              >
                <div
                  className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 overflow-hidden`}
                >
                  {category.image ? (
                    <Image
                      src={cdnIcon(category.image, 96)!}
                      alt={category.name}
                      width={48}
                      height={48}
                      sizes="48px"
                      unoptimized={isCloudinary(category.image)}
                      className="w-full h-full object-cover"
                    />
                  ) : (config as any).icon ? (
                    <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                  ) : (
                    <span className={`text-base font-bold ${config.iconColor}`}>{initial}</span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-orange-500 transition-colors whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
