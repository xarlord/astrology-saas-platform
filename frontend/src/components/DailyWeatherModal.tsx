/**
 * DailyWeatherModal Component
 * Modal displaying detailed astrological weather for a specific day
 */

// import React from 'react';
import { X, Moon, Star, Sparkles } from 'lucide-react';
import { DailyWeather as DailyWeatherType, AstrologicalEvent } from '../types/calendar.types';
import '../styles/DailyWeatherModal.css';

interface DailyWeatherModalProps {
  date: string;
  weather: DailyWeatherType;
  onClose: () => void;
}

export function DailyWeatherModal({ date, weather, onClose }: DailyWeatherModalProps) {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{formatDate(date)}</h2>
          <button onClick={onClose} className="btn-close" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        {/* Rating */}
        <div className="rating-section" style={{ backgroundColor: getRatingColor(weather.rating) }}>
          <div className="rating-content">
            <div className="rating-number">{weather.rating}/10</div>
            <div className="rating-label">{getRatingLabel(weather.rating)}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="summary-section">
          <p className="summary-text">{weather.summary}</p>
        </div>

        {/* Moon Phase */}
        <div className="moon-phase-section">
          <div className="section-header">
            <Moon size={20} />
            <h3>Moon Phase</h3>
          </div>
          <div className="moon-phase-content">
            <div className="moon-icon">{getMoonPhaseIcon(weather.moonPhase.phase)}</div>
            <div className="moon-details">
              <div className="moon-phase-name">
                {weather.moonPhase.phase
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </div>
              <div className="moon-info">
                in {weather.moonPhase.sign.charAt(0).toUpperCase() + weather.moonPhase.sign.slice(1)} •{' '}
                {weather.moonPhase.illumination}% illuminated
              </div>
            </div>
          </div>
        </div>

        {/* Global Events */}
        {weather.globalEvents.length > 0 && (
          <div className="events-section">
            <div className="section-header">
              <Star size={20} />
              <h3>Astrological Events</h3>
            </div>
            <div className="events-list">
              {weather.globalEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Personal Transits */}
        {weather.personalTransits.length > 0 && (
          <div className="transits-section">
            <div className="section-header">
              <Sparkles size={20} />
              <h3>Your Transits</h3>
            </div>
            <div className="events-list">
              {weather.personalTransits.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {(weather.luckyActivities.length > 0 || weather.challengingActivities.length > 0) && (
          <div className="activities-section">
            {weather.luckyActivities.length > 0 && (
              <div className="activities-lucky">
                <h4>✨ Favorable For:</h4>
                <ul>
                  {weather.luckyActivities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}

            {weather.challengingActivities.length > 0 && (
              <div className="activities-challenging">
                <h4>⚠️ Challenging For:</h4>
                <ul>
                  {weather.challengingActivities.map((activity, index) => (
                    <li key={index}>{activity}</li>
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
    <div className="event-card">
      <div className="event-icon">{getEventIcon(event.eventType)}</div>
      <div className="event-content">
        <div className="event-name">{event.eventName}</div>
        {event.description && (
          <div className="event-description">{event.description}</div>
        )}
        {event.advice && event.advice.length > 0 && (
          <div className="event-advice">
            <strong>Advice:</strong> {event.advice[0]}
          </div>
        )}
      </div>
      <div
        className="event-intensity"
        style={{ backgroundColor: event.intensity >= 8 ? '#F59E0B' : event.intensity <= 4 ? '#EF4444' : '#10B981' }}
      >
        {event.intensity}
      </div>
    </div>
  );
}

export default DailyWeatherModal;
