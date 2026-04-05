/**
 * DailyWeatherModal Component
 * Modal displaying detailed astrological weather for a specific day
 *
 * WCAG 2.1 AA - Keyboard accessible with focus trap
 */

import { useEffect } from 'react';
import { DailyWeather as DailyWeatherType, AstrologicalEvent } from '../types/calendar.types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface DailyWeatherModalProps {
  date: string;
  weather: DailyWeatherType;
  onClose: () => void;
}

export function DailyWeatherModal({ date, weather, onClose }: DailyWeatherModalProps) {
  // WCAG 2.1 AA - Focus trap to keep keyboard navigation within modal
  const modalRef = useFocusTrap<HTMLDivElement>({ active: true });

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  const getRatingColor = (rating: number): string => {
    if (rating >= 7) return '#10B981'; // green
    if (rating <= 4) return '#EF4444'; // red
    return '#F59E0B'; // yellow
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 8) return 'Excellent';
    if (rating >= 6) return 'Good';
    if (rating >= 4) return 'Moderate';
    return 'Challenging';
  };

  const getMoonPhaseIcon = (phase: string): React.ReactNode => {
    switch (phase) {
      case 'new':
        return '🌑';
      case 'waxing-crescent':
        return '🌒';
      case 'first-quarter':
        return '🌓';
      case 'waxing-gibbous':
        return '🌔';
      case 'full':
        return '🌕';
      case 'waning-gibbous':
        return '🌖';
      case 'last-quarter':
        return '🌗';
      case 'waning-crescent':
        return '🌘';
      default:
        return '🌙';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 sm:p-3 animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl sm:rounded-xl max-w-[600px] w-full max-h-[90vh] sm:max-h-[95vh] overflow-y-auto shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-4 border-b border-gray-200">
          <h2 id="modal-title" className="m-0 text-xl sm:text-lg font-semibold text-gray-900">{formatDate(date)}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-gray-500 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 focus-visible:bg-gray-100"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
          </button>
        </div>

        {/* Rating */}
        <div className="p-6 sm:p-4 text-center rounded-xl m-6 sm:m-4" style={{ backgroundColor: getRatingColor(weather.rating) }}>
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl sm:text-4xl font-bold text-white">{weather.rating}/10</div>
            <div className="text-lg sm:text-sm font-semibold text-white uppercase tracking-wider">{getRatingLabel(weather.rating)}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 pb-4">
          <p className="m-0 text-base leading-relaxed text-gray-700 text-center">{weather.summary}</p>
        </div>

        {/* Moon Phase */}
        <div className="p-4 px-6 bg-gray-50 rounded-lg mx-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dark_mode</span>
            <h3 className="m-0 text-base font-semibold text-gray-900">Moon Phase</h3>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:text-center">
            <div className="text-5xl">{getMoonPhaseIcon(weather.moonPhase.phase)}</div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {weather.moonPhase.phase
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
              <div className="text-sm text-gray-500">
                in {weather.moonPhase.sign.charAt(0).toUpperCase() + weather.moonPhase.sign.slice(1)} •{' '}
                {weather.moonPhase.illumination}% illuminated
              </div>
            </div>
          </div>
        </div>

        {/* Global Events */}
        {weather.globalEvents.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
              <h3 className="m-0 text-base font-semibold text-gray-900">Astrological Events</h3>
            </div>
            <div className="flex flex-col gap-3">
              {weather.globalEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Personal Transits */}
        {weather.personalTransits.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
              <h3 className="m-0 text-base font-semibold text-gray-900">Your Transits</h3>
            </div>
            <div className="flex flex-col gap-3">
              {weather.personalTransits.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {(weather.luckyActivities.length > 0 || weather.challengingActivities.length > 0) && (
          <div className="p-4 px-6 bg-gray-50 rounded-lg mx-6 mb-6 flex gap-4 sm:flex-col">
            {weather.luckyActivities.length > 0 && (
              <div className="flex-1">
                <h4 className="m-0 mb-2 text-sm font-semibold text-emerald-500">✨ Favorable For:</h4>
                <ul className="m-0 pl-5 list-disc">
                  {weather.luckyActivities.map((activity, index) => (
                    <li key={index} className="text-[13px] text-gray-700 mb-1 leading-snug">{activity}</li>
                  ))}
                </ul>
              </div>
            )}

            {weather.challengingActivities.length > 0 && (
              <div className="flex-1">
                <h4 className="m-0 mb-2 text-sm font-semibold text-red-500">⚠️ Challenging For:</h4>
                <ul className="m-0 pl-5 list-disc">
                  {weather.challengingActivities.map((activity, index) => (
                    <li key={index} className="text-[13px] text-gray-700 mb-1 leading-snug">{activity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: AstrologicalEvent;
}

function EventCard({ event }: EventCardProps) {
  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'retrograde':
        return '⇆';
      case 'eclipse':
        return '🌑';
      case 'moon-phase':
        return '🌙';
      case 'ingress':
        return '✨';
      case 'transit':
        return '⭐';
      default:
        return '•';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-[0_2px_4px_rgba(99,102,241,0.1)]">
      <div className="text-2xl shrink-0">{getEventIcon(event.eventType)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 mb-1">{event.eventName}</div>
        {event.description && (
          <div className="text-[13px] text-gray-500 mb-1 leading-snug">{event.description}</div>
        )}
        {event.advice && event.advice.length > 0 && (
          <div className="text-[13px] text-gray-600 leading-snug">
            <strong>Advice:</strong> {event.advice[0]}
          </div>
        )}
      </div>
      <div
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white font-semibold text-sm"
        style={{ backgroundColor: event.intensity >= 8 ? '#F59E0B' : event.intensity <= 4 ? '#EF4444' : '#10B981' }}
      >
        {event.intensity}
      </div>
    </div>
  );
}

export default DailyWeatherModal;
