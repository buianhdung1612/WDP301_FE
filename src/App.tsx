import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './client/layouts/Layout';
import { LayoutAdmin } from './admin/layouts/LayoutAdmin';
import { ClientRoutes } from './client/routes/index';
import { AdminRoutes, AdminAuthRoutes } from './admin/routes/index';
import { useScrollToTop } from './client/hooks/useScrollToTop';
import { LoginPage } from './client/pages/auth/Login';

const ScrollToTopWrapper = ({ children }: { children: React.ReactNode }) => {
  useScrollToTop();
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopWrapper>
        <Routes>
          {/* Client Routes */}
          <Route element={<Layout />}>
            {ClientRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element}>
                {route.children && route.children.map((child) => (
                  <Route key={child.path} path={child.path} element={child.element} />
                ))}
              </Route>
            ))}
          </Route>
          <Route path="/auth/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path='/admin'>
            {AdminAuthRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route path='/admin' element={<LayoutAdmin />}>
            {AdminRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
        </Routes>
      </ScrollToTopWrapper>
    </BrowserRouter>
  )
}

export default App