"use client";

import React from "react";
import { createPortal } from "react-dom";

interface ReviewConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReviewConfirmModal({
  show,
  onClose,
  onConfirm,
}: ReviewConfirmModalProps) {
  if (!show) return null;

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          width: "380px",
          textAlign: "center",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          FIT을 사용한 후기를 남기시겠습니까?
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e5e7eb",
              color: "#374151",
              borderRadius: "8px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#d1d5db")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#e5e7eb")
            }
          >
            아니요
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "8px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#2563eb")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.backgroundColor = "#3b82f6")
            }
          >
            예
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined" ? createPortal(modal, document.body) : null;
}
