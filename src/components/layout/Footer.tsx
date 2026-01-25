import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-xl font-bold text-white">KMarket</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Монголын хамгийн том онлайн худалдааны платформ. 
              Таны хэрэгцээнд нийцсэн бүтээгдэхүүнийг хамгийн сайн үнээр санал болгож байна.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Хурдан холбоос</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Бидний тухай
                </span>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-primary-500 transition-colors">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Хямдрал
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Түгээмэл асуулт
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Үйлчилгээний нөхцөл
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Нууцлалын бодлого
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Хэрэглэгчийн үйлчилгээ</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Тусламж
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Хүргэлтийн мэдээлэл
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Буцаалт & Солилт
                </span>
              </li>
              <li>
                <Link href="/profile/orders" className="text-sm hover:text-primary-500 transition-colors">
                  Захиалга хайх
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-400 cursor-default">
                  Размерийн заавар
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Холбоо барих</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Улаанбаатар хот, Сүхбаатар дүүрэг, 
                  1-р хороо, Энхтайваны өргөн чөлөө
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">+976 7777-8888</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">info@kmarket.mn</span>
              </li>
            </ul>
            
            {/* Working Hours */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-white mb-1">Ажиллах цаг</p>
              <p className="text-xs text-gray-400">Даваа - Бямба: 09:00 - 21:00</p>
              <p className="text-xs text-gray-400">Ням: 10:00 - 18:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {currentYear} KMarket. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">VISA</span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">MasterCard</span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">QPay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
