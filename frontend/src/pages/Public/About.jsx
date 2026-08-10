import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  FaUsers, FaAward, FaClock, FaHeart,
  FaCut, FaSpa, FaStar, FaCheckCircle,
  FaInstagram, FaFacebook, FaTwitter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const About = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const [aboutRes, teamRes] = await Promise.all([
        axios.get('/api/public/about'),
        axios.get('/api/public/team')
      ]);

      setAboutData(aboutRes.data);
      setTeam(teamRes.data.data || teamRes.data || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error(t('about.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const values = [
    { icon: <FaHeart className="text-pink-500" />, title: 'Passion', description: 'We are passionate about beauty and making our clients feel confident.' },
    { icon: <FaAward className="text-yellow-500" />, title: 'Excellence', description: 'We strive for excellence in every service we provide.' },
    { icon: <FaUsers className="text-blue-500" />, title: 'Community', description: 'We believe in building a strong community of beauty enthusiasts.' },
    { icon: <FaClock className="text-green-500" />, title: 'Punctuality', description: 'We value your time and always respect your schedule.' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {t('about.story.title')}
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {aboutData?.story || 'Urban Chic Boutique is a premier beauty destination that has been transforming lives through exceptional beauty services since our founding. We believe that everyone deserves to feel beautiful and confident in their own skin.'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our journey began with a simple vision: to create a space where beauty meets excellence. Over the years, we have grown into a trusted name in the beauty industry, known for our commitment to quality, innovation, and customer satisfaction.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We take pride in our team of highly skilled professionals who are passionate about their craft and dedicated to providing personalized service to every client who walks through our doors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            {t('about.values.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4 text-3xl">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            {t('about.team.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.length > 0 ? (
              team.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 overflow-hidden">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        {member.name?.charAt(0) || 'T'}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {member.specialty}
                  </p>
                </div>
              ))
            ) : (
              // Default team members
              <>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center text-4xl text-gray-400">
                    <FaCut />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sarah Johnson</h3>
                  <p className="text-purple-600 dark:text-purple-400">Master Stylist</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">10 years experience</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center text-4xl text-gray-400">
                    <FaSpa />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emily Chen</h3>
                  <p className="text-purple-600 dark:text-purple-400">Spa Specialist</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">8 years experience</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center text-4xl text-gray-400">
                    <FaStar />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maria Rodriguez</h3>
                  <p className="text-purple-600 dark:text-purple-400">Makeup Artist</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">6 years experience</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center text-4xl text-gray-400">
                    <FaHeart />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">David Kim</h3>
                  <p className="text-purple-600 dark:text-purple-400">Hair Colorist</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">12 years experience</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;