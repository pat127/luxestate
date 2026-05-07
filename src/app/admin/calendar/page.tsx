'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/contexts/RoleContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalEvent {
  id: number;
  title: string;
  date: number;
  month: number;
  time: string;
  type: string;
  owner: 'ceo' | 'team'; // owner determines which calendar it belongs to
  attendees: string[];
  location?: string;
  notes?: string;
}

interface MarketingEvent {
  id: number;
  title: string;
  date: number;
  month: number;
  time: string;
  campaign: string;
  channel: string;
  budget?: string;
  notes?: string;
}

const MARKETING_EVENTS_KEY = 'marketing_calendar_events';

const initialEvents: CalEvent[] = [
  { id: 1, title: 'Property Viewing — Obsidian Penthouse', date: 3, month: 4, time: '10:00 AM', type: 'Viewing', owner: 'team', attendees: ['Sarah M.', 'James H.'], location: 'Downtown Dubai' },
  { id: 2, title: 'Team Standup', date: 5, month: 4, time: '9:00 AM', type: 'Meeting', owner: 'team', attendees: ['All Team'], location: 'Office' },
  { id: 3, title: 'CEO Strategy Review', date: 8, month: 4, time: '2:00 PM', type: 'Strategy', owner: 'ceo', attendees: ['CEO', 'Sarah M.'], location: 'Boardroom' },
  { id: 4, title: 'Client Consultation — Sofia A.', date: 12, month: 4, time: '11:30 AM', type: 'Consultation', owner: 'team', attendees: ['Omar H.', 'Sofia A.'], location: 'DIFC Office' },
  { id: 5, title: 'Deal Closing — Marina Bay', date: 15, month: 4, time: '3:00 PM', type: 'Deal', owner: 'team', attendees: ['James C.', 'Marcus C.'], location: 'Dubai Marina' },
  { id: 6, title: 'Marketing Campaign Review', date: 20, month: 4, time: '10:00 AM', type: 'Meeting', owner: 'team', attendees: ['Marketing Team'], location: 'Office' },
];

const initialMarketingEvents: MarketingEvent[] = [
  { id: 1, title: 'Instagram Luxury Properties Campaign Launch', date: 2, month: 4, time: '9:00 AM', campaign: 'Q2 Luxury Push', channel: 'Instagram', budget: 'AED 15,000', notes: 'Target HNW audience in UAE & KSA' },
  { id: 2, title: 'Google Ads — Off-Plan Projects', date: 5, month: 4, time: '10:00 AM', campaign: 'Off-Plan Awareness', channel: 'Google Ads', budget: 'AED 25,000', notes: 'Focus on Skyline Residences & Marina Bay Towers' },
  { id: 3, title: 'Email Newsletter — May Edition', date: 10, month: 4, time: '8:00 AM', campaign: 'Monthly Newsletter', channel: 'Email', budget: 'AED 2,000', notes: 'Segment: Active leads + past clients' },
  { id: 4, title: 'LinkedIn B2B Campaign — Commercial', date: 14, month: 4, time: '11:00 AM', campaign: 'Commercial Outreach', channel: 'LinkedIn', budget: 'AED 8,000', notes: 'Target corporate decision makers' },
  { id: 5, title: 'Property Finder Premium Listing Renewal', date: 18, month: 4, time: '9:00 AM', campaign: 'Portal Listings', channel: 'Property Finder', budget: 'AED 12,000' },
  { id: 6, title: 'YouTube Virtual Tour Series — Episode 3', date: 22, month: 4, time: '2:00 PM', campaign: 'Video Content', channel: 'YouTube', budget: 'AED 5,000', notes: 'Palm Grove Villas walkthrough' },
  { id: 7, title: 'WhatsApp Broadcast — New Launches', date: 25, month: 4, time: '10:00 AM', campaign: 'Direct Outreach', channel: 'WhatsApp', budget: 'AED 1,000', notes: 'Send to qualified leads list' },
  { id: 8, title: 'Q2 Marketing Performance Review', date: 28, month: 4, time: '3:00 PM', campaign: 'Internal Review', channel: 'Internal', notes: 'Review ROI across all channels' },
];

