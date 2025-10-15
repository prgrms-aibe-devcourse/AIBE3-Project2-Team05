import { apiFetch } from './client';
import { components } from './schema';

type ProjectFile = components['schemas']['ProjectFile'];
type RsDataProjectFile = components['schemas']['RsDataProjectFile'];
type RsDataListProjectFile = components['schemas']['RsDataListProjectFile'];

/**
 * 프로젝트 파일 관련 API 서비스
 * 서버에서 직접 파일을 관리하는 방식으로 변경됨
 */
export class ProjectFileApiService {

  /**
   * 프로젝트의 파일 목록을 조회합니다
   */
  static async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    try {
      const response: RsDataListProjectFile = await apiFetch(`/api/projects/${projectId}/files`);

      // 성공 조건을 더 명확하게 처리
      if (response.resultCode?.startsWith('200') || response.statusCode === 200) {
        return response.data || []; // Data가 null/undefined이면 빈 배열 반환
      }

      throw new Error(response.msg || '파일 목록을 불러오지 못했습니다.');
    } catch (error) {
      console.error('파일 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 단일 파일을 업로드합니다
   */
  static async uploadSingleFile(projectId: string, file: File): Promise<ProjectFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: RsDataProjectFile = await response.json();

      if ((apiResponse.resultCode?.startsWith('200') || apiResponse.statusCode === 200) && apiResponse.data) {
        return apiResponse.data;
      }

      throw new Error(apiResponse.msg || '파일 업로드에 실패했습니다.');
    } catch (error) {
      console.error('단일 파일 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 다중 파일을 업로드합니다
   */
  static async uploadMultipleFiles(projectId: string, files: File[]): Promise<ProjectFile[]> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/upload/batch`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: RsDataListProjectFile = await response.json();

      if ((apiResponse.resultCode?.startsWith('200') || apiResponse.statusCode === 200) && apiResponse.data) {
        return apiResponse.data;
      }

      throw new Error(apiResponse.msg || '파일 업로드에 실패했습니다.');
    } catch (error) {
      console.error('다중 파일 업로드 실패:', error);
      throw error;
    }
  }

  /**
   * 파일을 삭제합니다
   */
  static async deleteFile(projectId: string, fileId: number): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();

      if (!(apiResponse.resultCode?.startsWith('200') || apiResponse.statusCode === 200)) {
        throw new Error(apiResponse.msg || '파일 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 파일 상세 정보를 조회합니다
   */
  static async getFileDetails(projectId: string, fileId: number): Promise<ProjectFile> {
    try {
      const response: RsDataProjectFile = await apiFetch(`/api/projects/${projectId}/files/${fileId}`);

      if ((response.resultCode?.startsWith('200') || response.statusCode === 200) && response.data) {
        return response.data;
      }

      throw new Error(response.msg || '파일 정보를 불러오지 못했습니다.');
    } catch (error) {
      console.error('파일 상세 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 파일 다운로드 URL을 생성합니다
   */
  static getDownloadUrl(projectId: string, fileId: number): string {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}/download`;
  }

  /**
   * 파일 미리보기 URL을 생성합니다
   */
  static getPreviewUrl(projectId: string, fileId: number): string {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}/view`;
  }

  /**
   * 파일을 다운로드합니다
   */
  static downloadFile(projectId: string, fileId: number, fileName: string): void {
    const link = document.createElement('a');
    link.href = this.getDownloadUrl(projectId, fileId);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 파일을 새 탭에서 미리보기합니다
   */
  static previewFile(projectId: string, fileId: number): void {
    window.open(this.getPreviewUrl(projectId, fileId), '_blank');
  }
}
