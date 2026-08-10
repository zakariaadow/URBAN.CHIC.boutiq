// src/components/home/TeamSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaArrowRight, FaUser } from 'react-icons/fa';

const TeamSection = ({ teamMembers }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Show first 3 team members
  const displayTeam = teamMembers?.slice(0, 3) || [];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Our Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Meet Our <span className="text-blue-600 dark:text-blue-400">Experts</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our team of passionate professionals is here to make you look and feel amazing
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayTeam.map((member) => (
            <div
              key={member.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/team')}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-purple-400">
                {member.name?.charAt(0) || <FaUser />}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                {member.role || 'Stylist'}
              </p>
              
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`w-4 h-4 ${i < (member.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({member.reviews || 0})
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {member.description || member.bio || `Experienced ${member.role || 'stylist'}`}
              </p>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/team')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 inline-flex items-center"
          >
            Meet the Full Team
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;