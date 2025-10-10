"use client";

import { apiFetch } from "@/lib/backend/client";
import { useEffect, useState } from "react";

export default function Page() {
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    apiFetch("/api/v1/freelancers").then(setFreelancers);
  }, []);

  return (
    <>
      <h1>freelancer 페이지</h1>

      <ul>
        {freelancers.map((freelancer) => (
          <li key={freelancer.id}>{freelancer.nickname}</li>
        ))}
      </ul>
    </>
  );
}
