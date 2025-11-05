// Mock learner data for demo purposes
// In production, this would come from a database

import { getAllChurches } from './churchHierarchy';

const churches = getAllChurches();

// Generate mock learners
export const generateMockLearners = () => {
  const learners = [];
  const firstNames = ["John", "Mary", "Peter", "Grace", "David", "Sarah", "James", "Ruth", "Joseph", "Esther", "Daniel", "Rebecca", "Samuel", "Rachel", "Paul", "Hannah", "Moses", "Leah", "Joshua", "Deborah", "Emmanuel", "Miriam", "Stephen", "Naomi", "Timothy"];
  const lastNames = ["Mwangi", "Ochieng", "Kimani", "Otieno", "Kamau", "Wanjiru", "Mutua", "Akinyi", "Kipchoge", "Chebet", "Omondi", "Njeri", "Kiprotich", "Adhiambo", "Koech", "Awuor", "Rotich", "Wairimu", "Bett", "Wangari"];
  
  const courses = ["discover", "believe", "guides"];
  const ageRanges = [
    { min: 18, max: 25 },
    { min: 26, max: 35 },
    { min: 36, max: 45 },
    { min: 46, max: 60 }
  ];

  let id = 1;
  
  churches.forEach(church => {
    const numLearners = Math.floor(Math.random() * 15) + 5;
    
    for (let i = 0; i < numLearners; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const ageRange = ageRanges[Math.floor(Math.random() * ageRanges.length)];
      const age = Math.floor(Math.random() * (ageRange.max - ageRange.min + 1)) + ageRange.min;
      
      const enrolledCourse = courses[Math.floor(Math.random() * courses.length)];
      const progress = Math.floor(Math.random() * 101);
      const graduated = progress === 100 && Math.random() > 0.3;
      
      const enrollmentDate = new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1);
      const lastActive = new Date(2025, 0, Math.floor(Math.random() * 27) + 1);
      
      learners.push({
        id: id++,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+254${Math.floor(Math.random() * 900000000) + 100000000}`,
        age,
        gender: Math.random() > 0.5 ? "Male" : "Female",
        churchId: church.id,
        churchName: church.name,
        conferenceId: church.conferenceId,
        conferenceName: church.conferenceName,
        unionId: church.unionId,
        unionName: church.unionName,
        county: church.county,
        enrolledCourse,
        progress,
        graduated,
        enrollmentDate: enrollmentDate.toISOString(),
        lastActive: lastActive.toISOString(),
        completedLessons: Math.floor((progress / 100) * 26),
        testsCompleted: Math.floor((progress / 100) * 26),
        averageScore: Math.floor(Math.random() * 40) + 60,
        certificateIssued: graduated,
        active: Math.random() > 0.2
      });
    }
  });
  
  return learners;
};

export const mockLearners = generateMockLearners();

// Helper functions for filtering
export const getLearnersByChurch = (churchId) => {
  return mockLearners.filter(l => l.churchId === churchId);
};

export const getLearnersByConference = (conferenceId) => {
  return mockLearners.filter(l => l.conferenceId === conferenceId);
};

export const getLearnersByUnion = (unionId) => {
  return mockLearners.filter(l => l.unionId === unionId);
};

export const getGraduatedLearners = () => {
  return mockLearners.filter(l => l.graduated);
};

export const getLearnersByAgeRange = (min, max) => {
  return mockLearners.filter(l => l.age >= min && l.age <= max);
};

export const getLearnersByCounty = (county) => {
  return mockLearners.filter(l => l.county === county);
};

export const getActiveLearners = () => {
  return mockLearners.filter(l => l.active);
};

// Statistics helpers
export const getStatistics = (learners = mockLearners) => {
  const total = learners.length;
  const graduated = learners.filter(l => l.graduated).length;
  const active = learners.filter(l => l.active).length;
  const avgProgress = learners.reduce((sum, l) => sum + l.progress, 0) / total || 0;
  const avgScore = learners.reduce((sum, l) => sum + l.averageScore, 0) / total || 0;
  
  return {
    total,
    graduated,
    active,
    inactive: total - active,
    avgProgress: Math.round(avgProgress),
    avgScore: Math.round(avgScore),
    graduationRate: total > 0 ? Math.round((graduated / total) * 100) : 0
  };
};