const typeColors: Record<string, string> = {
  Viewing: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  Meeting: 'bg-primary/20 text-primary border-primary/30',
  Strategy: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
  Consultation: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  Deal: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  'Open House': 'bg-pink-400/20 text-pink-400 border-pink-400/30',
  Training: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
};

const channelColors: Record<string, string> = {
  Instagram: 'bg-pink-400/20 text-pink-400 border-pink-400/30',
  'Google Ads': 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  Email: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  LinkedIn: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  'Property Finder': 'bg-red-400/20 text-red-400 border-red-400/30',
  YouTube: 'bg-red-500/20 text-red-400 border-red-500/30',
  WhatsApp: 'bg-green-400/20 text-green-400 border-green-400/30',
  Internal: 'bg-primary/20 text-primary border-primary/30',
};

interface EventForm {
  title: string;
  date: string;
  time: string;
  type: string;
  attendees: string;
  location: string;
  notes: string;
}

interface MarketingEventForm {
  title: string;
  date: string;
  time: string;
  campaign: string;
  channel: string;
  budget: string;
  notes: string;
}

const emptyForm: EventForm = { title: '', date: '', time: '', type: 'Meeting', attendees: '', location: '', notes: '' };
const emptyMarketingForm: MarketingEventForm = { title: '', date: '', time: '', campaign: '', channel: 'Instagram', budget: '', notes: '' };

type CalendarTab = 'team' | 'ceo' | 'marketing';

function loadMarketingEventsFromStorage(base: MarketingEvent[]): MarketingEvent[] {
  if (typeof window === 'undefined') return base;
  try {
    const stored = localStorage.getItem(MARKETING_EVENTS_KEY);
    if (stored) {
      const parsed: MarketingEvent[] = JSON.parse(stored);
      const baseIds = new Set(base.map((e) => e.id));
      const newEvents = parsed.filter((e) => !baseIds.has(e.id));
      return [...base, ...newEvents];
    }
  } catch { /* ignore */ }
  return base;
}

function sendNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

function checkCalendarReminders(events: CalEvent[], currentMonth: number, currentYear: number) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  events.forEach((ev) => {
    if (ev.month !== currentMonth) return;
    const evDate = new Date(currentYear, ev.month, ev.date);
    evDate.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const tomorrowMidnight = new Date(tomorrow);
    tomorrowMidnight.setHours(0, 0, 0, 0);

    if (evDate.getTime() === todayMidnight.getTime()) {
      sendNotification(`Event Today: ${ev.type}`, `"${ev.title}" at ${ev.time}${ev.location ? ` — ${ev.location}` : ''}`);
    } else if (evDate.getTime() === tomorrowMidnight.getTime()) {
      sendNotification(`Event Tomorrow: ${ev.type}`, `"${ev.title}" at ${ev.time}${ev.location ? ` — ${ev.location}` : ''}`);
    }
  });
}

