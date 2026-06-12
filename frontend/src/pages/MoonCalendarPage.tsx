import { CalendarPageShell } from '../components/CalendarPageShell';

import { Helmet } from 'react-helmet-async';
export default function MoonCalendarPage() {
  return (
    <CalendarPageShell
      title="Moon Calendar"
      description="Track lunar phases, eclipses, and moon-related events"
      moonOnly
    />
  );
}
