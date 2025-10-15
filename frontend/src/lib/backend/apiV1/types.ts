/**
 * TypeScript types for backend API
 */

export interface FreelancerTechDto {
  techName: string;
  proficiency: 'EXPERT' | 'ADVANCED' | 'INTERMEDIATE' | 'BEGINNER';
}

export interface FreelancerRecommendationDto {
  freelancerId: number;
  freelancerName: string;
  totalExperience: number;
  averageRating: number;
  minRate: number;
  maxRate: number;
  available: boolean;
  matchingScore: number;
  skillScore: number;
  experienceScore: number;
  budgetScore: number;
  rank: number;
  matchingReasons: Record<string, unknown>;
  skills: FreelancerTechDto[];
  completedProjects: number;
}

export interface RecommendationResponseDto {
  projectId: number;
  projectTitle: string;
  recommendations: FreelancerRecommendationDto[];
}
