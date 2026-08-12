import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { 
  FaCut, FaSpa, FaPaintBrush, FaHands,
  FaStar, FaClock, FaMapMarkerAlt, FaPhone,
  FaEnvelope, FaInstagram, FaFacebook, FaTwitter,
  FaArrowRight, FaCheckCircle, FaUsers,
  FaAward, FaGift, FaCalendarCheck, FaQuoteLeft,
  FaWhatsapp, FaYoutube, FaHeart, FaShieldAlt, 
  FaThumbsUp, FaUserCheck, FaImages
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [hairStyles, setHairStyles] = useState([]);

  // Fallback hair styles with your images
  const hairStylesData = [
    { id: 9, name: 'Box Braids', description: 'Classic box braids with neat parting and professional finish', price: 4500, duration_minutes: 180, image: '/image2.png', rating: 4.9, is_popular: true, category: 'Hair' },
    { id: 10, name: 'Knotless Braids', description: 'Pain-free knotless braids with natural-looking finish', price: 5000, duration_minutes: 200, image: '/image3.jpeg', rating: 4.8, is_popular: true, category: 'Hair' },
    { id: 11, name: 'Stitch Braids', description: 'Crisp stitch line braids for a polished and elegant look', price: 4000, duration_minutes: 150, image: '/image4.png', rating: 4.6, is_popular: false, category: 'Hair' },
    { id: 12, name: 'Senegalese Twists', description: 'Beautiful Senegalese twists with natural hair texture', price: 3500, duration_minutes: 120, image: '/image7.jpg', rating: 4.7, is_popular: false, category: 'Hair' },
    { id: 14, name: 'Loc Retouch', description: 'Professional loc retouch and maintenance service', price: 3000, duration_minutes: 90, image: '/image4.png', rating: 4.9, is_popular: true, category: 'Hair' },
    { id: 16, name: 'Loc Styling', description: 'Styling and grooming for mature locs', price: 2500, duration_minutes: 60, image: '/image9.jpg', rating: 4.5, is_popular: false, category: 'Hair' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // ✅ FIX: Use environment variable for API URL
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await api.get(`${API_URL}/api/public/services`);
      const allServices = response.data?.data || response.data || [];
      setServices(allServices);
      
      // Filter hair services from database
      const hairServices = allServices.filter(s => {
        const category = s.category?.name || s.category || '';
        return category === 'Hair';
      });
      
      if (hairServices.length > 0) {
        const mappedHairServices = hairServices.map(s => ({
          ...s,
          image: s.image || hairStylesData.find(h => h.id === s.id)?.image || null,
          rating: s.rating || 4.5,
          is_popular: s.is_popular || false
        }));
        setHairStyles(mappedHairServices);
      } else {
        setHairStyles(hairStylesData);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setHairStyles(hairStylesData);
      toast.error('Failed to load services. Showing sample data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`w-4 h-4 ${i < (rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const getCategoryName = (service) => {
    if (!service) return 'Hair';
    if (typeof service.category === 'string') return service.category;
    if (service.category?.name) return service.category.name;
    return 'Hair';
  };

  const getDuration = (service) => {
    return service.duration_minutes || service.duration || 0;
  };

  const getRating = (service) => {
    return service.rating || 4.5;
  };

  const getPrice = (service) => {
    return service.price || 0;
  };

  const fadeIn = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  const fadeInDelay = (delay) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
    viewport: { once: true }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-100/20 dark:bg-rose-900/5 rounded-full blur-3xl"></div>
      </div>

      {/* ========== HERO SECTION WITH VIDEO ========== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/video/home_hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-300/20 dark:bg-pink-500/10 blur-3xl z-10"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-3xl z-10"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn} className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-5 py-2 border border-white/30 dark:border-pink-800/30 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-pink-500">✦</span> HAIR • NAILS • BEAUTY
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight">
                <span className="block text-white drop-shadow-lg">Look & Feel</span>
                <span className="block bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">Absolutely Beautiful</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 max-w-lg leading-relaxed drop-shadow-lg">
                Real styles, real nails, real beauty work, and a warm salon experience in Nairobi.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-xl shadow-pink-500/30 flex items-center"
                >
                  Book Now <FaArrowRight className="ml-2" />
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="px-8 py-3.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold border border-white/30 dark:border-pink-800/30 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex items-center shadow-lg"
                >
                  <FaImages className="mr-2" /> Gallery
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-lg">
                    +2K
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className="w-4 h-4 text-yellow-400" />)}
                  </div>
                  <span className="text-sm text-white/90 drop-shadow-lg">4.9/5 from 2,000+ reviews</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} className="relative hidden lg:block">
              <div className="rounded-3xl h-[500px] lg:h-[600px] overflow-hidden shadow-2xl bg-gradient-to-br from-pink-200/30 to-purple-200/30 dark:from-pink-900/30 dark:to-purple-900/30 flex flex-col items-center justify-center p-8 text-center border border-white/30 dark:border-pink-800/30 backdrop-blur-sm">
                <div className="w-24 h-24 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg">
                  <FaCut className="w-10 h-10 text-pink-500" />
                </div>
                <p className="text-2xl font-bold text-white drop-shadow-lg">Urban Chic Salon</p>
                <p className="text-sm text-white/80 drop-shadow-lg">HAIR • NAILS • BEAUTY</p>
                <div className="mt-4 flex items-center gap-2 text-white/90 drop-shadow-lg">
                  <FaHeart className="text-pink-400" />
                  <span className="text-sm">Warm Salon Experience</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/30 dark:border-pink-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaStar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">98%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/30 dark:border-pink-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <FaAward className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Award Winner</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Best Salon 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== STATISTICS ========== */}
      <section className="py-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-y border-pink-200/30 dark:border-pink-800/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaUsers className="w-6 h-6" />, value: '12,500+', label: 'Happy Clients' },
              { icon: <FaCalendarCheck className="w-6 h-6" />, value: '15,000+', label: 'Bookings' },
              { icon: <FaCut className="w-6 h-6" />, value: '25+', label: 'Expert Stylists' },
              { icon: <FaAward className="w-6 h-6" />, value: '5+', label: 'Years of Excellence' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                {...fadeInDelay(index * 0.1)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/50 dark:border-pink-800/30 p-8 text-center hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-3 text-white text-2xl shadow-lg shadow-pink-500/20">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {renderStars(5)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HAIR STYLES SECTION ========== */}
      <section className="py-32 bg-gradient-to-b from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/30 shadow-lg mb-4">
              <FaCut className="w-3 h-3" /> Hair Styles
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Real <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Styles</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-4">
              Braids, knotless styles, stitch lines, twists, loc retouch, and signature finishes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hairStyles.slice(0, 6).map((style, index) => {
              const categoryName = getCategoryName(style);
              const duration = getDuration(style);
              const rating = getRating(style);
              const price = getPrice(style);
              const isPopular = style.is_popular || false;

              return (
                <motion.div
                  key={style.id || index}
                  {...fadeInDelay(index * 0.1)}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-pink-200/50 dark:border-pink-800/30 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/services/${style.id}`)}
                >
                  <div className="relative h-72 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 overflow-hidden">
                    {style.image ? (
                      <img 
                        src={style.image} 
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl opacity-30 text-gray-400"><span>${style.name?.charAt(0) || '📷'}</span></div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-30 text-gray-400">
                        <FaCut />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                      ★ {rating.toFixed(1)}
                    </div>
                    {isPopular && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full px-3 py-1 text-xs text-white font-semibold shadow-lg">
                        ★ Popular
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                      {categoryName || 'Hair'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{style.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{style.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                          {formatCurrency(price)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">{duration} min</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate('/login') }}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-pink-500/30"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/services')}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-pink-500/30"
            >
              View All Styles <FaArrowRight className="inline ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="py-32 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 rounded-full px-4 py-1.5 text-sm text-pink-700 dark:text-pink-300 mb-4">
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Why <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Urban Chic</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FaUserCheck className="text-pink-500" />, title: 'Certified Professionals', description: 'Our team is trained and certified in the latest beauty techniques' },
              { icon: <FaHeart className="text-red-500" />, title: 'Personalized Service', description: 'Every client receives customized care and attention' },
              { icon: <FaThumbsUp className="text-yellow-500" />, title: 'Affordable Prices', description: 'Premium services at competitive prices' }
            ].map((item, index) => (
              <motion.div
                key={index}
                {...fadeInDelay(index * 0.1)}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-pink-200/50 dark:border-pink-800/30 shadow-xl p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-32 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.div {...fadeIn} className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready for a New Look?</h2>
            <p className="text-lg text-white/90 mb-8">Book your appointment today and experience the Urban Chic difference</p>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 rounded-full bg-white text-purple-600 font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <FaCalendarCheck className="inline mr-2" /> Book Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-950 dark:to-purple-950 border-t border-pink-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 max-w-7xl py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/30">
                  UC
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent block leading-tight">
                    Urban Chic
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium block -mt-0.5">
                    HAIR • NAILS • BEAUTY
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Real styles, real nails, real beauty work, and a warm salon experience in Nairobi.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md">
                  <FaFacebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md">
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md">
                  <FaTwitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md">
                  <FaYoutube className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-md">
                  <FaWhatsapp className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Services</Link></li>
                <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Pricing</Link></li>
                <li><Link to="/team" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Team</Link></li>
                <li><Link to="/gallery" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Gallery</Link></li>
                <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Hair Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Braids</Link></li>
                <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Twists</Link></li>
                <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Locs</Link></li>
                <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors">Signature Styles</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-0.5 text-pink-500" />
                  <span>123 Fashion Avenue, Nairobi</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaPhone className="text-pink-500" />
                  <span>+254 700 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-pink-500" />
                  <span>info@urbanchicboutique.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaClock className="text-pink-500" />
                  <span>Mon-Sat: 9AM - 6PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaWhatsapp className="text-pink-500" />
                  <span>WhatsApp: +254 700 123 456</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-pink-200/50 dark:border-gray-800/50 mt-12 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Urban Chic Boutique. All rights reserved.</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">HAIR • NAILS • BEAUTY</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;