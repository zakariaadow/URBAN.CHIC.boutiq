import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaCamera, FaTimes, FaHeart,
  FaArrowLeft, FaArrowRight, FaInstagram,
  FaImages
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Gallery = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // All images from public folder with correct extensions
  const fallbackImages = [
    // Hair Services
    { id: 1, url: '/image6.jpg', title: 'Haircut', category: 'Hair', description: 'Professional haircut and styling' },
    { id: 2, url: '/image8.jpg', title: 'Hair Coloring', category: 'Hair', description: 'Full hair coloring service' },
    { id: 3, url: '/image2.png', title: 'Box Braids', category: 'Hair', description: 'Classic box braids with neat parting' },
    { id: 4, url: '/image3.jpeg', title: 'Knotless Braids', category: 'Hair', description: 'Pain-free knotless braids' },
    { id: 5, url: '/image4.png', title: 'Stitch Braids', category: 'Hair', description: 'Crisp stitch line braids' },
    { id: 6, url: '/image7.jpg', title: 'Senegalese Twists', category: 'Hair', description: 'Beautiful Senegalese twists' },
    { id: 7, url: '/image5.png', title: 'Spring Twists', category: 'Hair', description: 'Bouncy spring twists' },
    { id: 8, url: '/image9.jpg', title: 'Loc Styling', category: 'Hair', description: 'Styling and grooming for mature locs' },
    
    // Nail Services
    { id: 9, url: '/image12.jpg', title: 'Manicure', category: 'Nails', description: 'Basic manicure service' },
    { id: 10, url: '/image11.jpg', title: 'Pedicure', category: 'Nails', description: 'Basic pedicure service' },
    
    // Makeup Services
    { id: 11, url: '/image19.jpg', title: 'Full Makeup', category: 'Makeup', description: 'Complete makeup application' },
    
    // Spa Services
    { id: 12, url: '/image16.jpg', title: 'Luxury Facial', category: 'Spa', description: 'Luxury facial treatment' },
    { id: 13, url: '/image10.jpg', title: 'Body Massage', category: 'Spa', description: 'Full body massage' },
    
    // Waxing Services
    { id: 14, url: '/image20.jpg', title: 'Full Body Waxing', category: 'Waxing', description: 'Complete body waxing' },
  ];

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, but fallback to local images if it fails
      const response = await api.get('/api/public/gallery').catch(() => null);
      
      if (response?.data?.data?.length > 0) {
        const data = response.data.data;
        setImages(data);
        const uniqueCategories = [...new Set(data.map(img => img.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        // Use fallback images
        setImages(fallbackImages);
        // Extract unique categories from fallback images
        const uniqueCategories = [...new Set(fallbackImages.map(img => img.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setImages(fallbackImages);
      const uniqueCategories = [...new Set(fallbackImages.map(img => img.category).filter(Boolean))];
      setCategories(uniqueCategories);
      toast.info('Showing sample gallery images');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const openLightbox = (index) => {
    if (!filteredImages[index]) return;
    setCurrentIndex(index);
    setSelectedImage(filteredImages[index]);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    if (filteredImages.length === 0) return;
    const newIndex = (currentIndex + direction + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our work and see the transformations
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages?.length > 0 ? (
            filteredImages.map((image, index) => (
              <div
                key={image.id || index}
                className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl border border-pink-200/50 dark:border-pink-800/30 hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square"
                onClick={() => openLightbox(index)}
              >
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/image6.jpg'; // Fallback to haircut image
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
                    <FaImages />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="text-white font-semibold">{image.title || 'Untitled'}</h3>
                    <p className="text-white/80 text-sm">{image.category || 'Uncategorized'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-pink-200/50 dark:border-pink-800/30">
              <FaCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later for more photos</p>
            </div>
          )}
        </div>

        {/* Follow Us */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Follow us on Instagram</p>
          <a
            href="https://instagram.com/urbanchicboutique"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-pink-500/30"
          >
            <FaInstagram className="text-xl" />
            Follow on Instagram
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && selectedImage && filteredImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaTimes className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => navigateImage(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaArrowLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => navigateImage(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <FaArrowRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full mx-4">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/30 dark:border-gray-700/50">
              <div className="aspect-w-16 aspect-h-10 bg-gray-900">
                {selectedImage.url ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || 'Gallery image'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/image6.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <FaImages className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedImage.title || 'Untitled'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedImage.description || ''}
                </p>
                <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
                  {selectedImage.category || 'Uncategorized'}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentIndex + 1} / {filteredImages.length}
                  </span>
                  <button
                    onClick={() => toast.info('Like feature coming soon')}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaHeart />
                    Like
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
