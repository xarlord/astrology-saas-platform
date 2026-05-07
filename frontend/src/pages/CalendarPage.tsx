import { CalendarPageShell } from '../components';

export default function CalendarPage() {
  return (
    <>
      <h1 className="sr-only">Calendar</h1>
      <CalendarPageShell
        title="Astrological Calendar"
        description="Track moon phases, retrogrades, and cosmic events"
      />
    </>
  );
}
