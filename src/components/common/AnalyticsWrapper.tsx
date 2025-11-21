import { usePageTracking } from '../../hooks/useAnalytics';

export default function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}
