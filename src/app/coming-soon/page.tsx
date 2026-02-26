'use client';

import { useState, useEffect } from 'react';

export default function ComingSoonPage() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Set launch date to 30 days from now (you can customize this)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        setDays(Math.floor(difference / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((difference / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((difference / 1000 / 60) % 60));
        setSeconds(Math.floor((difference / 1000) % 60));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            KMarket
          </h1>
          <div className="h-1 w-24 bg-white mx-auto rounded-full"></div>
        </div>

        {/* Coming Soon Text */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Удахгүй нээгдэж байна
        </h2>
        
        <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
          Монголын шилдэг онлайн дэлгүүрийг танд авчирч байна. 
          Үзэсгэлэнтэй бүтээгдэхүүн, сайн үнэ болон хэрхэн сервис хүлээх хэрэгтэйгээ мэдэхийн тулд доор байгаа цаг хүлээнэ үү.
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-8 backdrop-blur-sm">
            <div className="text-3xl md:text-5xl font-bold text-white mb-2">
              {String(days).padStart(2, '0')}
            </div>
            <div className="text-white text-sm md:text-base uppercase tracking-widest">
              Өдөр
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-8 backdrop-blur-sm">
            <div className="text-3xl md:text-5xl font-bold text-white mb-2">
              {String(hours).padStart(2, '0')}
            </div>
            <div className="text-white text-sm md:text-base uppercase tracking-widest">
              Цаг
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-8 backdrop-blur-sm">
            <div className="text-3xl md:text-5xl font-bold text-white mb-2">
              {String(minutes).padStart(2, '0')}
            </div>
            <div className="text-white text-sm md:text-base uppercase tracking-widest">
              Минут
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-8 backdrop-blur-sm">
            <div className="text-3xl md:text-5xl font-bold text-white mb-2">
              {String(seconds).padStart(2, '0')}
            </div>
            <div className="text-white text-sm md:text-base uppercase tracking-widest">
              Секунд
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-12">
          <p className="text-white mb-4 text-lg">
            Эхэлцэхдээ анхаар байхыг хүсэж байна уу?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Таны email хаяг"
              className="px-6 py-3 rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition duration-300 whitespace-nowrap">
              Илгээх
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6">
          <a
            href="#"
            className="text-white hover:text-gray-200 transition"
            aria-label="Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-200 transition"
            aria-label="Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.894 8.221c.004.122.006.245.006.37 0 3.833-2.909 8.25-8.25 8.25-1.639 0-3.163-.479-4.447-1.312.227.027.459.042.695.042 1.36 0 2.612-.465 3.596-1.244-1.269-.024-2.339-.861-2.708-2.015.177.034.359.052.545.052.265 0 .522-.035.768-.1-1.327-.267-2.327-1.439-2.327-2.847v-.036c.391.218.84.349 1.321.364-.779-.52-1.29-1.408-1.29-2.414 0-.531.143-1.029.394-1.458 1.43 1.756 3.568 2.912 5.975 3.034-.025-.106-.04-.216-.04-.328 0-1.594 1.293-2.887 2.887-2.887.831 0 1.582.35 2.11.91.658-.129 1.278-.369 1.834-.697-.215.675-.671 1.242-1.265 1.602.586-.071 1.143-.226 1.661-.459-.388.583-.878 1.096-1.439 1.509z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
