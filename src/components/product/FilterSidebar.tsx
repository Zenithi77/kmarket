'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, Sparkles, RotateCcw, Check } from 'lucide-react';
import { Product } from '@/types';
import { CATEGORY_FILTERS, BRANDS, COMMON_COLORS, formatPrice } from '@/lib/constants';

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  filters?: { key: string; label: string; type: string; options: string[] }[];
  subcategories?: { _id: string; name: string; slug: string }[];
}

export interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  color: string;
  size: string;
  attributes: Record<string, string>;
  priceRange: [number, number];
}

export const DEFAULT_FILTER_STATE: FilterState = {
  category: '',
  subcategory: '',
  brand: '',
  color: '',
  size: '',
  attributes: {},
  priceRange: [0, 5000000],
};

interface FilterSidebarProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  categories: ApiCategory[];
  products: Product[];
  /** When set, hide the category selector and lock to this category slug. */
  lockedCategorySlug?: string;
  /** When set, override the title of the category section. */
  showCategoryPicker?: boolean;
}

const PRICE_MIN = 0;
const PRICE_MAX = 5000000;

// Section wrapper with animated collapse
function Section({
  title,
  icon,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
          {icon}
          {title}
          {badge ? (
            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold">
              {badge}
            </span>
          ) : null}
        </span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="text-gray-400 group-hover:text-orange-500"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// A small helper to know if a hex color is "light" so we can pick a contrasting check icon
function isLightHex(hex: string) {
  const m = hex.replace('#', '');
  if (m.length !== 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
}

export function FilterSidebar({
  state,
  onChange,
  categories,
  products,
  lockedCategorySlug,
  showCategoryPicker = true,
}: FilterSidebarProps) {
  const setState = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });

  const effectiveCategorySlug = lockedCategorySlug || state.category;
  const selectedCategoryObj = categories.find((c) => c.slug === effectiveCategorySlug);

  // Collect available filters for the selected category (DB or static)
  const activeCategoryFilters = useMemo(() => {
    if (!selectedCategoryObj) return [] as { key: string; label: string; type: string; options: string[] }[];
    if (selectedCategoryObj.filters && selectedCategoryObj.filters.length > 0) {
      return selectedCategoryObj.filters as any;
    }
    return CATEGORY_FILTERS[selectedCategoryObj.slug] || [];
  }, [selectedCategoryObj]);

  // Derive available colors from products (combine COMMON_COLORS + dynamic)
  const availableColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        const key = c.name.toLowerCase();
        if (!map.has(key)) map.set(key, { name: c.name, hex: c.hex });
      });
    });
    // Always include common colors but keep dynamic ones at the end if not present
    const common = COMMON_COLORS.filter((c) => !map.has(c.name.toLowerCase()));
    const dynamic = Array.from(map.values());
    // If we have any product colors, prioritize dynamic. Otherwise show common as defaults.
    return dynamic.length > 0 ? [...dynamic, ...common] : common;
  }, [products]);

  // Derive available sizes from products
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => s && set.add(s)));
    // Sort: numeric first, then alphabetical
    return Array.from(set).sort((a, b) => {
      const na = parseInt(a);
      const nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      if (!isNaN(na)) return -1;
      if (!isNaN(nb)) return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  // Derive available brands from products (fallback to static BRANDS)
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.brand && set.add(p.brand));
    const dyn = Array.from(set).sort();
    return dyn.length > 0 ? dyn : (BRANDS as readonly string[]);
  }, [products]);

  const activeCount =
    (state.category && !lockedCategorySlug ? 1 : 0) +
    (state.subcategory ? 1 : 0) +
    (state.brand ? 1 : 0) +
    (state.color ? 1 : 0) +
    (state.size ? 1 : 0) +
    Object.keys(state.attributes).length +
    (state.priceRange[0] > PRICE_MIN || state.priceRange[1] < PRICE_MAX ? 1 : 0);

  const clearAll = () => {
    onChange({
      ...DEFAULT_FILTER_STATE,
      category: lockedCategorySlug ? state.category : '',
    });
  };

  const handleAttribute = (key: string, value: string) => {
    const next = { ...state.attributes };
    if (next[key] === value) delete next[key];
    else next[key] = value;
    setState({ attributes: next });
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-sm shadow-orange-200">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm leading-tight">Шүүлтүүр</h2>
            <p className="text-[11px] text-gray-500 leading-tight">
              {activeCount > 0 ? `${activeCount} идэвхтэй` : 'Хайлтаа нарийсга'}
            </p>
          </div>
        </div>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Цэвэрлэх
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      {showCategoryPicker && !lockedCategorySlug && (
        <Section title="Ангилал" icon={<Sparkles className="w-3.5 h-3.5 text-orange-500" />}>
          <div className="space-y-1">
            {categories.map((cat) => {
              const active = state.category === cat.slug;
              return (
                <div key={cat._id}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setState({
                        category: active ? '' : cat.slug,
                        subcategory: '',
                        attributes: {},
                      })
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                      active
                        ? 'bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-orange-500" />}
                  </motion.button>
                  <AnimatePresence>
                    {active && cat.subcategories && cat.subcategories.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-orange-200 pl-3">
                          <button
                            onClick={() => setState({ subcategory: '' })}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                              !state.subcategory
                                ? 'text-orange-600 font-medium bg-orange-50'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Бүгд
                          </button>
                          {cat.subcategories.map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() =>
                                setState({
                                  subcategory: state.subcategory === sub.slug ? '' : sub.slug,
                                })
                              }
                              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                state.subcategory === sub.slug
                                  ? 'text-orange-600 font-medium bg-orange-50'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Subcategory selector when category is locked */}
      {lockedCategorySlug && selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 && (
        <Section title="Дэд ангилал" icon={<Sparkles className="w-3.5 h-3.5 text-orange-500" />}>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState({ subcategory: '' })}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                !state.subcategory
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
              }`}
            >
              Бүгд
            </button>
            {selectedCategoryObj.subcategories.map((sub) => (
              <motion.button
                key={sub._id}
                whileTap={{ scale: 0.93 }}
                onClick={() =>
                  setState({ subcategory: state.subcategory === sub.slug ? '' : sub.slug })
                }
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  state.subcategory === sub.slug
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
                }`}
              >
                {sub.name}
              </motion.button>
            ))}
          </div>
        </Section>
      )}

      {/* Color filter */}
      {availableColors.length > 0 && (
        <Section
          title="Өнгө"
          icon={<span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-500" />}
          badge={state.color ? 1 : 0}
        >
          <div className="flex flex-wrap gap-2">
            {availableColors.map((c) => {
              const active = state.color.toLowerCase() === c.name.toLowerCase();
              const light = isLightHex(c.hex);
              return (
                <motion.button
                  key={c.name}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setState({ color: active ? '' : c.name })}
                  title={c.name}
                  aria-label={c.name}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                    active
                      ? 'border-orange-500 ring-2 ring-orange-200 ring-offset-1'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check
                        className={`w-4 h-4 ${light ? 'text-gray-900' : 'text-white'}`}
                        strokeWidth={3}
                      />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {state.color && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-gray-500"
              >
                Сонгосон: <span className="font-medium text-gray-700">{state.color}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </Section>
      )}

      {/* Size filter */}
      {availableSizes.length > 0 && (
        <Section title="Хэмжээ" badge={state.size ? 1 : 0}>
          <div className="grid grid-cols-5 gap-1.5">
            {availableSizes.map((s) => {
              const active = state.size === s;
              return (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setState({ size: active ? '' : s })}
                  className={`h-9 text-xs rounded-lg border font-medium transition-all ${
                    active
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                  }`}
                >
                  {s}
                </motion.button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Dynamic Category Attribute Filters */}
      {effectiveCategorySlug && activeCategoryFilters.length > 0 && (
        <>
          {activeCategoryFilters.map((filter: { key: string; label: string; options: string[] }) => (
            <Section
              key={filter.key}
              title={filter.label}
              badge={state.attributes[filter.key] ? 1 : 0}
            >
              <div className="flex flex-wrap gap-1.5">
                {filter.options.map((opt) => {
                  const active = state.attributes[filter.key] === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleAttribute(filter.key, opt)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        active
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                      }`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </Section>
          ))}
        </>
      )}

      {/* Brand */}
      {availableBrands.length > 0 && (
        <Section title="Брэнд" badge={state.brand ? 1 : 0} defaultOpen={false}>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {availableBrands.map((b) => {
              const active = state.brand === b;
              return (
                <button
                  key={b}
                  onClick={() => setState({ brand: active ? '' : b })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    active
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{b}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Price range */}
      <Section
        title="Үнийн хязгаар"
        badge={state.priceRange[0] > PRICE_MIN || state.priceRange[1] < PRICE_MAX ? 1 : 0}
      >
        <PriceRange
          value={state.priceRange}
          onChange={(v) => setState({ priceRange: v })}
        />
      </Section>
    </div>
  );
}

/* ============ Dual-handle price range ============ */
function PriceRange({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [local, setLocal] = useState<[number, number]>(value);

  useEffect(() => {
    setLocal(value);
  }, [value[0], value[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  const minPct = ((local[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((local[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const commit = (next: [number, number]) => {
    setLocal(next);
    onChange(next);
  };

  return (
    <div>
      <div className="relative h-8 mt-1 mb-2">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full" />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
          animate={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          transition={{ type: 'tween', duration: 0.15 }}
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50000}
          value={local[0]}
          onChange={(e) => {
            const v = Math.min(parseInt(e.target.value), local[1] - 50000);
            commit([v, local[1]]);
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none range-thumb"
        />
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={50000}
          value={local[1]}
          onChange={(e) => {
            const v = Math.max(parseInt(e.target.value), local[0] + 50000);
            commit([local[0], v]);
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none range-thumb"
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex-1 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-[10px] text-gray-500">Хамгийн бага</div>
          <div className="font-semibold text-gray-900">{formatPrice(local[0])}</div>
        </div>
        <span className="text-gray-300">—</span>
        <div className="flex-1 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-[10px] text-gray-500">Хамгийн их</div>
          <div className="font-semibold text-gray-900">{formatPrice(local[1])}</div>
        </div>
      </div>
    </div>
  );
}
