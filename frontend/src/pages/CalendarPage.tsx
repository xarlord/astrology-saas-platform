import { CalendarPageShell } from '../components/CalendarPageShell';

import { Helmet } from 'react-helmet-async';
export default function CalendarPage() {
  return (
    <CalendarPageShell
      title="Astrological Calendar"
      description="Track moon phases, retrogrades, and cosmic events"
    />
  );
}
