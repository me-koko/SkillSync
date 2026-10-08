import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all demo data and initializing empty SkillSync state...');

  // 1. Delete all demo user-generated content and cases
  await prisma.review.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.studyRoom.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.studyGroup.deleteMany();
  await prisma.skillExchange.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.userInterest.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.user.deleteMany();

  console.log('All demo users, study groups, study rooms, tasks, messages, exchanges, and connections have been completely removed.');

  // 2. Ensure base reference Skill taxonomy exists for user onboarding & search
  const skillsData = [
    { name: 'React', category: 'Programming' },
    { name: 'C++', category: 'Programming' },
    { name: 'Python', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'JavaScript', category: 'Programming' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'Tailwind CSS', category: 'Programming' },
    { name: 'Competitive Programming', category: 'Programming' },
    { name: 'UI/UX', category: 'Design' },
    { name: 'Design Systems', category: 'Design' },
    { name: 'Public Speaking', category: 'Soft Skills' },
    { name: 'Guitar', category: 'Music' },
    { name: 'Mathematics', category: 'Academics' },
    { name: 'Statistics', category: 'Academics' },
    { name: 'Photography', category: 'Creative' },
    { name: 'Japanese', category: 'Language' },
    { name: 'Data Structures', category: 'Programming' },
  ];

  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  // 3. Ensure base reference Interest taxonomy exists
  const interestsData = [
    { name: 'Web Development', category: 'Tech' },
    { name: 'Design Systems', category: 'Design' },
    { name: 'Human-Computer Interaction', category: 'Tech' },
    { name: 'Open Source', category: 'Tech' },
    { name: 'Applied Math', category: 'Academics' },
    { name: 'Data Science', category: 'Tech' },
    { name: 'Algorithmic Thinking', category: 'Tech' },
    { name: 'Music', category: 'Arts' },
    { name: 'Algorithms', category: 'Tech' },
    { name: 'Low-level Systems', category: 'Tech' },
    { name: 'Gaming', category: 'Lifestyle' },
    { name: 'Traveling', category: 'Lifestyle' },
    { name: 'Linguistics', category: 'Humanities' },
    { name: 'Global Affairs', category: 'Social' },
    { name: 'Debating', category: 'Soft Skills' },
    { name: 'Literature', category: 'Arts' },
    { name: 'Visual Arts', category: 'Arts' },
    { name: 'Acoustic Music', category: 'Music' },
    { name: 'Street Photography', category: 'Arts' },
    { name: 'Portfolio Design', category: 'Design' },
  ];

  for (const i of interestsData) {
    await prisma.interest.upsert({
      where: { name: i.name },
      update: {},
      create: i,
    });
  }

  console.log('SkillSync initialized with 0 demo cases. Ready for real users to register and collaborate!');
}

main()
  .catch((e) => {
    console.error('Error executing seed cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
