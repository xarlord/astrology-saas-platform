import { CalendarPageShell } from '../components/CalendarPageShell';

import { Helmet } from 'react-helmet-async';

export default function MoonCalendarPage() {
  return (
    <>
      <Helmet>
        <title>Moon Calendar — AstroVerse</title>
        <meta name="description" content="Track lunar phases, eclipses, and moon-related events." />
      </Helmet>
      <CalendarPageShell
      title="Moon Calendar"
      description="Track lunar phases, eclipses, and moon-related events"
      moonOnly
    />
    </>
  );
}
