'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProductForm, { ProductFormInitialData } from '@/components/admin/ProductForm';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ProductFormInitialData | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          toast.error('Бараа олдсонгүй');
          router.push('/admin/products');
          return;
        }
        const data = await res.json();
        setInitialData({
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          sale_price: data.sale_price,
          images: data.images || [],
          colors: data.colors || [],
          size_type: data.size_type || 'none',
          sizes: data.sizes || [],
          category_id: typeof data.category_id === 'object' ? data.category_id?._id : data.category_id,
          subcategory_id: data.subcategory_id || null,
          attributes: data.attributes || {},
          brand: data.brand,
          weight: data.weight,
          stock: data.stock,
          is_new: data.is_new,
          is_featured: data.is_featured,
        });
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Алдаа гарлаа');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  if (loading || !initialData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return <ProductForm mode="edit" productId={id} initialData={initialData} />;
}
