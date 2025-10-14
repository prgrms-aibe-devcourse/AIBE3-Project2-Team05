// 프로젝트 폼에서 자주 사용되는 CSS 스타일들

export const formStyles = {
  // 컨테이너 스타일들
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb'
  },
  
  contentContainer: {
    maxWidth: '48rem',
    margin: '0 auto',
    padding: '24px'
  },
  
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  
  formContent: {
    padding: '32px'
  },
  
  // 헤더 스타일들
  headerContainer: {
    marginBottom: '32px'
  },
  
  breadcrumbContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  
  breadcrumbButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit'
  },
  
  pageTitle: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827'
  },
  
  // 폼 필드 스타일들
  fieldContainer: {
    marginBottom: '24px'
  },
  
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    minHeight: '100px'
  },
  
  // 기술 스택 관련 스타일들
  techStackContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  
  techCategoryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '8px'
  },
  
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  
  techItem: (isSelected: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#eff6ff' : 'white',
    borderColor: isSelected ? '#3b82f6' : '#d1d5db'
  }),
  
  techLabel: (isSelected: boolean) => ({
    fontSize: '14px',
    fontWeight: '500',
    color: isSelected ? '#1d4ed8' : '#374151'
  }),
  
  // 버튼 스타일들
  buttonContainer: {
    padding: '24px 32px',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: '0',
    borderTopRightRadius: '0',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '16px'
  },
  
  cancelButton: (disabled: boolean) => ({
    flex: 1,
    padding: '12px 0',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s'
  }),
  
  submitButton: (disabled: boolean) => ({
    flex: 1,
    padding: '12px 0',
    backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
    color: 'white',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    opacity: disabled ? 0.5 : 1
  })
};

// CSS 클래스명들
export const formClasses = {
  input: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  select: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  textarea: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  label: 'block text-sm font-semibold text-gray-700 mb-2',
  cancelButton: 'flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors',
  submitButton: 'flex-1 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
};
