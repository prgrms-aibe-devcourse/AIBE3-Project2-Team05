import { toggleFavorite } from '@/utils/favoriteUtils';
import { useState } from 'react';

interface FavoriteButtonProps {
  projectId: number;
  isFavorite: boolean;
  userId: number;
  onToggle: (newState: boolean) => void;
  className?: string;
}

const FavoriteButton = ({ 
  projectId, 
  isFavorite, 
  userId, 
  onToggle, 
  className = '' 
}: FavoriteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('FavoriteButton 클릭됨:', { projectId, userId, currentState: isFavorite });

    // 추가 인증 체크 (안전장치)
    if (!userId) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('toggleFavorite 호출 중...');
      const success = await toggleFavorite(projectId, userId);
      console.log('toggleFavorite 결과:', success);
      
      if (success) {
        console.log('상태 변경:', isFavorite, '->', !isFavorite);
        onToggle(!isFavorite);
      } else {
        console.log('toggleFavorite가 false를 반환했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 토글 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        border-0 outline-0 ring-0
        bg-transparent
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
      title={isFavorite ? '좋아요 제거' : '좋아요 추가'}
    >
      {isLoading ? (
        <div className="animate-spin w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600"></div>
      ) : (
        <span className="text-100xl transition-all duration-200">
          {isFavorite ? '❤️' : '🤍'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
