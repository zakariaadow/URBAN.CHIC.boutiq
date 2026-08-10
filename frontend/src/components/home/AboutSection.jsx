// src/components/home/AboutSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCheckCircle, FaArrowRight, FaHeart, FaAward, FaUsers, FaClock } from 'react-icons/fa';

const AboutSection = ({ aboutData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    { icon: <FaHeart className="text-pink-500" />, title: 'Passionate Team', description: 'Our experts are dedicated to making you feel beautiful' },
    { icon: <FaAward className="text-yellow-500" />, title: 'Award Winning', description: 'Recognized for excellence in beauty services' },
    { icon: <FaUsers className="text-blue-500" />, title: 'Community Focused', description: 'Building relationships with our clients' },
    { icon: <FaClock className="text-green-500" />, title: 'Punctuality', description: 'We value your time and respect your schedule' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <div className="flex items-center justify-center text-6xl text-purple-400">
                  <span className="font-bold">UC</span>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">98%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">About Us</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Where Beauty Meets <span className="text-purple-600 dark:text-purple-400">Excellence</span>
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              At Urban Chic Boutique, we believe that everyone deserves to feel beautiful and confident. 
              Our team of expert stylists and beauty professionals are dedicated to providing you with 
              an exceptional experience that leaves you feeling refreshed and rejuvenated.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/about')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 flex items-center"
            >
              Learn More About Us
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;