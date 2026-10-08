import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { Input, Textarea, Select } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { SkillLevel } from '../types';

const defaultSkillSuggestions = [
  'React',
  'C++',
  'Python',
  'Java',
  'UI/UX',
  'Public Speaking',
  'Guitar',
  'Mathematics',
  'Photography',
  'Japanese',
];

const defaultInterestSuggestions = [
  'Web Development',
  'Data Science',
  'Algorithms',
  'Design Systems',
  'Applied Math',
  'Music',
  'Global Affairs',
  'Literature',
  'Gaming',
  'Visual Arts',
];

export const OnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Profile
  const [bio, setBio] = useState(user?.bio || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Step 2: Skills I can teach
  const [teachSkills, setTeachSkills] = useState<Array<{ name: string; level: SkillLevel }>>([]);
  const [customTeach, setCustomTeach] = useState('');
  const [customTeachLevel, setCustomTeachLevel] = useState<SkillLevel>('INTERMEDIATE');

  // Step 3: Skills I want to learn
  const [learnSkills, setLearnSkills] = useState<Array<{ name: string; level: SkillLevel }>>([]);
  const [customLearn, setCustomLearn] = useState('');
  const [customLearnLevel, setCustomLearnLevel] = useState<SkillLevel>('BEGINNER');

  // Step 4: Interests
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  // Step 5: Availability
  const [availabilities, setAvailabilities] = useState<
    Array<{ dayOfWeek: string; timeSlot: string; preference: string }>
  >([]);
  const [newDay, setNewDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('Evening');
  const [newPref, setNewPref] = useState('ONLINE');

  // Step 6: Learning Preferences
  const [learningFormat, setLearningFormat] = useState('One-on-one');
  const [learningStyle, setLearningStyle] = useState('Structured');

  // Skill Add Handlers
  const addTeachSkill = (name: string, level: SkillLevel = 'INTERMEDIATE') => {
    if (!name.trim()) return;
    if (teachSkills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) return;
    setTeachSkills([...teachSkills, { name: name.trim(), level }]);
    setCustomTeach('');
  };

  const removeTeachSkill = (index: number) => {
    setTeachSkills(teachSkills.filter((_, i) => i !== index));
  };

  const addLearnSkill = (name: string, level: SkillLevel = 'BEGINNER') => {
    if (!name.trim()) return;
    if (learnSkills.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) return;
    setLearnSkills([...learnSkills, { name: name.trim(), level }]);
    setCustomLearn('');
  };

  const removeLearnSkill = (index: number) => {
    setLearnSkills(learnSkills.filter((_, i) => i !== index));
  };

  // Interest Add Handlers
  const toggleInterest = (name: string) => {
    if (interests.includes(name)) {
      setInterests(interests.filter((i) => i !== name));
    } else {
      setInterests([...interests, name]);
    }
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    if (!interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
    }
    setCustomInterest('');
  };

  // Availability Handlers
  const addAvailability = () => {
    if (
      availabilities.some(
        (a) => a.dayOfWeek === newDay && a.timeSlot === newSlot
      )
    ) {
      return;
    }
    setAvailabilities([...availabilities, { dayOfWeek: newDay, timeSlot: newSlot, preference: newPref }]);
  };

  const removeAvailability = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  // Finish Onboarding
  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      await userService.completeOnboarding({
        bio,
        headline,
        avatarUrl,
        teachSkills,
        learnSkills,
        interests,
        availabilities,
        learningFormat,
        learningStyle,
      });

      await refreshUser();
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-2xl mx-auto w-full">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Step {step} of 7</span>
            <span>
              {step === 1 && 'Basic Profile'}
              {step === 2 && 'Skills I Can Teach'}
              {step === 3 && 'Skills I Want to Learn'}
              {step === 4 && 'Interests'}
              {step === 5 && 'Availability'}
              {step === 6 && 'Learning Style'}
              {step === 7 && 'Profile Preview'}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-elevation p-6 sm:p-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Set Up Your Profile</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Introduce yourself to other students on SkillSync.
                </p>
              </div>

              <Input
                label="Headline"
                placeholder="e.g. Frontend Enthusiast & UI Designer | 3rd Year CS"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />

              <Textarea
                label="Bio / Introduction"
                placeholder="Share a bit about what you enjoy learning, personal projects, or your learning goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />

              <Input
                label="Profile Picture URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                hint="You can paste an image link or leave blank to use your name initials."
              />
            </div>
          )}

          {/* STEP 2: Skills I Can Teach */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Skills I Can Teach</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select what you feel comfortable mentoring or sharing with peers.
                </p>
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {defaultSkillSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTeachSkill(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        teachSkills.some((ts) => ts.name.toLowerCase() === s.toLowerCase())
                          ? 'bg-teal-600 text-white border-teal-600 font-medium'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 block mb-2">Add Custom Skill</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Organic Chemistry, Rust"
                    value={customTeach}
                    onChange={(e) => setCustomTeach(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white"
                  />
                  <select
                    value={customTeachLevel}
                    onChange={(e) => setCustomTeachLevel(e.target.value as SkillLevel)}
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addTeachSkill(customTeach, customTeachLevel)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Current List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Your Teaching Skills:</span>
                {teachSkills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                      <Badge variant="teal" size="sm">
                        {s.level}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeachSkill(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Skills I Want to Learn */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Skills I Want to Learn</h3>
                <p className="text-xs text-slate-500 mt-1">
                  What subjects or technologies would you like another student to mentor you in?
                </p>
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {defaultSkillSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addLearnSkill(s)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        learnSkills.some((ls) => ls.name.toLowerCase() === s.toLowerCase())
                          ? 'bg-blue-600 text-white border-blue-600 font-medium'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 block mb-2">Add Custom Skill</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Kotlin, Japanese N4, Discrete Math"
                    value={customLearn}
                    onChange={(e) => setCustomLearn(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white"
                  />
                  <select
                    value={customLearnLevel}
                    onChange={(e) => setCustomLearnLevel(e.target.value as SkillLevel)}
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                  >
                    <option value="BEGINNER">Beginner Target</option>
                    <option value="INTERMEDIATE">Intermediate Target</option>
                    <option value="ADVANCED">Advanced Target</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addLearnSkill(customLearn, customLearnLevel)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Current List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Your Learning Goals:</span>
                {learnSkills.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                      <Badge variant="blue" size="sm">
                        Target: {s.level}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLearnSkill(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Interests */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Academic & Personal Interests</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting over common interests boosts compatibility scores!
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {defaultInterestSuggestions.map((item) => {
                  const selected = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add another interest (e.g. Competitive Programming)"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs"
                />
                <Button type="button" size="sm" onClick={addCustomInterest}>
                  Add Interest
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Your Availability</h3>
                <p className="text-xs text-slate-500 mt-1">
                  When are you generally free to collaborate or hold study sessions?
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Add Availability Slot</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option value="Morning">Morning (8 AM - 12 PM)</option>
                    <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="Evening">Evening (5 PM - 9 PM)</option>
                    <option value="Night">Night (9 PM+)</option>
                  </select>

                  <select
                    value={newPref}
                    onChange={(e) => setNewPref(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="IN_PERSON">In-person</option>
                    <option value="BOTH">Either / Both</option>
                  </select>
                </div>
                <Button type="button" size="sm" onClick={addAvailability}>
                  + Add Free Time Slot
                </Button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Selected Times:</span>
                {availabilities.map((a, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  >
                    <span className="font-semibold text-slate-800">
                      {a.dayOfWeek} • {a.timeSlot} ({a.preference})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAvailability(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Learning Preferences */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Learning Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">
                  How do you prefer collaborating and pacing your learning?
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Session Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['One-on-one', 'Small group', 'Large group'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setLearningFormat(f)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        learningFormat === f
                          ? 'bg-teal-50 border-teal-600 text-teal-800 ring-2 ring-teal-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Learning Rhythm
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Structured Learning', desc: 'Weekly schedule, milestones, syllabus' },
                    { label: 'Casual Learning', desc: 'Flexible, project-driven, as-needed Q&A' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setLearningStyle(s.label.split(' ')[0])}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        learningStyle.toLowerCase() === s.label.split(' ')[0].toLowerCase()
                          ? 'bg-teal-50 border-teal-600 text-teal-800 ring-2 ring-teal-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{s.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Profile Preview */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Profile Preview</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Here is how you will appear to other students on the Discover page.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar src={avatarUrl} name={user?.fullName || 'User'} size="lg" isOnline={true} />
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{user?.fullName}</h4>
                    <p className="text-xs text-slate-500">
                      {user?.college} • {user?.course} ({user?.yearOfStudy})
                    </p>
                    {headline && <p className="text-xs text-teal-700 font-medium mt-1">{headline}</p>}
                  </div>
                </div>

                {bio && <p className="text-xs text-slate-600 mb-4">{bio}</p>}

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Can Teach
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {teachSkills.map((s, idx) => (
                        <Badge key={idx} variant="teal" size="sm">
                          {s.name} ({s.level.slice(0, 3)})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Wants to Learn
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {learnSkills.map((s, idx) => (
                        <Badge key={idx} variant="blue" size="sm">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Preferences
                    </span>
                    <p className="text-xs text-slate-600">
                      Format: {learningFormat} • Style: {learningStyle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setStep(step + 1)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleComplete}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Complete & Enter SkillSync
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
