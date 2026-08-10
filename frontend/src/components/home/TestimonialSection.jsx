// src/components/home/TestimonialSection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa';

const TestimonialSection = ({ testimonials }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayTestimonials = testimonials?.length > 0 ? testimonials : [
    {
      id: 1,
      customer_name: 'Sarah M.',
      rating: 5,
      comment: 'Amazing service! The stylists are professional and the results are always perfect.',
      service_name: 'Hair Coloring'
    },
    {
      id: 2,
      customer_name: 'Jane K.',
      rating: 5,
      comment: 'The best salon in town! I always leave feeling beautiful and refreshed.',
      service_name: 'Facial'
    },
    {
      id: 3,
      customer_name: 'Michael O.',
      rating: 5,
      comment: 'Professional team, relaxing atmosphere, and amazing results. Highly recommended!',
      service_name: 'Body Massage'
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % displayTestimonials.length;
      result.push(displayTestimonials[index]);
    }
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Testimonials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our <span className="text-yellow-600 dark:text-yellow-400">Clients Say</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real reviews from our valued customers
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                
                <FaQuoteLeft className="text-purple-300 dark:text-purple-600 text-2xl mb-2" />
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  "{testimonial.comment}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {testimonial.customer_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {testimonial.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.service_name || 'Customer'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {displayTestimonials.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                aria-label="Previous testimonials"
              >
                <FaChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                aria-label="Next testimonials"
              >
                <FaChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {displayTestimonials.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(Math.ceil(displayTestimonials.length / 3))].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`w-3 h-3 rounded-full transition-all ${
                  Math.floor(currentIndex / 3) === index
                    ? 'bg-purple-600 w-6'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;