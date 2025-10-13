"use client";

// Mock data
const freelancers = [
  {
    id: 1,
    name: "김개발",
    title: "Full Stack Developer",
    avatar: "/developer-working.png",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 85000,
    location: "서울",
    availability: "즉시 가능",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    experience: "7년",
    description:
      "풀스택 개발자로 7년간 다양한 프로젝트를 성공적으로 완수했습니다. 특히 React와 Next.js를 활용한 웹 애플리케이션 개발에 전문성을 가지고 있습니다.",
    completedProjects: 89,
  },
  {
    id: 2,
    name: "이프론트",
    title: "Frontend Specialist",
    avatar: "/frontend-concept.png",
    rating: 4.8,
    reviews: 94,
    hourlyRate: 70000,
    location: "경기",
    availability: "1주일 내",
    skills: ["Vue.js", "React", "Tailwind CSS", "JavaScript", "Figma"],
    experience: "5년",
    description:
      "UI/UX에 대한 깊은 이해를 바탕으로 사용자 중심의 인터페이스를 구현합니다. 디자인 시스템 구축 경험이 풍부합니다.",
    completedProjects: 67,
  },
  {
    id: 3,
    name: "박백엔드",
    title: "Backend Engineer",
    avatar: "/backend-architecture.png",
    rating: 4.7,
    reviews: 82,
    hourlyRate: 90000,
    location: "부산",
    availability: "즉시 가능",
    skills: ["Python", "Django", "FastAPI", "AWS", "Docker"],
    experience: "6년",
    description:
      "확장 가능한 백엔드 아키텍처 설계 및 구현에 전문성을 가지고 있습니다. 클라우드 인프라 구축 경험이 풍부합니다.",
    completedProjects: 73,
  },
  {
    id: 4,
    name: "최모바일",
    title: "Mobile App Developer",
    avatar: "/modern-smartphone-display.png",
    rating: 4.9,
    reviews: 105,
    hourlyRate: 80000,
    location: "서울",
    availability: "2주일 내",
    skills: ["Flutter", "React Native", "iOS", "Android", "Firebase"],
    experience: "5년",
    description:
      "크로스 플랫폼 모바일 앱 개발 전문가입니다. Flutter와 React Native를 활용하여 고품질의 모바일 앱을 제작합니다.",
    completedProjects: 56,
  },
  {
    id: 5,
    name: "정데이터",
    title: "Data Engineer",
    avatar: "/abstract-data-flow.png",
    rating: 4.6,
    reviews: 68,
    hourlyRate: 95000,
    location: "서울",
    availability: "즉시 가능",
    skills: ["Python", "Spark", "Kafka", "Airflow", "BigQuery"],
    experience: "8년",
    description:
      "대규모 데이터 파이프라인 구축 및 최적화 경험이 풍부합니다. 데이터 기반 의사결정을 지원하는 시스템을 설계합니다.",
    completedProjects: 45,
  },
  {
    id: 6,
    name: "강풀스택",
    title: "Full Stack Developer",
    avatar: "/fullstack-concept.png",
    rating: 4.8,
    reviews: 91,
    hourlyRate: 75000,
    location: "인천",
    availability: "즉시 가능",
    skills: ["Java", "Spring Boot", "React", "MySQL", "Kubernetes"],
    experience: "6년",
    description:
      "Java 기반 엔터프라이즈 애플리케이션 개발에 전문성을 가지고 있습니다. 마이크로서비스 아키텍처 구축 경험이 있습니다.",
    completedProjects: 78,
  },
];

export function FreelancerList() {
  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {freelancers.length}명
          </span>
          의 프리랜서를 찾았습니다
        </p>
      </div>

      {/* Freelancer Cards */}
      <div className="space-y-4">
        {freelancers.map((freelancer) => (
          <div
            key={freelancer.id}
            className="p-6 hover:shadow-md transition-shadow border rounded-lg bg-white dark:bg-gray-800"
          >
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="h-20 w-20 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {freelancer.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={freelancer.avatar}
                    alt={freelancer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-gray-500">
                    {freelancer.name[0]}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {freelancer.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {freelancer.title}
                    </p>
                  </div>
                  <button className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100">
                    ❤️
                  </button>
                </div>

                {/* Rating and Info */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="font-semibold">{freelancer.rating}</span>
                    <span className="text-gray-500">
                      ({freelancer.reviews})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>📍</span>
                    <span>{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>⏰</span>
                    <span>{freelancer.availability}</span>
                  </div>
                  <span className="text-gray-500">
                    경력 {freelancer.experience}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-900 mb-3 line-clamp-2">
                  {freelancer.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₩{freelancer.hourlyRate.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/시간</span>
                    <span className="text-xs text-gray-500 ml-2">
                      완료 프로젝트 {freelancer.completedProjects}개
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded">
                      프로필 보기
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">
                      연락하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-6">
        <button className="px-4 py-2 border rounded">더 보기</button>
      </div>
    </div>
  );
}
