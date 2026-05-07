import { CalendarPageShell } from '../components/CalendarPageShell';

export default function CalendarPage() {
  return (
      <h1 className="sr-only">Calendar Page</h1>
    <CalendarPageShell
      title="Astrological Calendar"
      description="Track moon phases, retrogrades, and cosmic events"
    />
  );
}
