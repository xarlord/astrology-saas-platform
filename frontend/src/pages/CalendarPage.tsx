import { CalendarPageShell } from '../components/CalendarPageShell';

import { Helmet } from 'react-helmet-async';

export default function CalendarPage() {
  return (
    <>
      <Helmet>
        <title>Astrological Calendar — AstroVerse</title>
        <meta name="description" content="Track moon phases, retrogrades, and cosmic events." />
      </Helmet>
      <CalendarPageShell
      title="Astrological Calendar"
      description="Track moon phases, retrogrades, and cosmic events"
    />
    </>
  );
}
