import React, { useState } from 'react';
import { Settings, Shield, Bell, User, Check, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Input';

export const SettingsPage: React.FC = () => {
  const { user, updateCurrentUser, logout } = useAuth();

  const [privacySetting, setPrivacySetting] = useState(user?.privacySetting || 'PUBLIC');
  const [learningFormat, setLearningFormat] = useState(user?.learningFormat || 'One-on-one');
  const [learningStyle, setLearningStyle] = useState(user?.learningStyle || 'Structured');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      const updated = await userService.updateProfile({
        privacySetting,
        learningFormat,
        learningStyle,
      });

      updateCurrentUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" />
          <span>Account & Privacy Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your student visibility, collaborative preferences, and account credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Profile Visibility & Privacy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Profile Visibility & Campus Privacy</span>
          </div>

          <Select
            label="Who can see your profile on Discover?"
            value={privacySetting}
            onChange={(e) => setPrivacySetting(e.target.value)}
            options={[
              { label: 'Public — Visible to all verified college students', value: 'PUBLIC' },
              { label: 'Connections Only — Hidden from search, visible to connected peers', value: 'CONNECTIONS_ONLY' },
              { label: 'Private — Only visible to you', value: 'PRIVATE' },
            ]}
          />
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <User className="w-4 h-4 text-teal-600" />
            <span>Collaborative Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Format"
              value={learningFormat}
              onChange={(e) => setLearningFormat(e.target.value)}
              options={[
                { label: 'One-on-one sessions', value: 'One-on-one' },
                { label: 'Small group study', value: 'Small group' },
                { label: 'Large study circle', value: 'Large group' },
              ]}
            />

            <Select
              label="Learning Rhythm"
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              options={[
                { label: 'Structured — Weekly milestones & agenda', value: 'Structured' },
                { label: 'Casual — Flexible and project-based', value: 'Casual' },
              ]}
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Notification Preferences</span>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800">Connection & Message Alerts</p>
                <p className="text-[11px] text-slate-500">
                  Receive live alerts when students message or connect with you
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800">Study Session Reminders</p>
                <p className="text-[11px] text-slate-500">
                  Notify me 15 minutes before scheduled exchange sessions
                </p>
              </div>
              <input
                type="checkbox"
                checked={sessionReminders}
                onChange={(e) => setSessionReminders(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>

          <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
