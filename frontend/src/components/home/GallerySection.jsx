// src/components/home/GallerySection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaImages, FaArrowRight, FaCamera, FaHeart } from 'react-icons/fa';

const GallerySection = ({ images }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Sample gallery images if none provided
  const galleryImages = images?.length > 0 ? images : [
    { id: 1, title: 'Hair Styling', category: 'Hair' },
    { id: 2, title: 'Makeup Art', category: 'Makeup' },
    { id: 3, title: 'Spa Treatment', category: 'Spa' },
    { id: 4, title: 'Nail Design', category: 'Nails' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">Gallery</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="text-pink-600 dark:text-pink-400">Work</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse through our portfolio of transformations
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id || index}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => navigate('/gallery')}
            >
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 dark:text-gray-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <FaCamera />
              </div>
              
              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold">{image.title}</p>
                  <p className="text-white/80 text-sm">{image.category}</p>
                </div>
              </div>

              {/* Like Button */}
              <button 
                className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <FaHeart className="w-4 h-4 text-white hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/gallery')}
            className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all transform hover:scale-105 inline-flex items-center"
          >
            View Full Gallery
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;