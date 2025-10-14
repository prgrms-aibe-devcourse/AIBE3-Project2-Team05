"use client";

import { components } from '@/lib/backend/schema';
import {
    canPreviewFile,
    getFileIcon,
    handleFileDownload,
    handleFilePreview
} from '@/utils/filePreviewUtils';
import { useEffect, useState } from 'react';

type ProjectFile = components['schemas']['ProjectFile'];
type ProjectFileInfo = components['schemas']['ProjectFileInfo'];

// 두 타입을 모두 지원하는 유니온 타입
type FileItem = ProjectFile | ProjectFileInfo;

interface ProjectFileManagerProps {
    projectId: string;
    projectFiles?: FileItem[];
    onFilesChange?: (files: FileItem[]) => void;
    disabled?: boolean;
    mode?: 'edit' | 'create' | 'view';
}

const ProjectFileManager = ({
                                projectId,
                                projectFiles = [],
                                onFilesChange,
                                disabled = false,
                                mode = 'edit'
                            }: ProjectFileManagerProps) => {
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [currentFiles, setCurrentFiles] = useState<FileItem[]>(projectFiles);

    useEffect(() => {
        setCurrentFiles(projectFiles);
    }, [projectFiles, projectId, mode]);

    // 파일 목록이 변경될 때 부모 컴포넌트에 알림
    const notifyFilesChange = (newFiles: FileItem[]) => {
        setCurrentFiles(newFiles);
        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    // 파일 업로드 함수
    const handleFileUpload = async (files: File[]) => {
        if (!files.length || !projectId || disabled) return;

        setUploadingFiles(true);
        try {
            const uploadedFiles = [];

            // 각 파일을 개별적으로 업로드
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const apiResponse = await response.json();
                    // API 응답이 ApiResponseProjectFile 형태라면 Data 또는 data 필드에서 파일 정보를 추출
                    const uploadedFile = apiResponse.Data || apiResponse.data || apiResponse;
                    uploadedFiles.push(uploadedFile);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `파일 "${file.name}" 업로드에 실패했습니다.`);
                }
            }

            // 업로드된 파일들을 현재 파일 목록에 추가
            const newFiles = [...currentFiles, ...uploadedFiles];
            notifyFilesChange(newFiles);

            // 파일 변경 플래그 및 파일 상태 설정 (TTL 포함)
            const projectUpdateKey = `projectUpdated_${projectId}`;
            const projectUpdateTimeKey = `projectUpdateTime_${projectId}`;
            const projectFilesKey = `projectFiles_${projectId}`;
            const projectFilesTimeKey = `projectFilesTime_${projectId}`;
            
            sessionStorage.setItem(projectUpdateKey, 'true');
            sessionStorage.setItem(projectUpdateTimeKey, Date.now().toString());
            sessionStorage.setItem(projectFilesKey, JSON.stringify(newFiles));
            sessionStorage.setItem(projectFilesTimeKey, Date.now().toString());

            alert(`${uploadedFiles.length}개의 파일이 업로드되었습니다.`);
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            alert(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploadingFiles(false);
        }
    };

    // 파일 삭제 함수
    const handleFileDelete = async (fileId: number) => {
        if (!projectId || disabled) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/${projectId}/files/${fileId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // 삭제된 파일을 목록에서 제거
                const newFiles = currentFiles.filter(file => file.id !== fileId);
                notifyFilesChange(newFiles);

                // 파일 변경 플래그 및 파일 상태 설정 (TTL 포함)
                const projectUpdateKey = `projectUpdated_${projectId}`;
                const projectUpdateTimeKey = `projectUpdateTime_${projectId}`;
                const projectFilesKey = `projectFiles_${projectId}`;
                const projectFilesTimeKey = `projectFilesTime_${projectId}`;
                
                sessionStorage.setItem(projectUpdateKey, 'true');
                sessionStorage.setItem(projectUpdateTimeKey, Date.now().toString());
                
                if (newFiles.length > 0) {
                    sessionStorage.setItem(projectFilesKey, JSON.stringify(newFiles));
                    sessionStorage.setItem(projectFilesTimeKey, Date.now().toString());
                } else {
                    sessionStorage.removeItem(projectFilesKey);
                    sessionStorage.removeItem(projectFilesTimeKey);
                }

                alert('파일이 삭제되었습니다.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || '파일 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('파일 삭제 실패:', error);
            alert('파일 삭제 중 오류가 발생했습니다.');
        }
    };



    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                첨부파일
            </label>

            {/* 파일 업로드 영역 - 편집/생성 모드에서만 표시 */}
            {(mode === 'edit' || mode === 'create') && (
                <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors ${
                        disabled || uploadingFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disabled || uploadingFiles) return;
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                            handleFileUpload(files);
                        }
                    }}
                >
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        className="hidden"
                        id={`fileInput-${projectId}`}
                        disabled={disabled || uploadingFiles}
                        onChange={(e) => {
                            if (disabled || uploadingFiles) return;
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                                handleFileUpload(files);
                            }
                            // 파일 선택 후 input 초기화
                            e.target.value = '';
                        }}
                    />
                    <label
                        htmlFor={`fileInput-${projectId}`}
                        className={`block ${disabled || uploadingFiles ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="text-gray-400 text-4xl mb-3">📁</div>
                        <div className="text-gray-600 font-medium mb-2">
                            {uploadingFiles ? '파일 업로드 중...' : '파일을 드래그하여 놓거나 클릭하여 선택하세요'}
                        </div>
                        <div className="text-gray-500 text-sm">
                            {uploadingFiles ? '잠시만 기다려주세요.' : 'PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF 파일만 업로드 가능합니다'}
                        </div>
                    </label>
                </div>
            )}

            {/* 파일 목록 표시 */}
            {currentFiles && currentFiles.length > 0 ? (
                <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        {mode === 'view' ? '첨부파일' : '업로드된 파일'} ({currentFiles.length}개)
                    </h5>
                    <div className="space-y-2">
                        {currentFiles.map((file, index) => (
                            <div key={file.id || `file-${index}-${file.originalName}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{getFileIcon(file.originalName || '')}</div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {file.originalName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {file.fileSize && `${(file.fileSize / 1024).toFixed(1)} KB`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* 미리보기 버튼 */}
                                    {file.originalName && canPreviewFile(file.originalName) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (file.id) {
                                                    handleFilePreview(projectId, file.id);
                                                }
                                            }}
                                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                        >
                                            미리보기
                                        </button>
                                    )}
                                    
                                    {/* 다운로드 버튼 */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (file.id && file.originalName) {
                                                handleFileDownload(projectId, file.id, file.originalName);
                                            }
                                        }}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                    >
                                        다운로드
                                    </button>

                                    {/* 삭제 버튼 - 편집 모드에서만 표시 */}
                                    {(mode === 'edit' || mode === 'create') && !disabled && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm('이 파일을 삭제하시겠습니까?')) {
                                                    if (file.id) {
                                                        handleFileDelete(file.id);
                                                    }
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-4 text-center py-8 text-gray-500">
                    {mode === 'view' ? '참고파일이 없습니다.' : '업로드된 파일이 없습니다.'}
                </div>
            )}
        </div>
    );
};

export default ProjectFileManager;