export default function CalendarPage() {
  const { isRole } = useRole();
  const canViewMarketing = isRole('super_admin', 'marketing');

  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [marketingEvents, setMarketingEvents] = useState<MarketingEvent[]>(() => loadMarketingEventsFromStorage(initialMarketingEvents));
  const [activeTab, setActiveTab] = useState<CalendarTab>('team');
  const [currentMonth, setCurrentMonth] = useState(4);
  const [currentYear, setCurrentYear] = useState(2026);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // Marketing calendar state
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [editMarketingEvent, setEditMarketingEvent] = useState<MarketingEvent | null>(null);
  const [marketingForm, setMarketingForm] = useState<MarketingEventForm>(emptyMarketingForm);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotifPermission(perm);
          if (perm === 'granted') {
            checkCalendarReminders(initialEvents, currentMonth, currentYear);
          }
        });
      } else if (Notification.permission === 'granted') {
        checkCalendarReminders(initialEvents, currentMonth, currentYear);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-check reminders when events or month changes
  useEffect(() => {
    if (notifPermission === 'granted') {
      checkCalendarReminders(events, currentMonth, currentYear);
    }
  }, [events, currentMonth, currentYear, notifPermission]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // CEO view: events owned by CEO. Team view: events owned by team.
  const visibleEvents = activeTab === 'ceo'
    ? events.filter((e) => e.owner === 'ceo')
    : events.filter((e) => e.owner === 'team');

  const getEventsForDay = (day: number) => {
    if (activeTab === 'marketing') {
      return marketingEvents.filter(e => e.date === day && e.month === currentMonth);
    }
    return visibleEvents.filter((e) => e.date === day && e.month === currentMonth);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const openNew = () => { setEditEvent(null); setForm(emptyForm); setShowModal(true); };
  const openNewMarketing = () => { setEditMarketingEvent(null); setMarketingForm(emptyMarketingForm); setShowMarketingModal(true); };

  const openNewWithDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditEvent(null);
    setForm({ ...emptyForm, date: dateStr, type: 'Meeting' });
    setShowModal(true);
  };

  const openNewMarketingWithDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setEditMarketingEvent(null);
    setMarketingForm({ ...emptyMarketingForm, date: dateStr });
    setShowMarketingModal(true);
  };

  const openEdit = (ev: CalEvent) => {
    setEditEvent(ev);
    setForm({
      title: ev.title,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(ev.date).padStart(2, '0')}`,
      time: ev.time,
      type: ev.type,
      attendees: ev.attendees.join(', '),
      location: ev.location || '',
      notes: ev.notes || '',
    });
    setShowModal(true);
  };

  const openEditMarketing = (ev: MarketingEvent) => {
    setEditMarketingEvent(ev);
    setMarketingForm({
      title: ev.title,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(ev.date).padStart(2, '0')}`,
      time: ev.time,
      campaign: ev.campaign,
      channel: ev.channel,
      budget: ev.budget || '',
      notes: ev.notes || '',
    });
    setShowMarketingModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.date) return;
    const d = new Date(form.date);
    const day = d.getDate();
    const month = d.getMonth();
    const attendeeList = form.attendees.split(',').map(a => a.trim()).filter(Boolean);
    const owner: 'ceo' | 'team' = activeTab === 'ceo' ? 'ceo' : 'team';
    if (editEvent) {
      setEvents(events.map(e => e.id === editEvent.id ? {
        ...e,
        title: form.title,
        date: day,
        month,
        time: form.time,
        type: form.type,
        attendees: attendeeList,
        location: form.location,
        notes: form.notes,
        owner: e.owner,
      } : e));
    } else {
      const newEvent: CalEvent = {
        id: Date.now(),
        title: form.title,
        date: day,
        month,
        time: form.time,
        type: form.type,
        owner,
        attendees: attendeeList,
        location: form.location,
        notes: form.notes,
      };
      setEvents([...events, newEvent]);
      // Notify for new event
      if (notifPermission === 'granted') {
        sendNotification('New Calendar Event Added', `"${form.title}" on ${form.date} at ${form.time || 'TBD'}`);
      }
    }
    setShowModal(false);
  };

  const handleSaveMarketing = () => {
    if (!marketingForm.title || !marketingForm.date) return;
    const d = new Date(marketingForm.date);
    const day = d.getDate();
    const month = d.getMonth();
    if (editMarketingEvent) {
      setMarketingEvents(marketingEvents.map(e => e.id === editMarketingEvent.id ? {
        ...e,
        title: marketingForm.title,
        date: day,
        month,
        time: marketingForm.time,
        campaign: marketingForm.campaign,
        channel: marketingForm.channel,
        budget: marketingForm.budget,
        notes: marketingForm.notes,
      } : e));
    } else {
      setMarketingEvents([...marketingEvents, {
        id: Date.now(),
        title: marketingForm.title,
        date: day,
        month,
        time: marketingForm.time,
        campaign: marketingForm.campaign,
        channel: marketingForm.channel,
        budget: marketingForm.budget,
        notes: marketingForm.notes,
      }]);
    }
    setShowMarketingModal(false);
  };

  const handleDelete = (id: number) => setEvents(events.filter(e => e.id !== id));
  const handleDeleteMarketing = (id: number) => setMarketingEvents(marketingEvents.filter(e => e.id !== id));

  const isMarketing = activeTab === 'marketing';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MONTHS[currentMonth]} {currentYear}</p>
        </div>
        <div className="flex items-center gap-3">
          {notifPermission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
            <button
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission().then((perm) => setNotifPermission(perm));
                }
              }}
              className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Icon name="BellIcon" size={14} />
              Enable Reminders
            </button>
          )}
          {notifPermission === 'granted' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Icon name="BellIcon" size={13} />
              Reminders On
            </span>
          )}
          <div className="flex items-center border border-border">
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'team' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Team View
            </button>
            <button
              onClick={() => setActiveTab('ceo')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'ceo' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              CEO View
            </button>
            {canViewMarketing && (
              <button
                onClick={() => setActiveTab('marketing')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'marketing' ? 'bg-pink-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Marketing
              </button>
            )}
          </div>
          <button
            onClick={isMarketing ? openNewMarketing : openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            Add {isMarketing ? 'Campaign Event' : activeTab === 'ceo' ? 'CEO Event' : 'Event'}
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          <Icon name="ChevronLeftIcon" size={16} />
        </button>
        <h2 className="text-base font-bold text-foreground">{MONTHS[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
          <Icon name="ChevronRightIcon" size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border overflow-hidden mb-6">
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] border-r border-b border-border last:border-r-0 bg-secondary/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const today = new Date();
            const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
            return (
              <div
                key={day}
                onClick={() => isMarketing ? openNewMarketingWithDate(day) : openNewWithDate(day)}
                className={`min-h-[90px] border-r border-b border-border last:border-r-0 p-1.5 cursor-pointer hover:bg-primary/5 transition-colors ${isToday ? 'bg-primary/10' : ''}`}
              >
                <span className={`text-xs font-bold mb-1 block w-6 h-6 flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground rounded-full' : 'text-muted-foreground'}`}>{day}</span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => {
                    if (isMarketing) {
                      const me = ev as MarketingEvent;
                      return (
                        <div key={me.id} className={`text-[9px] px-1 py-0.5 truncate border ${channelColors[me.channel] || 'bg-primary/20 text-primary border-primary/30'}`} onClick={(e) => { e.stopPropagation(); openEditMarketing(me); }}>
                          {me.title}
                        </div>
                      );
                    }
                    const ce = ev as CalEvent;
                    return (
                      <div key={ce.id} className={`text-[9px] px-1 py-0.5 truncate border ${typeColors[ce.type] || 'bg-primary/20 text-primary border-primary/30'}`} onClick={(e) => { e.stopPropagation(); openEdit(ce); }}>
                        {ce.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="bg-card border border-border">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {activeTab === 'ceo' ? 'CEO Events' : activeTab === 'marketing' ? 'Marketing Events' : 'Team Events'} — {MONTHS[currentMonth]}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {(isMarketing ? marketingEvents : visibleEvents)
            .filter(e => e.month === currentMonth)
            .sort((a, b) => a.date - b.date)
            .map((ev) => {
              if (isMarketing) {
                const me = ev as MarketingEvent;
                return (
                  <div key={me.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-center flex-shrink-0 w-10">
                        <p className="text-lg font-bold text-foreground leading-none">{me.date}</p>
                        <p className="text-[10px] text-muted-foreground">{MONTHS[me.month]?.slice(0, 3)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{me.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${channelColors[me.channel] || ''}`}>{me.channel}</span>
                          {me.campaign && <span className="text-xs text-muted-foreground truncate">{me.campaign}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {me.budget && <span className="text-xs text-primary font-semibold hidden sm:block">{me.budget}</span>}
                      <span className="text-xs text-muted-foreground">{me.time}</span>
                      <button onClick={() => openEditMarketing(me)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                      <button onClick={() => handleDeleteMarketing(me.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                    </div>
                  </div>
                );
              }
              const ce = ev as CalEvent;
              return (
                <div key={ce.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-center flex-shrink-0 w-10">
                      <p className="text-lg font-bold text-foreground leading-none">{ce.date}</p>
                      <p className="text-[10px] text-muted-foreground">{MONTHS[ce.month]?.slice(0, 3)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ce.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${typeColors[ce.type] || 'bg-primary/20 text-primary border-primary/30'}`}>{ce.type}</span>
                        {ce.location && <span className="text-xs text-muted-foreground truncate">{ce.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{ce.time}</span>
                    <button onClick={() => openEdit(ce)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={13} /></button>
                    <button onClick={() => handleDelete(ce.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={13} /></button>
                  </div>
                </div>
              );
            })}
          {(isMarketing ? marketingEvents : visibleEvents).filter(e => e.month === currentMonth).length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">No events this month.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">
                {editEvent ? 'Edit Event' : activeTab === 'ceo' ? 'Add CEO Event' : 'Add Team Event'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="Event title..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Time</label>
                  <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="e.g. 10:00 AM" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Event Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50">
                  <option>Meeting</option>
                  <option>Viewing</option>
                  <option>Consultation</option>
                  <option>Deal</option>
                  <option>Strategy</option>
                  <option>Open House</option>
                  <option>Training</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Attendees</label>
                <input value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="Comma-separated names..." />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="Location..." />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || !form.date} className="flex-1 py-2 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50">
                {editEvent ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Marketing Event Modal */}
      {showMarketingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground">{editMarketingEvent ? 'Edit Marketing Event' : 'Add Marketing Event'}</h2>
              <button onClick={() => setShowMarketingModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Title *</label>
                <input value={marketingForm.title} onChange={e => setMarketingForm({ ...marketingForm, title: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="Event title..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Date *</label>
                  <input type="date" value={marketingForm.date} onChange={e => setMarketingForm({ ...marketingForm, date: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Time</label>
                  <input value={marketingForm.time} onChange={e => setMarketingForm({ ...marketingForm, time: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="e.g. 10:00 AM" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Campaign</label>
                <input value={marketingForm.campaign} onChange={e => setMarketingForm({ ...marketingForm, campaign: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="Campaign name..." />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Channel</label>
                <select value={marketingForm.channel} onChange={e => setMarketingForm({ ...marketingForm, channel: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50">
                  <option>Instagram</option><option>Google Ads</option><option>Email</option>
                  <option>LinkedIn</option><option>Property Finder</option><option>YouTube</option>
                  <option>WhatsApp</option><option>Internal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Budget</label>
                <input value={marketingForm.budget} onChange={e => setMarketingForm({ ...marketingForm, budget: e.target.value })} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50" placeholder="e.g. AED 5,000" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Notes</label>
                <textarea value={marketingForm.notes} onChange={e => setMarketingForm({ ...marketingForm, notes: e.target.value })} rows={2} className="w-full bg-secondary border border-border text-sm text-foreground px-3 py-2 focus:outline-none focus:border-primary/50 resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowMarketingModal(false)} className="flex-1 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSaveMarketing} disabled={!marketingForm.title || !marketingForm.date} className="flex-1 py-2 bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition-colors disabled:opacity-50">
                {editMarketingEvent ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
