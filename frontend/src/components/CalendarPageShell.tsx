import AstrologicalCalendar from './AstrologicalCalendar';
import { AppLayout } from '../components';

interface CalendarPageShellProps {
  title: string;
  description: string;
}

export function CalendarPageShell({ title, description }: CalendarPageShellProps) {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text">{title}</h1>
        <p className="text-slate-200">{description}</p>
      </div>

      <AstrologicalCalendar />
    </AppLayout>
  );
}
