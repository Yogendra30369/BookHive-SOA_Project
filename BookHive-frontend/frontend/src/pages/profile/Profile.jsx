import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  LuUser,
  LuMail,
  LuPhone,
  LuCalendar,
  LuPencil,
  LuSave,
  LuX,
  LuShieldCheck,
  LuBookOpen,
  LuHistory,
  LuCircleCheck
} from 'react-icons/lu';
import './Profile.css';

const DEFAULT_USER = {
  name: "Sarah Jenkins",
  email: "s.jenkins@oxford.ac.uk",
  phone: "+44 1865 270000",
  role: "User",
  status: "Active",
  joined: "15 September 2024",
  activeLoans: 3,
  totalBorrowed: 7
};

export default function Profile() {
  const toast = useToast();
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('archivalia_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER,
          ...parsed,
          role: parsed.role || DEFAULT_USER.role
        };
      } catch (e) {}
    }
    return DEFAULT_USER;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone
  });

  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    });
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };
    setProfile(updated);
    localStorage.setItem('archivalia_user', JSON.stringify(updated));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    });
    setIsEditing(false);
  };

  return (
    <div className="clean-profile-page">
      {/* 1. Header Profile Card */}
      <div className="profile-header-card white-card">
        <div className="profile-header-left">
          <div className="profile-avatar-container">
            <LuUser size={34} className="profile-user-icon" />
            <span className="profile-online-badge" title="Active"></span>
          </div>

          <div className="profile-header-details">
            <h1 className="profile-name font-serif">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-meta-tags">
              <span className="status-tag active">
                <LuCircleCheck size={13} /> {profile.status}
              </span>
              <span className="role-tag">
                <LuUser size={13} /> {profile.role}
              </span>
              <span className="joined-tag">
                <LuCalendar size={13} /> Member since {profile.joined}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-header-right">
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-navy btn-sm"
              onClick={() => setIsEditing(true)}
            >
              <LuPencil size={15} /> Edit Profile
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCancelEdit}
            >
              <LuX size={15} /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* 2. Library Activity Summary */}
      <div className="profile-summary-grid">
        <div className="profile-summary-card white-card">
          <div className="summary-icon-box icon-books">
            <LuBookOpen size={20} />
          </div>
          <div>
            <span className="summary-card-label">ACTIVE LOANS</span>
            <div className="summary-card-value font-serif">{profile.activeLoans}</div>
            <span className="summary-card-sub">Books currently in reading</span>
          </div>
        </div>

        <div className="profile-summary-card white-card">
          <div className="summary-icon-box icon-history">
            <LuHistory size={20} />
          </div>
          <div>
            <span className="summary-card-label">TOTAL BORROWED</span>
            <div className="summary-card-value font-serif">{profile.totalBorrowed}</div>
            <span className="summary-card-sub">Resources read to date</span>
          </div>
        </div>

        <div className="profile-summary-card white-card">
          <div className="summary-icon-box icon-status">
            <LuShieldCheck size={20} />
          </div>
          <div>
            <span className="summary-card-label">ACCOUNT STATUS</span>
            <div className="summary-card-value font-serif" style={{ color: '#059669' }}>
              Good Standing
            </div>
            <span className="summary-card-sub">Full library borrowing rights</span>
          </div>
        </div>
      </div>

      {/* 3. Personal Information Card */}
      <div className="personal-info-card white-card">
        <div className="card-top-bar">
          <h2 className="card-main-title font-serif">Personal Information</h2>
          {isEditing && <span className="edit-indicator">Editing</span>}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-fields-row">
              <div className="form-group-item">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>PHONE NUMBER</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-btn-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-navy btn-sm">
                <LuSave size={15} /> Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="info-fields-table">
            <div className="info-field-row">
              <div className="info-field-label">
                <LuUser size={16} /> Full Name
              </div>
              <div className="info-field-val font-semibold">{profile.name}</div>
            </div>

            <div className="info-field-row">
              <div className="info-field-label">
                <LuMail size={16} /> Email Address
              </div>
              <div className="info-field-val">{profile.email}</div>
            </div>

            <div className="info-field-row">
              <div className="info-field-label">
                <LuPhone size={16} /> Phone Number
              </div>
              <div className="info-field-val">{profile.phone}</div>
            </div>

            <div className="info-field-row">
              <div className="info-field-label">
                <LuShieldCheck size={16} /> Account Role
              </div>
              <div className="info-field-val">{profile.role}</div>
            </div>

            <div className="info-field-row">
              <div className="info-field-label">
                <LuCalendar size={16} /> Member Since
              </div>
              <div className="info-field-val">{profile.joined}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
