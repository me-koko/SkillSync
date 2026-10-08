import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Repeat,
  Users,
  CheckCircle2,
  CheckSquare,
  BookOpen,
  MessageSquare,
  Star,
  Compass,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-teal-100/50 rounded-full blur-3xl" />
          <div className="w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-3xl -ml-40" />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>The College Student Peer-to-Peer Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Learn together. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800">
              Teach what you know.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            SkillSync connects students who want to learn, teach, collaborate, and grow together. Trade your skills, form study groups, and elevate your learning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="w-full sm:w-auto px-8"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              Explore Skills
            </Button>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Free for students
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Rule-based compatibility matching
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Campus study circles
            </span>
          </div>
        </div>
      </section>

      {/* How SkillSync Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-700 text-xs font-bold uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">How SkillSync Works</h2>
          <p className="text-sm text-slate-600 mt-2">
            Start collaborating in four simple steps designed around student schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Your Profile',
              desc: 'List the skills you can teach, skills you want to learn, and your free hours during the week.',
            },
            {
              step: '02',
              title: 'Discover Matches',
              desc: 'Our transparent rule-based algorithm ranks peers by mutual skill fit, interests, and free time.',
            },
            {
              step: '03',
              title: 'Propose an Exchange',
              desc: 'Agree on a schedule, set your format (online or library), and confirm your learning goals.',
            },
            {
              step: '04',
              title: 'Study & Collaborate',
              desc: 'Meet with your learning partner for scheduled bilateral sessions, shared notes, and task progress.',
            },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative">
              <span className="text-3xl font-black text-teal-600/20 block mb-3 font-mono">
                {s.step}
              </span>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-700 text-xs font-bold uppercase tracking-wider">Features Built for Students</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">Everything you need to collaborate</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Transparent Compatibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No black-box ML algorithms. See exactly why you matched with a peer based on skills, availability, and learning preferences.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Task & Study Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize personal study tasks and collaborative milestones with prioritized checklists and clear target dates.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Study Groups</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Form public or private subject circles like "DSA Grind" and "Japanese N5" to organize resources, discussions, and tasks.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Skill Exchange Agreements</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define what you teach, what you learn, and a weekly routine. Track active status, pause when exams hit, and complete.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Instant Real-Time Chat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Socket.IO with online status indicators, unread badges, and live typing notifications.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">Peer Reviews & Trust</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rate your exchange experience and leave genuine peer reviews to build a campus reputation as a reliable mentor.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-tr from-teal-700 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white shadow-elevation">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to teach what you know and learn what you need?
          </h2>
          <p className="text-teal-100 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Join fellow students on SkillSync. Form skill exchange partnerships, organize study circles, and elevate your learning together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="w-full sm:w-auto bg-white text-teal-800 hover:bg-teal-50 shadow-md"
            >
              Join SkillSync Today
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
