"use client";

interface StarRatingProps {
  rating: number;
  onChange?: (newRating: number) => void; // ⭐ 클릭 시 부모에 전달
  size?: number;
}

export default function StarRating({ rating, onChange, size = 28 }: StarRatingProps) {
  const stars = [];

  const handleClick = (newRating: number) => {
    if (onChange) onChange(newRating);
  };

  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating;
    stars.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        fill={filled ? "#facc15" : "#e5e7eb"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#fbbf24"
        width={size}
        height={size}
        className={`cursor-pointer transition-transform hover:scale-110 ${
          filled ? "drop-shadow-sm" : ""
        }`}
        onClick={() => handleClick(i)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.1 5.025a.562.562 0 00.475.345l5.514.442a.562.562 0 01.316.987l-4.185 3.69a.562.562 0 00-.182.545l1.25 5.385a.562.562 0 01-.828.61l-4.705-2.78a.562.562 0 00-.586 0l-4.705 2.78a.562.562 0 01-.828-.61l1.25-5.385a.562.562 0 00-.182-.545l-4.185-3.69a.562.562 0 01.316-.987l5.514-.442a.562.562 0 00.475-.345l2.1-5.025z"
        />
      </svg>
    );
  }

  return (
    <div className="flex gap-1 items-center">
      {stars}
      <span className="ml-2 text-sm text-gray-600">{rating}점</span>
    </div>
  );
}