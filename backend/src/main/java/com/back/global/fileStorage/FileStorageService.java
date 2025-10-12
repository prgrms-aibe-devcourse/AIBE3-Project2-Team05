package com.back.global.fileStorage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${file.upload.dir}")
    private String uploadDir;
    @Value("${file.access.base-url}")
    private String baseUrl;

    public String saveFile(MultipartFile file, FileType fileType) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originFileName = file.getOriginalFilename(); // 고유 파일명
        String fileExtension = "";  // 파일 확장자

        if (originFileName != null && originFileName.contains(".")) {   // 확장자가 있을 경우
            fileExtension = originFileName.substring(originFileName.lastIndexOf("."));  // 확장자 추출
        }

        String storedFileName = UUID.randomUUID() + fileExtension;   // 저장할 파일명 (UUID + 확장자)

        Path uploadPath = Paths.get(uploadDir, fileType.getSubDir()); // 업로드 디렉토리 경로

        if (!Files.exists(uploadPath)) {    // 디렉토리가 없으면
            Files.createDirectories(uploadPath);    // 디렉토리 생성
        }

        Path targetLocation = uploadPath.resolve(storedFileName);   // 저장할 파일 경로
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING); // 파일 저장

        return baseUrl + fileType.getSubDir() + "/" + storedFileName;    // 저장된 파일의 접근 URL 반환
    }

    public String updateFile(String existingImageUrl, MultipartFile newImageFile, Boolean deleteExistingImage, FileType fileType) throws IOException {
        String updatedImageUrl = existingImageUrl;

        try {
            if (newImageFile != null && !newImageFile.isEmpty()) {  // 새로운 이미지가 넘어왔는데
                if (existingImageUrl != null) { // 기존 이미지가 있다면
                    deleteFile(existingImageUrl, fileType);  //기존 이미지 삭제 후
                }
                updatedImageUrl = saveFile(newImageFile, fileType);  //새로운 이미지 저장
            } else if (deleteExistingImage && existingImageUrl != null) { // 기존 이미지를 삭제하라는 요청이 왔고, 기존 이미지가 있다면
                deleteFile(existingImageUrl, fileType);    // 기존 이미지 삭제 후
                updatedImageUrl = null; // URL은 null로 지정
            }
        } catch (IOException e) {
            throw new RuntimeException("파일 처리 중 오류가 발생했습니다.", e);
        }

        return updatedImageUrl;
    }


    public void deleteFile(String fileUrl, FileType fileType) {
        if (fileUrl == null || fileUrl.isEmpty()) { // 파일 URL이 없으면 삭제할 필요 없음
            return;
        }

        String fileNameWithSubDir = fileUrl.replace(baseUrl, "");
        String fileName = fileNameWithSubDir.replace(fileType.getSubDir() + "/", ""); // 파일명 추출

        Path filePath = Paths.get(uploadDir, fileType.getSubDir()).resolve(fileName); // 최종 파일 경로

        try {
            Files.deleteIfExists(filePath); // 파일이 존재하면 삭제
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패: " + fileName, e);
        }
    }

}
