import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecordSiteVisitMutation } from '@/services/analyticsApi';

const SESSION_TRACK_KEY = 'hans_solar_tracked_paths';

const getTrackedPaths = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_TRACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markPathTracked = (pathname) => {
  try {
    const tracked = getTrackedPaths();
    if (!tracked.includes(pathname)) {
      sessionStorage.setItem(
        SESSION_TRACK_KEY,
        JSON.stringify([...tracked, pathname]),
      );
    }
  } catch {
    // Ignore storage failures — in-memory ref still prevents duplicate calls per mount.
  }
};

export default function VisitorTracker() {
  const location = useLocation();
  const [recordSiteVisit] = useRecordSiteVisitMutation();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const alreadyTrackedInSession = getTrackedPaths().includes(location.pathname);

    if (
      lastTrackedPath.current === location.pathname ||
      alreadyTrackedInSession
    ) {
      return;
    }

    lastTrackedPath.current = location.pathname;

    const track = () => {
      recordSiteVisit()
        .unwrap()
        .then(() => {
          markPathTracked(location.pathname);
        })
        .catch(() => {});
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(track, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }

    const timer = setTimeout(track, 1500);
    return () => clearTimeout(timer);
  }, [location.pathname, recordSiteVisit]);

  return null;
}
