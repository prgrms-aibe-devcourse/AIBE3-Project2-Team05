"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviews, deleteReview} from "@/lib/reviewApi";

export default function UserReviewListPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

  const fetchLoggedUser = async () => {
  try {
    const res = await fetch("http://localhost:8080/member/me", {
      credentials: "include", // ✅ 쿠키를 함께 보냄
    });

    if (!res.ok) {
      console.error("❌ 로그인 사용자 정보를 가져오지 못했습니다:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("✅ 로그인 사용자 정보:", data);
    return data.data.id; // RsData<MemberDto> 구조니까 data.id로 접근
  } catch (err) {
    console.error("❌ /member/me 호출 실패:", err);
    return null;
  }
};

  const fetchUserReviews = async () => {
    try {
      if (!userId) return;
      const data = await getReviews(Number(userId));
      setReviews(data);
    } catch (err: any) {
      console.error("리뷰 불러오기 실패:", err);
      alert("리뷰를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
  if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;

  try {
    await deleteReview(reviewId); // ✅ 여기서 reviewId가 제대로 전달되어야 함
    alert("리뷰가 삭제되었습니다.");
    fetchUserReviews();
  } catch (err: any) {
    console.error("삭제 실패:", err);
    alert(`삭제 실패: ${err.message}`);
  }
};

  useEffect(() => {
    const init = async () => {
      const uid = await fetchLoggedUser();
      setLoggedUserId(uid);
      await fetchUserReviews();
    };
    init();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        로딩 중...
      </div>
    );
  }

  return (
    console.log("✅ 리뷰 목록 데이터:", reviews),
    console.log("✅ 로그인 사용자 ID:", loggedUserId),
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {userId}번 사용자의 리뷰 ✨
        </h1>
        <p className="text-gray-500">
          이 사용자가 작성한 모든 리뷰를 확인할 수 있습니다. 
        </p>
      </div>
  
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">등록된 리뷰가 없습니다.</p>
      ) : (console.log("✅ 리뷰 목록 데이터:", reviews),
    console.log("✅ 로그인 사용자 ID:", loggedUserId),
        <div className="space-y-5">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-5 border rounded-xl shadow-sm bg-white hover:shadow-md transition"
            >
              <div className="flex justify-between mb-2">
                <h2 className="text-lg font-semibold">{r.title}</h2>
                <span className="text-yellow-500 font-bold">⭐ {r.rating}</span>
              </div>
              <p className="text-gray-700 mb-3">{r.content}</p>
              <div className="text-sm text-gray-400 flex justify-between">
                <span>작성일: {new Date(r.createdAt).toLocaleDateString()}</span>
                <span>작성자 ID: {r.authorId}</span>
              </div>

              {loggedUserId && loggedUserId === r.authorId && (
                <div className="flex gap-3 mt-4">
                  <button
  type="button"
  onClick={() => router.push(`/review/edit/${r.id}?targetUserId=${userId}`)}
  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
>
  수정
</button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
