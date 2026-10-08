import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Users,
  BookOpen,
  Edit,
  Shield,
  MessageSquare,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';
import { User, Review } from '../types';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input, Textarea, Select } from '../components/common/Input';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const profileUserId = id || currentUser?.id;
  const isSelf = currentUser?.id === profileUserId;

  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ average: number | null; count: number }>({
    average: null,
    count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editPrivacy, setEditPrivacy] = useState('PUBLIC');
  const [editFormat, setEditFormat] = useState('One-on-one');
  const [editStyle, setEditStyle] = useState('Structured');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profileUserId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile(profileUserId);
        setProfile(data);
        setEditBio(data.bio || '');
        setEditHeadline(data.headline || '');
        setEditPrivacy(data.privacySetting || 'PUBLIC');
        setEditFormat(data.learningFormat || 'One-on-one');
        setEditStyle(data.learningStyle || 'Structured');

        const reviewData = await reviewService.getReviewsForUser(profileUserId);
        setReviews(reviewData.reviews);
        setRatingSummary({
          average: reviewData.averageRating,
          count: reviewData.count,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileUserId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await userService.updateProfile({
        bio: editBio,
        headline: editHeadline,
        privacySetting: editPrivacy,
        learningFormat: editFormat,
        learningStyle: editStyle,
      });

      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      if (isSelf) updateCurrentUser(updated);
      setIsEditOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading student profile..." />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-900">Student Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This profile might be private or does not exist.
        </p>
        <Button onClick={() => navigate('/discover')} size="sm">
          Back to Discover
        </Button>
      </div>
    );
  }

  const teachSkills = profile.skills?.filter((s) => s.type === 'TEACH') || [];
  const learnSkills = profile.skills?.filter((s) => s.type === 'LEARN') || [];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar src={profile.avatarUrl} name={profile.fullName} size="xl" isOnline={true} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                <Badge variant={profile.privacySetting === 'PUBLIC' ? 'teal' : 'amber'} size="sm">
                  {profile.privacySetting === 'PUBLIC' ? 'Public' : 'Connections Only'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {profile.college}
                </span>
                <span>•</span>
                <span>
                  {profile.course} ({profile.yearOfStudy})
                </span>
              </div>

              {profile.headline && (
                <p className="text-sm text-teal-700 font-medium mt-2">{profile.headline}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setIsEditOpen(true)}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/messages/${profile.id}`)}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/exchanges')}
                  leftIcon={<Repeat className="w-4 h-4" />}
                >
                  Propose Exchange
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h4>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">{profile.bio}</p>
          </div>
        )}

        {/* Stats strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xl font-bold text-slate-900 block">
              {(profile._count?.sentConnections || 0) + (profile._count?.receivedConnections || 0)}
            </span>
            <span className="text-xs text-slate-500">Connections</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xl font-bold text-slate-900 block">
              {profile._count?.groupMemberships || 0}
            </span>
            <span className="text-xs text-slate-500">Study Groups</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xl font-bold text-teal-600 block">
              {ratingSummary.average ? `${ratingSummary.average} ★` : 'New'}
            </span>
            <span className="text-xs text-slate-500">Rating ({ratingSummary.count})</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xl font-bold text-slate-900 block">{teachSkills.length}</span>
            <span className="text-xs text-slate-500">Skills Teaching</span>
          </div>
        </div>
      </div>

      {/* Skills & Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills I Can Teach */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Skills I Can Teach</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {teachSkills.length === 0 ? (
              <p className="text-xs text-slate-400">No skills listed yet.</p>
            ) : (
              teachSkills.map((s) => (
                <div
                  key={s.id}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{s.skill.name}</span>
                  <span className="text-[10px] text-teal-600 font-normal">({s.level})</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Skills I Want to Learn</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {learnSkills.length === 0 ? (
              <p className="text-xs text-slate-400">No learning skills listed yet.</p>
            ) : (
              learnSkills.map((s) => (
                <div
                  key={s.id}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{s.skill.name}</span>
                  <span className="text-[10px] text-blue-600 font-normal">(Target: {s.level})</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interests & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Interests & Topics</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests?.length === 0 ? (
              <p className="text-xs text-slate-400">No interests specified.</p>
            ) : (
              profile.interests?.map((i) => (
                <Badge key={i.id} variant="indigo" size="md">
                  {i.interest.name}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Availability & Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Availability & Preferences</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-[10px]">
                Free Hours:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.availabilities?.length === 0 ? (
                  <span className="italic">Flexible schedule</span>
                ) : (
                  profile.availabilities?.map((a) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {a.dayOfWeek} • {a.timeSlot} ({a.preference})
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">
                Format Preference:
              </span>
              <p className="font-medium text-slate-800">
                {profile.learningFormat || 'One-on-one'} • {profile.learningStyle || 'Structured'} rhythm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Peer Reviews & Testimonials</h3>
            <p className="text-xs text-slate-500">
              Feedback from students who completed skill exchanges with {profile.fullName.split(' ')[0]}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{ratingSummary.average ? `${ratingSummary.average} / 5.0` : 'No reviews'}</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No reviews yet. Complete a skill exchange to receive your first peer endorsement!
          </p>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={r.reviewer.avatarUrl} name={r.reviewer.fullName} size="sm" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{r.reviewer.fullName}</h5>
                      <p className="text-[10px] text-slate-400">{r.reviewer.college}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{r.feedback}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile"
        subtitle="Update your headline, bio, and privacy settings"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Headline"
            value={editHeadline}
            onChange={(e) => setEditHeadline(e.target.value)}
            placeholder="e.g. Frontend Engineer & UI Designer"
          />

          <Textarea
            label="Bio"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            rows={4}
            placeholder="Tell fellow students about yourself..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Learning Format"
              value={editFormat}
              onChange={(e) => setEditFormat(e.target.value)}
              options={[
                { label: 'One-on-one', value: 'One-on-one' },
                { label: 'Small group', value: 'Small group' },
                { label: 'Large group', value: 'Large group' },
              ]}
            />

            <Select
              label="Learning Style"
              value={editStyle}
              onChange={(e) => setEditStyle(e.target.value)}
              options={[
                { label: 'Structured', value: 'Structured' },
                { label: 'Casual', value: 'Casual' },
              ]}
            />
          </div>

          <Select
            label="Profile Privacy"
            value={editPrivacy}
            onChange={(e) => setEditPrivacy(e.target.value)}
            options={[
              { label: 'Public (Visible to all students)', value: 'PUBLIC' },
              { label: 'Connections Only', value: 'CONNECTIONS_ONLY' },
              { label: 'Private', value: 'PRIVATE' },
            ]}
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
