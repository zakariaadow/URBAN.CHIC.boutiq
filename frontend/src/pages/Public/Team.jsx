// src/pages/Public/Team.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { 
  FaUser, FaStar, FaClock, FaAward,
  FaInstagram, FaFacebook, FaTwitter,
  FaCut, FaSpa, FaPaintBrush, FaHands,
  FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Team = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fallback data with correct field names
  const teamData = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      role: 'Master Stylist', 
      specialty: 'Hair Styling & Color',
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      description: 'Sarah is our lead stylist with over a decade of experience in high-end salons. She specializes in precision cuts and creative coloring techniques.',
      services: ['Haircut', 'Hair Coloring', 'Highlights', 'Blow Dry'],
      photo: null
    },
    { 
      id: 2, 
      name: 'Emily Chen', 
      role: 'Spa Specialist', 
      specialty: 'Facial & Massage',
      experience: '8 years',
      rating: 4.8,
      reviews: 134,
      description: 'Emily brings a holistic approach to skincare and relaxation. Her expertise in facial treatments and therapeutic massage ensures a rejuvenating experience.',
      services: ['Facial', 'Body Massage', 'Body Scrub'],
      photo: null
    },
    { 
      id: 3, 
      name: 'Maria Rodriguez', 
      role: 'Makeup Artist', 
      specialty: 'Bridal & Event Makeup',
      experience: '6 years',
      rating: 4.9,
      reviews: 112,
      description: 'Maria is our creative makeup artist with a passion for enhancing natural beauty. She specializes in bridal and special occasion makeup.',
      services: ['Full Makeup', 'Bridal Makeup', 'Evening Makeup'],
      photo: null
    },
    { 
      id: 4, 
      name: 'David Kim', 
      role: 'Hair Colorist', 
      specialty: 'Color & Chemical Services',
      experience: '12 years',
      rating: 4.7,
      reviews: 98,
      description: 'David is a master colorist with extensive knowledge of color theory and chemical treatments. He creates stunning, personalized color results.',
      services: ['Hair Coloring', 'Highlights', 'Color Correction'],
      photo: null
    },
    { 
      id: 5, 
      name: 'Jessica Park', 
      role: 'Nail Technician', 
      specialty: 'Nail Art & Design',
      experience: '5 years',
      rating: 4.8,
      reviews: 87,
      description: 'Jessica is our creative nail technician known for her intricate designs and attention to detail. She stays current with the latest nail trends.',
      services: ['Manicure', 'Pedicure', 'Gel Manicure', 'Nail Art'],
      photo: null
    },
    { 
      id: 6, 
      name: 'Michael Brown', 
      role: 'Waxing Specialist', 
      specialty: 'Body Waxing & Grooming',
      experience: '7 years',
      rating: 4.6,
      reviews: 76,
      description: 'Michael is our expert in body waxing and grooming. He provides professional, comfortable waxing services with a focus on client comfort.',
      services: ['Waxing', 'Full Body Waxing', 'Eyebrow Shaping'],
      photo: null
    }
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/public/team');
      
      // Fix 1: Handle paginated response
      let members = [];
      
      // Check if response has data.items (paginated)
      if (response.data?.data?.items) {
        members = response.data.data.items;
      } 
      // Check if response has data directly (array)
      else if (response.data?.data && Array.isArray(response.data.data)) {
        members = response.data.data;
      }
      // Check if response is directly an array
      else if (Array.isArray(response.data)) {
        members = response.data;
      }
      
      // If we got members, use them, otherwise fallback to teamData
      setTeamMembers(members.length > 0 ? members : teamData);
      
    } catch (error) {
      console.error('Error fetching team:', error);
      // Use fallback data on error
      setTeamMembers(teamData);
      toast.error(t('team.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyIcon = (specialty) => {
    if (!specialty) return <FaUser className="text-gray-500" />;
    const specialtyLower = specialty.toLowerCase();
    if (specialtyLower.includes('hair')) return <FaCut className="text-purple-500" />;
    if (specialtyLower.includes('spa') || specialtyLower.includes('facial') || specialtyLower.includes('massage')) return <FaSpa className="text-green-500" />;
    if (specialtyLower.includes('makeup')) return <FaPaintBrush className="text-yellow-500" />;
    if (specialtyLower.includes('nail')) return <FaHands className="text-pink-500" />;
    if (specialtyLower.includes('waxing')) return <FaHands className="text-orange-500" />;
    return <FaUser className="text-gray-500" />;
  };

  // Helper function to safely get values
  const getRating = (member) => member?.rating || 0;
  const getReviews = (member) => member?.reviews || member?.review_count || 0;
  const getServices = (member) => member?.services || member?.specialties || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('team.title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('team.subtitle')}
          </p>
        </div>

        {/* Team Grid */}
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              const services = getServices(member);
              const rating = getRating(member);
              const reviews = getReviews(member);
              
              return (
                <div
                  key={member.id || member.user_id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member);
                    setShowDetails(true);
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-400 flex-shrink-0">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.name?.charAt(0) || 'T'
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          {member.role || member.position || 'Team Member'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <FaStar className="text-yellow-400" />
                          <span>{rating.toFixed(1)}</span>
                          <span>({reviews} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {member.description || member.bio || `Experienced ${member.role || 'team member'}`}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <FaClock className="text-gray-400" />
                      <span>{member.experience || member.experience_years || 'Experienced'}</span>
                    </div>

                    {services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {services.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                            {service}
                          </span>
                        ))}
                        {services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded">
                            +{services.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('team.noMembers')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('team.noMembersDesc')}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            {t('team.cta.title')}
          </h2>
          <p className="text-white/90 mb-6">
            {t('team.cta.subtitle')}
          </p>
          <button
            onClick={() => window.location.href = '/book-appointment'}
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors inline-flex items-center"
          >
            {t('team.cta.button')}
          </button>
        </div>
      </div>

      {/* Team Member Details Modal */}
      {showDetails && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('team.details')}
                </h2>
                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl text-gray-400 flex-shrink-0">
                  {selectedMember.photo ? (
                    <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedMember.name?.charAt(0) || 'T'
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400">{selectedMember.role || 'Team Member'}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <FaStar className="text-yellow-400 mr-1" /> {getRating(selectedMember).toFixed(1)}
                    </span>
                    <span>{getReviews(selectedMember)} reviews</span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" /> {selectedMember.experience || 'Experienced'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedMember.description || selectedMember.bio || `Experienced professional in ${selectedMember.specialty || 'beauty services'}`}
                </p>
              </div>

              {getServices(selectedMember).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('team.specialties')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getServices(selectedMember).map((service, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/book-appointment?stylist=${selectedMember.id}`}
                  className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('team.bookWith')}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;