import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import theme from './lib/theme';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import RentPage from './pages/RentPage';
import BuyPage from './pages/BuyPage';
import RepairsPage from './pages/RepairsPage';
import SellCarPage from './pages/SellCarPage';
import CarDetailPage from './pages/CarDetailPage';
import ComparePage from './pages/ComparePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AccountPage from './pages/AccountPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
          <AuthProvider>
            <ThemeProvider>
              <Router>
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<HomePage />} />
                      <Route path="sign-in" element={<SignInPage />} />
                      <Route path="sign-up" element={<SignUpPage />} />
                      <Route path="rent" element={<RentPage />} />
                      <Route path="buy" element={<BuyPage />} />
                      <Route path="repairs" element={<RepairsPage />} />
                      <Route path="sell" element={<SellCarPage />} />
                      <Route path="cars/:id" element={<CarDetailPage />} />
                      <Route path="compare" element={<ComparePage />} />
                      <Route path="blog" element={<BlogPage />} />
                      <Route path="blog/:slug" element={<BlogPostPage />} />
                      <Route path="account/*" element={<AccountPage />} />
                    </Route>
                  </Routes>
                </div>
              </Router>
              <Toaster position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
