import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CommonLayout } from './components/layout/CommonLayout';
import { ROUTES } from './constants/routes';
import { LandingPage } from './pages/LandingPage';

/**
 * 전역 라우팅 구성
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모든 페이지에 공통적으로 GNB와 푸터를 적용하기 위해 CommonLayout으로 감쌉니다. */}
        <Route element={<CommonLayout />}>

          {/* 퍼블릭 라우트 (누구나 접근 가능) */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.LOGIN} element={<div>로그인 페이지</div>} />
          <Route path={ROUTES.SIGNUP} element={<div>회원가입 페이지</div>} />
          <Route path={ROUTES.POLICY} element={<div>약관 및 정책 페이지</div>} />

          {/* 프라이빗 라우트 (로그인한 유저만 접근 가능) */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.MFA_SETUP} element={<div>2단계 인증(MFA) 설정 페이지</div>} />
          </Route>

          {/* 어드민 전용 라우트 (관리자 권한 필요) */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path={ROUTES.ADMIN_LOGS} element={<div>시스템 감사 로그 뷰어</div>} />
            <Route path={ROUTES.ADMIN_HEALTH} element={<div>시스템 헬스 모니터링</div>} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
