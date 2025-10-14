/**
 * 파일 미리보기 관련 유틸리티 함수들
 */

/**
 * 파일 미리보기 함수
 */
export const handleFilePreview = (projectId: string, fileId: number) => {
  const previewUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}/view`;
  window.open(previewUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
};

/**
 * 파일 확장자로 미리보기 가능 여부 확인
 */
export const canPreviewFile = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const previewableExtensions = [
    'pdf', 'txt', 'md', 'json', 'xml', 'csv',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
    'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx'
  ];
  return previewableExtensions.includes(extension || '');
};

/**
 * 파일 아이콘 결정
 */
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) return '🖼️';
  if (['pdf'].includes(extension || '')) return '📕';
  if (['doc', 'docx'].includes(extension || '')) return '📄';
  if (['xls', 'xlsx'].includes(extension || '')) return '📊';
  if (['ppt', 'pptx'].includes(extension || '')) return '📈';
  if (['txt', 'md'].includes(extension || '')) return '📝';
  if (['zip', 'rar', '7z'].includes(extension || '')) return '🗜️';
  if (['mp4', 'avi', 'mov'].includes(extension || '')) return '🎥';
  if (['mp3', 'wav', 'flac'].includes(extension || '')) return '🎵';
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css'].includes(extension || '')) return '💻';
  
  return '📄';
};

/**
 * 파일 다운로드 함수
 */
export const handleFileDownload = (projectId: string, fileId: number, fileName: string) => {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}/download`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
