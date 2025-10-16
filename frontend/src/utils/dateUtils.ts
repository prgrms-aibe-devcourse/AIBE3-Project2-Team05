/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 * @returns {string} 현재 날짜 (YYYY-MM-DD 형식)
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 주어진 날짜가 오늘 이후인지 확인합니다.
 * @param {string} dateString - 확인할 날짜 (YYYY-MM-DD 형식)
 * @returns {boolean} 오늘 이후 날짜인지 여부
 */
export const isDateAfterToday = (dateString: string): boolean => {
  const today = new Date();
  const inputDate = new Date(dateString);
  
  // 시간을 00:00:00으로 설정하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

/**
 * 날짜가 유효한지 확인하고 오늘 이후인지 검증합니다.
 * @param {string} dateString - 확인할 날짜 (YYYY-MM-DD 형식)
 * @returns {object} 검증 결과와 에러 메시지
 */
export const validateFutureDate = (dateString: string): { isValid: boolean; error?: string } => {
  if (!dateString) {
    return { isValid: false, error: '날짜를 선택해주세요.' };
  }
  
  if (!isDateAfterToday(dateString)) {
    return { isValid: false, error: '오늘 날짜 이후를 선택해주세요.' };
  }
  
  return { isValid: true };
};
