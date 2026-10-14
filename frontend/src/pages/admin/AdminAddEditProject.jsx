import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X, ArrowLeft, Image as ImageIcon, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';

export default function AdminAddEditProject() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location: '',
    house_type: 'Luxury Villa',
    built_up_area_sqft: '',
    number_of_floors: 2,
    construction_cost: '',
    start_date: '',
    completion_date: '',
    status: 'Ongoing',
    is_featured: false,
    is_published: true,
    main_image_url: '',
    main_image_public_id: ''
  });

  // Local file selection state for real computer upload
  const [selectedMainFile, setSelectedMainFile] = useState(null);
  const [mainPreviewUrl, setMainPreviewUrl] = useState('');

  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]); // Array of { file, previewUrl, caption }
  const [existingGallery, setExistingGallery] = useState([]); // If editing

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If edit mode, load existing project data
  useEffect(() => {
    if (isEdit) {
      async function loadProject() {
        try {
          const res = await api.get(`/projects/${id}`);
          if (res.data.success) {
            const p = res.data.project;
            setFormData({
              title: p.title || '',
              slug: p.slug || '',
              description: p.description || '',
              location: p.location || '',
              house_type: p.house_type || 'Luxury Villa',
              built_up_area_sqft: p.built_up_area_sqft || '',
              number_of_floors: p.number_of_floors || 2,
              construction_cost: p.construction_cost || '',
              start_date: p.start_date ? p.start_date.split('T')[0] : '',
              completion_date: p.completion_date ? p.completion_date.split('T')[0] : '',
              status: p.status || 'Ongoing',
              is_featured: Boolean(p.is_featured),
              is_published: p.is_published !== undefined ? Boolean(p.is_published) : true,
              main_image_url: p.main_image_url || '',
              main_image_public_id: p.main_image_public_id || ''
            });
            setMainPreviewUrl(p.main_image_url || '');
            setExistingGallery(p.images || []);
          }
        } catch (err) {
          setErrorMsg('Failed to load project details for editing.');
        }
      }
      loadProject();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Main Image selection from computer
  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB.');
      return;
    }

    setSelectedMainFile(file);
    setMainPreviewUrl(URL.createObjectURL(file));
  };

  // Gallery multi-image selection from computer
  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: ''
    }));

    setGalleryPreviews([...galleryPreviews, ...newItems]);
  };

  const removeGalleryPreview = (index) => {
    const updated = [...galleryPreviews];
    URL.revokeObjectURL(updated[index].previewUrl);
    updated.splice(index, 1);
    setGalleryPreviews(updated);
  };

  const removeExistingGallery = (index) => {
    const updated = [...existingGallery];
    updated.splice(index, 1);
    setExistingGallery(updated);
  };

  // Handle Form Submission with Real Image Upload to Cloudinary / Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.description || !formData.location || !formData.built_up_area_sqft || !formData.construction_cost) {
      return setErrorMsg('Please fill in all mandatory fields.');
    }

    if (!isEdit && !selectedMainFile && !formData.main_image_url) {
      return setErrorMsg('Please select a main project photograph to upload.');
    }

    setLoading(true);

    try {
      let finalMainUrl = formData.main_image_url;
      let finalMainPublicId = formData.main_image_public_id;

      // 1. Upload main image if a new file was chosen from disk
      if (selectedMainFile) {
        setUploadProgress('Uploading main photograph to media storage...');
        const mainForm = new FormData();
        mainForm.append('images', selectedMainFile);

        const uploadRes = await api.post('/projects/admin/upload', mainForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success && uploadRes.data.images.length > 0) {
          finalMainUrl = uploadRes.data.images[0].url;
          finalMainPublicId = uploadRes.data.images[0].public_id;
        }
      }

      // 2. Upload any additional gallery images selected from disk
      let uploadedGalleryItems = [];
      if (galleryPreviews.length > 0) {
        setUploadProgress(`Uploading ${galleryPreviews.length} gallery image(s)...`);
        const galleryForm = new FormData();
        galleryPreviews.forEach((item) => {
          galleryForm.append('images', item.file);
        });

        const gUploadRes = await api.post('/projects/admin/upload', galleryForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (gUploadRes.data.success) {
          uploadedGalleryItems = gUploadRes.data.images.map((img, i) => ({
            image_url: img.url,
            public_id: img.public_id,
            caption: galleryPreviews[i]?.caption || ''
          }));
        }
      }

      // Merge with existing gallery if in edit mode
      const allGalleryImages = [
        ...existingGallery.map((g) => ({ image_url: g.image_url, public_id: g.public_id, caption: g.caption })),
        ...uploadedGalleryItems
      ];

      setUploadProgress('Saving project record to database...');

      const payload = {
        ...formData,
        main_image_url: finalMainUrl,
        main_image_public_id: finalMainPublicId,
        gallery_images: allGalleryImages
      };

      if (isEdit) {
        await api.put(`/projects/admin/${id}`, payload);
      } else {
        await api.post('/projects/admin/create', payload);
      }

      navigate('/admin/projects');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save project. Please check inputs and media.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gray-600)', fontSize: '0.9rem', fontWeight: 500 }}>
          <ArrowLeft size={16} />
          <span>Back to Projects List</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-navy)', marginBottom: '0.35rem', fontWeight: 800 }}>
          {isEdit ? 'Edit Residential Project' : 'Add New Residential Project'}
        </h1>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Upload actual photographs, pricing specifications, location details, and construction status.
        </p>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                name="title"
                required
                className="form-input"
                placeholder="e.g. The Grand Sovereign Villa"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug (Optional)</label>
              <input
                type="text"
                name="slug"
                className="form-input"
                placeholder="the-grand-sovereign-villa"
                value={formData.slug}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Location (City / Area) *</label>
              <input
                type="text"
                name="location"
                required
                className="form-input"
                placeholder="e.g. Anna Nagar West, Chennai"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">House Type *</label>
              <select name="house_type" className="form-select" value={formData.house_type} onChange={handleChange}>
                <option value="Luxury Villa">Luxury Villa</option>
                <option value="Duplex House">Duplex House</option>
                <option value="Independent 3BHK">Independent 3BHK</option>
                <option value="Independent 4BHK">Independent 4BHK</option>
                <option value="Contemporary Home">Contemporary Home</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Construction Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {/* Section 2: Dimensions & Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Built-up Area (Sq.Ft.) *</label>
              <input
                type="number"
                name="built_up_area_sqft"
                required
                className="form-input"
                placeholder="e.g. 3450"
                value={formData.built_up_area_sqft}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Construction Cost (₹) *</label>
              <input
                type="number"
                name="construction_cost"
                required
                className="form-input"
                placeholder="e.g. 8500000"
                value={formData.construction_cost}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Floors</label>
              <input
                type="number"
                name="number_of_floors"
                min="1"
                max="5"
                className="form-input"
                value={formData.number_of_floors}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 3: Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Commencement Date</label>
              <input
                type="date"
                name="start_date"
                className="form-input"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Completion / Expected Handover Date</label>
              <input
                type="date"
                name="completion_date"
                className="form-input"
                value={formData.completion_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 4: Description */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Project Description *</label>
            <textarea
              name="description"
              required
              className="form-textarea"
              style={{ minHeight: '120px' }}
              placeholder="Detailed architectural specifications, structural foundation used, steel and cement brands, interior features..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Section 5: REAL IMAGE UPLOADS */}
          <div style={{ padding: '1.75rem', backgroundColor: 'var(--color-bg-light)', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} style={{ color: 'var(--color-gold)' }} />
              <span>Project Photographs & Media</span>
            </h3>

            {/* Main Featured Photo */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Main Exterior Elevation Photograph *</label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainFileChange}
                  style={{ display: 'none' }}
                  id="main-photo-input"
                />
                <label
                  htmlFor="main-photo-input"
                  className="btn btn-outline-gold btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Upload size={16} />
                  <span>Select Image from Computer</span>
                </label>

                {mainPreviewUrl && (
                  <div style={{ position: 'relative', width: '160px', height: '110px', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={mainPreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Gallery Photos */}
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>Additional Site & Interior Photographs</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryFilesChange}
                style={{ display: 'none' }}
                id="gallery-photos-input"
              />
              <label
                htmlFor="gallery-photos-input"
                className="btn btn-navy btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
              >
                <Upload size={16} />
                <span>Add Gallery Images</span>
              </label>

              {/* Previews of newly selected gallery photos */}
              {galleryPreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                  {galleryPreviews.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={p.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeGalleryPreview(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing gallery thumbnails if editing */}
              {existingGallery.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)', display: 'block', marginBottom: '0.5rem' }}>Currently Saved Gallery Photos:</span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {existingGallery.map((eg, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '90px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <img src={eg.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeExistingGallery(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: '#EF4444',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Settings Toggles */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Publish Live on Website</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Feature on Homepage</span>
            </label>
          </div>

          {/* Submission Button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              <Save size={18} />
              <span>{loading ? uploadProgress || 'Saving Project...' : isEdit ? 'Update Project' : 'Create & Publish Project'}</span>
            </button>
            <Link to="/admin/projects" className="btn btn-outline-gold">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
