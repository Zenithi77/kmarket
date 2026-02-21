'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Truck, Sparkles, Flower2, Shirt, Briefcase, Globe, Package, Tag, Percent, Crown } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  color?: string;
  bgColor?: string;
}

interface CategorySliderProps {
  categories?: CategoryItem[];
}

// Default category icons - Coupang style (2 rows)
const defaultCategoryIcons = [
  // Row 1
  { id: '1', name: 'Хүргэлттэй', slug: 'delivery', icon: Truck, bgColor: 'bg-blue-100', color: 'text-blue-500' },
  { id: '2', name: 'Шинэ ирсэн', slug: 'new', icon: Sparkles, bgColor: 'bg-amber-100', color: 'text-amber-500' },
  { id: '3', name: 'Beauty', slug: 'beauty', icon: Flower2, bgColor: 'bg-green-100', color: 'text-green-500' },
  { id: '4', name: 'Fashion', slug: 'fashion', icon: Shirt, bgColor: 'bg-pink-100', color: 'text-pink-500' },
  { id: '5', name: 'Бизнес', slug: 'business', icon: Briefcase, bgColor: 'bg-sky-100', color: 'text-sky-500' },
  // Row 2
  { id: '6', name: 'Импорт', slug: 'import', icon: Globe, bgColor: 'bg-indigo-100', color: 'text-indigo-500' },
  { id: '7', name: 'Шинэ бараа', slug: 'new-arrivals', icon: Package, bgColor: 'bg-orange-100', color: 'text-orange-500' },
  { id: '8', name: 'Хямдрал', slug: 'sale', icon: Tag, bgColor: 'bg-rose-100', color: 'text-rose-500' },
  { id: '9', name: 'Урамшуулал', slug: 'promo', icon: Percent, bgColor: 'bg-lime-100', color: 'text-lime-600' },
  { id: '10', name: 'VIP', slug: 'vip', icon: Crown, bgColor: 'bg-yellow-100', color: 'text-yellow-500' },
];

export default function CategorySlider({ categories }: CategorySliderProps) {
  const displayCategories = categories && categories.length > 0 
    ? categories 
    : null;

  return (
    <section className="bg-white py-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {displayCategories ? (
          // Dynamic categories from API
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
            {displayCategories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center group"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-sm overflow-hidden ${category.bgColor || 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                  {category.image || category.icon ? (
                    <Image
                      src={category.image || category.icon || ''}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-700 text-center line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          // Default Coupang-style 2 rows layout
          <div className="space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {defaultCategoryIcons.slice(0, 5).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.slug}`}
                    className="flex flex-col items-center group"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bgColor} rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                    </div>
                    <span className="text-xs text-gray-700 text-center line-clamp-1 group-hover:text-orange-500 transition-colors font-medium">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {defaultCategoryIcons.slice(5, 10).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/category/${item.slug}`}
                    className="flex flex-col items-center group"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bgColor} rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 md:w-7 md:h-7 ${item.color}`} />
                    </div>
                    <span className="text-xs text-gray-700 text-center line-clamp-1 group-hover:text-orange-500 transition-colors font-medium">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
