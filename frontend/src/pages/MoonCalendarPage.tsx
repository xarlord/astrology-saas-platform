import { CalendarPageShell } from '../components';

export default function MoonCalendarPage() {
  return (
    <>
      <h1 className="sr-only">Moon Calendar</h1>
      <CalendarPageShell
        title="Moon Calendar"
        description="Track lunar phases, eclipses, and moon-related events"
      />
    </>
  );
}
