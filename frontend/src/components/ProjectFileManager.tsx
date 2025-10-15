"use client";

import { ProjectFileApiService } from '@/lib/backend/projectFileApi';
import { components } from '@/lib/backend/schema';
import {
    canPreviewFile,
    getFileIcon
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
    const [loading, setLoading] = useState(false);

    // 서버에서 파일 목록 가져오기
    const fetchProjectFiles = async () => {
        if (!projectId || projectId === 'undefined' || projectId === 'null') return;
        
        setLoading(true);
        try {
            const files = await ProjectFileApiService.getProjectFiles(projectId);
            setCurrentFiles(files);
            if (onFilesChange) {
                onFilesChange(files);
            }
        } catch (error) {
            console.error('파일 목록을 불러오지 못했습니다:', error);
            // 에러 발생 시에도 빈 배열로 설정하여 로딩 상태를 종료
            setCurrentFiles([]);
            if (onFilesChange) {
                onFilesChange([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // 초기 로딩
    useEffect(() => {
        if (projectId && projectId !== 'undefined' && projectId !== 'null') {
            // 프로젝트 ID가 있으면 서버에서 파일 목록을 가져옴
            fetchProjectFiles();
        } else {
            // 프로젝트 ID가 없으면 props로 전달된 파일 목록 사용
            setCurrentFiles(projectFiles);
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]); // projectFiles와 onFilesChange는 의도적으로 제외

    // projectFiles가 변경되었을 때만 업데이트 (프로젝트 ID가 없는 경우)
    useEffect(() => {
        if (!projectId || projectId === 'undefined' || projectId === 'null') {
            setCurrentFiles(projectFiles);
        }
    }, [projectFiles, projectId]);



    // 파일 업로드 함수 - 서버 직접 저장
    const handleFileUpload = async (files: File[]) => {
        if (!files.length || !projectId || disabled) return;

        setUploadingFiles(true);
        try {
            if (files.length > 1) {
                // 다중 파일 업로드
                await ProjectFileApiService.uploadMultipleFiles(projectId, files);
                alert(`${files.length}개의 파일이 업로드되었습니다.`);
            } else {
                // 단일 파일 업로드
                await ProjectFileApiService.uploadSingleFile(projectId, files[0]);
                alert('파일이 업로드되었습니다.');
            }
            
            // 서버에서 업데이트된 파일 목록을 다시 가져옴
            await fetchProjectFiles();
        } catch (error) {
            console.error('파일 업로드 실패:', error);
            alert(error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploadingFiles(false);
        }
    };

    // 파일 삭제 함수 - 서버에서 직접 삭제
    const handleFileDelete = async (fileId: number) => {
        if (!projectId || disabled) return;

        try {
            await ProjectFileApiService.deleteFile(projectId, fileId);
            // 서버에서 업데이트된 파일 목록을 다시 가져옴
            await fetchProjectFiles();
            alert('파일이 삭제되었습니다.');
        } catch (error) {
            console.error('파일 삭제 실패:', error);
            alert(error instanceof Error ? error.message : '파일 삭제 중 오류가 발생했습니다.');
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
            {loading ? (
                <div className="mt-4 text-center py-8 text-gray-500">
                    파일 목록을 불러오는 중...
                </div>
            ) : currentFiles && currentFiles.length > 0 ? (
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
                                                    ProjectFileApiService.previewFile(projectId, file.id);
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
                                                ProjectFileApiService.downloadFile(projectId, file.id, file.originalName);
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
