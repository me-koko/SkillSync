import { SkillLevel, SkillType } from '@prisma/client';

export interface UserMatchProfile {
  id: string;
  fullName: string;
  college: string;
  course: string;
  yearOfStudy: string;
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  learningFormat: string | null;
  learningStyle: string | null;
  skills: Array<{
    type: SkillType;
    level: SkillLevel;
    skill: { id: string; name: string; category: string };
  }>;
  interests: Array<{
    interest: { id: string; name: string; category: string | null };
  }>;
  availabilities: Array<{
    dayOfWeek: string;
    timeSlot: string;
    preference: string;
  }>;
}

export interface MatchResult {
  score: number;
  reasons: string[];
  mutualSkills: {
    youTeachTheyLearn: string[];
    theyTeachYouLearn: string[];
  };
  sharedInterests: string[];
  sharedAvailability: string[];
  compatibleFormat: boolean;
}

export class MatchingService {
  /**
   * Calculate deterministic compatibility score (0 - 100) between userA (current user) and userB (candidate)
   */
  static calculateCompatibility(userA: UserMatchProfile, userB: UserMatchProfile): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // 1. Skill Complementarity
    // Skills A teaches and B wants to learn
    const aTeaches = userA.skills
      .filter((s) => s.type === SkillType.TEACH)
      .map((s) => ({ name: s.skill.name.toLowerCase(), original: s.skill.name, level: s.level }));

    const aLearns = userA.skills
      .filter((s) => s.type === SkillType.LEARN)
      .map((s) => ({ name: s.skill.name.toLowerCase(), original: s.skill.name, level: s.level }));

    const bTeaches = userB.skills
      .filter((s) => s.type === SkillType.TEACH)
      .map((s) => ({ name: s.skill.name.toLowerCase(), original: s.skill.name, level: s.level }));

    const bLearns = userB.skills
      .filter((s) => s.type === SkillType.LEARN)
      .map((s) => ({ name: s.skill.name.toLowerCase(), original: s.skill.name, level: s.level }));

    // You teach -> they learn
    const youTeachTheyLearn: string[] = [];
    for (const t of aTeaches) {
      if (bLearns.some((l) => l.name === t.name)) {
        youTeachTheyLearn.push(t.original);
      }
    }

    // They teach -> you learn
    const theyTeachYouLearn: string[] = [];
    for (const t of bTeaches) {
      if (aLearns.some((l) => l.name === t.name)) {
        theyTeachYouLearn.push(t.original);
      }
    }

    // Two-way exchange matches
    if (youTeachTheyLearn.length > 0 && theyTeachYouLearn.length > 0) {
      score += 45;
      reasons.push(`Perfect reciprocal skill exchange: You teach ${youTeachTheyLearn.slice(0, 2).join(', ')} & learn ${theyTeachYouLearn.slice(0, 2).join(', ')}`);
    } else if (youTeachTheyLearn.length > 0) {
      score += 25;
      reasons.push(`You can teach them: ${youTeachTheyLearn.slice(0, 2).join(', ')}`);
    } else if (theyTeachYouLearn.length > 0) {
      score += 25;
      reasons.push(`They can teach you: ${theyTeachYouLearn.slice(0, 2).join(', ')}`);
    }

    // 2. Skill Level Synergy
    // If teacher is at least intermediate or advanced
    const expertOrAdvancedTeacher = bTeaches.some(
      (t) => (t.level === SkillLevel.ADVANCED || t.level === SkillLevel.EXPERT) &&
             aLearns.some((l) => l.name === t.name)
    );
    if (expertOrAdvancedTeacher) {
      score += 10;
      reasons.push('High teacher proficiency in your target learning skill');
    }

    // 3. Shared Academic & Personal Interests
    const aInterests = new Set(userA.interests.map((i) => i.interest.name.toLowerCase()));
    const sharedInterests: string[] = [];
    for (const i of userB.interests) {
      if (aInterests.has(i.interest.name.toLowerCase())) {
        sharedInterests.push(i.interest.name);
      }
    }

    if (sharedInterests.length > 0) {
      const interestPoints = Math.min(15, sharedInterests.length * 5);
      score += interestPoints;
      reasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
    }

    // 4. Availability Overlap (Day + Time Slot)
    const aSlots = new Set(
      userA.availabilities.map((a) => `${a.dayOfWeek.toLowerCase()}-${a.timeSlot.toLowerCase()}`)
    );
    const sharedAvailability: string[] = [];

    for (const bAvail of userB.availabilities) {
      const key = `${bAvail.dayOfWeek.toLowerCase()}-${bAvail.timeSlot.toLowerCase()}`;
      if (aSlots.has(key)) {
        sharedAvailability.push(`${bAvail.dayOfWeek} ${bAvail.timeSlot}`);
      }
    }

    if (sharedAvailability.length > 0) {
      score += 15;
      reasons.push(`Matching availability: ${sharedAvailability.slice(0, 2).join(', ')}`);
    }

    // 5. Learning Format Alignment (e.g., both prefer One-on-one or Small group)
    let compatibleFormat = false;
    if (userA.learningFormat && userB.learningFormat && userA.learningFormat === userB.learningFormat) {
      score += 10;
      compatibleFormat = true;
      reasons.push(`Both prefer ${userA.learningFormat} sessions`);
    }

    // 6. Learning Style Alignment (e.g., Structured vs Casual)
    if (userA.learningStyle && userB.learningStyle && userA.learningStyle === userB.learningStyle) {
      score += 5;
      reasons.push(`Both prefer ${userA.learningStyle.toLowerCase()} learning rhythm`);
    }

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));

    if (reasons.length === 0) {
      reasons.push('Open to peer learning and skill exploration');
    }

    return {
      score: finalScore,
      reasons,
      mutualSkills: {
        youTeachTheyLearn,
        theyTeachYouLearn,
      },
      sharedInterests,
      sharedAvailability,
      compatibleFormat,
    };
  }
}
