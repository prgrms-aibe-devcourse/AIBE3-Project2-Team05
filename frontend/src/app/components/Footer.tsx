"use client";

import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer-container">
      {/* 로고 */}
      <img src="/logo-full.png" alt="Logo" className="footer-logo" />

      {/* 첫 번째 줄: 고객센터 정보 */}
      <div className="footer-line-1">
        <span className="customer-service">고객센터 : 02-6497-3300</span>
        <span className="separator">|</span>
        <span className="service-hours">월-금 10:00 - 17:00</span>
        <span className="service-holiday">* 공휴일 휴무</span>
        <span className="separator">|</span>
        <span className="email">이메일 : contact@fit.com</span>
      </div>

      {/* 두 번째 줄: 회사 정보 */}
      <div className="footer-line-2">
        <span className="company-name">오벤져스 주식회사</span>
        <span className="separator">|</span>
        <span className="production">제작: 오벤져스</span>
        <span className="separator">|</span>
        <span className="address">
          주소: 서울특별시 강남구 테크노로 123, FIT빌딩 4층
        </span>
      </div>

      {/* 세 번째 줄: 포트폴리오 안내 */}
      <div className="footer-line-3">
        <span className="notice-text">
          ※ 본 사이트는 포트폴리오용으로 제작된 비상업적 프로젝트입니다.
        </span>
      </div>
    </footer>
  );
};