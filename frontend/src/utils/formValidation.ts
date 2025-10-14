// 폼 검증 유틸리티 함수

interface ProjectFormData {
  title?: string;
  description?: string;
  projectField?: string;
  recruitmentType?: string;
  budgetType?: string;
  startDate?: string;
  endDate?: string;
  managerId?: string;
}

export const validateProjectForm = (formData: ProjectFormData, managerId?: string): string | null => {
  if (!formData.title?.trim()) {
    return '프로젝트 제목을 입력해주세요.';
  }
  if (!formData.description?.trim()) {
    return '프로젝트 설명을 입력해주세요.';
  }
  if (!formData.projectField) {
    return '프로젝트 분야를 선택해주세요.';
  }
  if (!formData.recruitmentType) {
    return '모집 유형을 선택해주세요.';
  }
  if (!formData.budgetType) {
    return '예산 유형을 선택해주세요.';
  }
  if (!formData.startDate) {
    return '시작 날짜를 입력해주세요.';
  }
  if (!formData.endDate) {
    return '종료 날짜를 입력해주세요.';
  }
  if (!managerId) {
    return '관리자 ID가 필요합니다.';
  }
  
  // 날짜 유효성 검사
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  
  if (startDate >= endDate) {
    return '종료 날짜는 시작 날짜보다 늦어야 합니다.';
  }
  
  return null; // 검증 통과
};

export const showValidationError = (errorMessage: string) => {
  alert(errorMessage);
};

export const showSuccessMessage = (message: string) => {
  alert(message);
};

export const showErrorMessage = (message: string) => {
  alert(message);
};
