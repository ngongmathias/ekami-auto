import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import theme from './lib/theme';
import Layout from './components/common/Layout';
import AnalyticsWrapper from './components/common/AnalyticsWrapper';
import InstallPrompt from './components/pwa/InstallPrompt';
import UpdatePrompt from './components/pwa/UpdatePrompt';
import HomePage from './pages/HomePage';
import RentPage from './pages/RentPage';
import BuyPage from './pages/BuyPage';
import RepairsPage from './pages/RepairsPage';
import ServiceRequestPage from './pages/ServiceRequestPage';
import SellCarPage from './pages/SellCarPage';
import CarDetailPage from './pages/CarDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PurchasePage from './pages/PurchasePage';
import ComparePage from './pages/ComparePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AccountPage from './pages/AccountPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContactPage from './pages/ContactPage';
import CarToolsPage from './pages/CarToolsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import ChatWidget from './components/chat/ChatWidget';
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
              <CurrencyProvider>
                <GoogleMapsProvider>
                  <Router>
                    <AnalyticsWrapper>
                    <div className="App">
                      <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<HomePage />} />
                      <Route path="sign-in" element={<SignInPage />} />
                      <Route path="sign-up" element={<SignUpPage />} />
                      <Route path="rent" element={<RentPage />} />
                      <Route path="buy" element={<BuyPage />} />
                      <Route path="purchase/:id" element={<PurchasePage />} />
                      <Route path="repairs" element={<RepairsPage />} />
                      <Route path="repairs/request" element={<ServiceRequestPage />} />
                      <Route path="sell" element={<SellCarPage />} />
                      <Route path="cars/:id" element={<CarDetailPage />} />
                      <Route path="book/:id" element={<BookingPage />} />
                      <Route path="payment" element={<PaymentPage />} />
                      <Route path="payment/success" element={<PaymentSuccessPage />} />
                      <Route path="compare" element={<ComparePage />} />
                      <Route path="blog" element={<BlogPage />} />
                      <Route path="blog/:slug" element={<BlogPostPage />} />
                      <Route path="account/*" element={<AccountPage />} />
                      <Route path="admin" element={<AdminDashboard />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="tools" element={<CarToolsPage />} />
                      <Route path="loyalty" element={<LoyaltyPage />} />
                    </Route>
                      </Routes>
                    </div>
                  </AnalyticsWrapper>
                  </Router>
                  <ChatWidget />
                  <Toaster position="top-right" />
                </GoogleMapsProvider>
              </CurrencyProvider>
            </ThemeProvider>
          </AuthProvider>
        </LanguageProvider>
        <InstallPrompt />
        <UpdatePrompt />
      </MuiThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
