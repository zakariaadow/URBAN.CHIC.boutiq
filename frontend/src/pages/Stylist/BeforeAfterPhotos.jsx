import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCamera, 
  FaSpinner, 
  FaTimes,
  FaUpload,
  FaImage,
  FaTrash,
  FaEye,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaImages
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const BeforeAfterPhotos = ({ appointment, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('before');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadType, setUploadType] = useState('before');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (appointment) {
      fetchPhotos();
    }
  }, [appointment]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/stylist/appointments/${appointment.id}/photos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        const data = response.data.data;
        setBeforePhotos(data.before || []);
        setAfterPhotos(data.after || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (e, type) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append('photos', file);
    }
    formData.append('type', type);

    try {
      const response = await axios.post(
        `/api/stylist/appointments/${appointment.id}/photos`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success(`${type === 'before' ? 'Before' : 'After'} photos uploaded successfully`);
        fetchPhotos();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId, type) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `/api/stylist/appointments/${appointment.id}/photos/${photoId}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          data: { type }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Photo deleted successfully');
        fetchPhotos();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryPhoto = async (photoId, type) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/stylist/appointments/${appointment.id}/photos/${photoId}/primary`,
        { type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('Primary photo set');
        fetchPhotos();
      }
    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast.error('Failed to set primary photo');
    } finally {
      setLoading(false);
    }
  };

  const getPhotos = () => {
    return activeTab === 'before' ? beforePhotos : afterPhotos;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (loading && !beforePhotos.length && !afterPhotos.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-12 text-center">
          <FaSpinner className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Before/After Photos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {appointment?.customer_name || 'Customer'} - {appointment?.service_name || 'Service'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('before')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center ${
                activeTab === 'before'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCamera className="mr-2" /> Before ({beforePhotos.length})
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center ${
                activeTab === 'after'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCheck className="mr-2" /> After ({afterPhotos.length})
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center ${
                activeTab === 'compare'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaImages className="mr-2" /> Compare
            </button>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                <FaUpload className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload {activeTab === 'before' ? 'Before' : 'After'} Photos
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <div>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="mr-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="before">Before</option>
                  <option value="after">After</option>
                </select>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block text-sm">
                  <FaUpload className="inline mr-2" />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadPhotos(e, uploadType)}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <FaSpinner className="inline ml-2 text-purple-600 animate-spin" />
                )}
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          {activeTab !== 'compare' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getPhotos().length > 0 ? (
                getPhotos().map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square"
                  >
                    <img
                      src={photo.url || photo.thumbnail_url || photo}
                      alt={photo.caption || 'Service photo'}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedPhoto(photo)}
                        className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {photo.is_primary && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                          Primary
                        </span>
                      )}
                      <button
                        onClick={() => deletePhoto(photo.id, activeTab)}
                        className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    {!photo.is_primary && (
                      <button
                        onClick={() => setPrimaryPhoto(photo.id, activeTab)}
                        className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-700"
                      >
                        Set Primary
                      </button>
                    )}
                    {photo.uploaded_at && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FaImage className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No {activeTab} photos uploaded yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Upload photos to track the service progress
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Compare View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                  Before
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
                  {beforePhotos.length > 0 ? (
                    <img
                      src={beforePhotos[0]?.url || beforePhotos[0]}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">No before photos</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {beforePhotos.length} photo{beforePhotos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                  After
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center overflow-hidden">
                  {afterPhotos.length > 0 ? (
                    <img
                      src={afterPhotos[0]?.url || afterPhotos[0]}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">No after photos</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {afterPhotos.length} photo{afterPhotos.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Photo Viewer Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <FaTimes className="w-6 h-6" />
              </button>
              <img
                src={selectedPhoto.url || selectedPhoto}
                alt={selectedPhoto.caption || 'Service photo'}
                className="w-full h-full object-contain"
              />
              {selectedPhoto.caption && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
                  {selectedPhoto.caption}
                </div>
              )}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    window.open(selectedPhoto.url || selectedPhoto, '_blank');
                  }}
                  className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <FaDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeforeAfterPhotos;