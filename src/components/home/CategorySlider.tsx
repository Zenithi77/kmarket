'use client';

import Link from 'next/link';
import { Sparkles, Shirt, Footprints, Wind, TrendingUp, Award, Package, Tag, Truck, Star, LucideIcon } from 'lucide-react';

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

// Slug-based icon & color mapping
const SLUG_MAP: Record<string, { icon: LucideIcon; bg: string; iconColor: string; ring: string }> = {
  beauty:   { icon: Sparkles,   bg: 'bg-pink-100',   iconColor: 'text-pink-500',   ring: 'ring-pink-200' },
  fashion:  { icon: Shirt,      bg: 'bg-purple-100', iconColor: 'text-purple-500', ring: 'ring-purple-200' },
  shoes:    { icon: Footprints, bg: 'bg-blue-100',   iconColor: 'text-blue-500',   ring: 'ring-blue-200' },
  dyson:    { icon: Wind,       bg: 'bg-cyan-100',   iconColor: 'text-cyan-500',   ring: 'ring-cyan-200' },
  trendy:   { icon: TrendingUp, bg: 'bg-rose-100',   iconColor: 'text-rose-500',   ring: 'ring-rose-200' },
  best:     { icon: Award,      bg: 'bg-amber-100',  iconColor: 'text-amber-500',  ring: 'ring-amber-200' },
  sale:     { icon: Tag,        bg: 'bg-red-100',    iconColor: 'text-red-500',    ring: 'ring-red-200' },
  new:      { icon: Star,       bg: 'bg-green-100',  iconColor: 'text-green-500',  ring: 'ring-green-200' },
  delivery: { icon: Truck,      bg: 'bg-indigo-100', iconColor: 'text-indigo-500', ring: 'ring-indigo-200' },
};

const FALLBACK_CONFIGS = [
  { bg: 'bg-orange-100', iconColor: 'text-orange-500', ring: 'ring-orange-200' },
  { bg: 'bg-teal-100',   iconColor: 'text-teal-500',   ring: 'ring-teal-200' },
  { bg: 'bg-violet-100', iconColor: 'text-violet-500', ring: 'ring-violet-200' },
  { bg: 'bg-lime-100',   iconColor: 'text-lime-600',   ring: 'ring-lime-200' },
  { bg: 'bg-sky-100',    iconColor: 'text-sky-500',    ring: 'ring-sky-200' },
  { bg: 'bg-fuchsia-100',iconColor: 'text-fuchsia-500',ring: 'ring-fuchsia-200' },
];

export default function CategorySlider({ categories }: CategorySliderProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-white py-5 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {categories.slice(0, 12).map((category, index) => {
            const slugKey = category.slug?.split('-')[0]?.toLowerCase() || '';
            const config = SLUG_MAP[slugKey] || FALLBACK_CONFIGS[index % FALLBACK_CONFIGS.length];
            const IconComponent = (config as any).icon || Package;
            const initial = category.name.charAt(0).toUpperCase();

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${config.bg} ring-2 ${config.ring} ring-offset-1 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-200 overflow-hidden`}
                >
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (config as any).icon ? (
                    <IconComponent className={`w-7 h-7 md:w-8 md:h-8 ${config.iconColor}`} />
                  ) : (
                    <span className={`text-xl font-bold ${config.iconColor}`}>{initial}</span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-orange-500 transition-colors line-clamp-2">
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
