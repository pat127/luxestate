'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalEvent {
  id: number;
  title: string;
  date: number;
  month: number;
  time: string;
  type: string;
  attendees: string[];
  location?: string;
  notes?: string;
}

const initialEvents: CalEvent[] = [
  { id: 1, title: 'Property Viewing — Obsidian Penthouse', date: 3, month: 4, time: '10:00 AM', type: 'Viewing', attendees: ['Sarah M.', 'James H.'], location: 'Downtown Dubai' },
  { id: 2, title: 'Team Standup', date: 5, month: 4, time: '9:00 AM', type: 'Meeting', attendees: ['All Team'], location: 'Office' },
  { id: 3, title: 'CEO Strategy Review', date: 8, month: 4, time: '2:00 PM', type: 'CEO', attendees: ['CEO', 'Sarah M.'], location: 'Boardroom' },
  { id: 4, title: 'Client Consultation — Sofia A.', date: 12, month: 4, time: '11:30 AM', type: 'Consultation', attendees: ['Omar H.', 'Sofia A.'], location: 'DIFC Office' },
  { id: 5, title: 'Deal Closing — Marina Bay', date: 15, month: 4, time: '3:00 PM', type: 'Deal', attendees: ['James C.', 'Marcus C.'], location: 'Dubai Marina' },
  { id: 6, title: 'Marketing Campaign Review', date: 20, month: 4, time: '10:00 AM', type: 'Meeting', attendees: ['Marketing Team'], location: 'Office' },
];

const typeColors: Record<string, string> = {
  Viewing: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
  Meeting: 'bg-primary/20 text-primary border-primary/30',
  CEO: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
  Consultation: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  Deal: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
  'Open House': 'bg-pink-400/20 text-pink-400 border-pink-400/30',
  Training: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
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

const emptyForm: EventForm = {
  title: '',
  date: '',
  time: '',
  type: 'Meeting',
  attendees: '',
  location: '',
  notes: '',
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>(initialEvents);
  const [view, setView] = useState<'team' | 'ceo'>('team');
  const [currentMonth, setCurrentMonth] = useState(4);
  const [currentYear, setCurrentYear] = useState(2026);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const visibleEvents = view === 'ceo'
    ? events.filter((e) => e.type === 'CEO')
    : events.filter((e) => e.type !== 'CEO');

  const getEventsForDay = (day: number) => visibleEvents.filter((e) => e.date === day && e.month === currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const openNew = () => {
    setEditEvent(null);
    setForm(emptyForm);
    setShowModal(true);
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

  const handleSave = () => {
    if (!form.title || !form.date) return;
    const d = new Date(form.date);
    const day = d.getDate();
    const month = d.getMonth();
    const attendeeList = form.attendees.split(',').map(a => a.trim()).filter(Boolean);
    if (editEvent) {
      setEvents(events.map(e => e.id === editEvent.id ? { ...e, title: form.title, date: day, month, time: form.time, type: form.type, attendees: attendeeList, location: form.location, notes: form.notes } : e));
    } else {
      setEvents([...events, { id: Date.now(), title: form.title, date: day, month, time: form.time, type: form.type, attendees: attendeeList, location: form.location, notes: form.notes }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{MONTHS[currentMonth]} {currentYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border">
            <button
              onClick={() => setView('team')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${view === 'team' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Team View
            </button>
            <button
              onClick={() => setView('ceo')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${view === 'ceo' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              CEO View
            </button>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-card border border-border">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={prevMonth} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ChevronLeftIcon" size={16} />
            </button>
            <span className="text-sm font-bold text-foreground">{MONTHS[currentMonth]} {currentYear}</span>
            <button onClick={nextMonth} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ChevronRightIcon" size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-b border-r border-border bg-black/20" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 1 && currentMonth === 4 && currentYear === 2026;
              return (
                <div key={day} className={`h-20 border-b border-r border-border p-1.5 hover:bg-white/2 transition-colors cursor-pointer ${isToday ? 'bg-primary/5' : ''}`} onClick={openNew}>
                  <span className={`text-xs font-bold inline-flex w-5 h-5 items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-semibold px-1 py-0.5 truncate border cursor-pointer ${typeColors[ev.type] || ''}`}
                        onClick={(e) => { e.stopPropagation(); openEdit(ev); }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card border border-border p-4">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
            {view === 'ceo' ? 'CEO Schedule' : 'Upcoming Events'}
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {visibleEvents.map((ev) => (
              <div key={ev.id} className={`p-3 border ${typeColors[ev.type] || 'border-border'}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground leading-tight">{ev.title}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${typeColors[ev.type] || ''}`}>{ev.type}</span>
                    <button onClick={() => openEdit(ev)} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"><Icon name="PencilIcon" size={10} /></button>
                    <button onClick={() => handleDelete(ev.id)} className="p-0.5 text-muted-foreground hover:text-red-400 transition-colors"><Icon name="TrashIcon" size={10} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Icon name="ClockIcon" size={10} />
                    {ev.time}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Icon name="CalendarIcon" size={10} />
                    {MONTHS[ev.month].slice(0, 3)} {ev.date}
                  </span>
                </div>
                {ev.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="MapPinIcon" size={10} className="text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{ev.location}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {ev.attendees.map((a) => (
                    <span key={a} className="text-[9px] bg-white/5 border border-border px-1.5 py-0.5 text-muted-foreground">{a}</span>
                  ))}
                </div>
              </div>
            ))}
            {visibleEvents.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No events for this view</p>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Event title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                  <option>Meeting</option><option>Viewing</option><option>Consultation</option><option>Deal</option><option>CEO</option><option>Open House</option><option>Training</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="Event location" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Attendees (comma-separated)</label>
                <input type="text" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Sarah M., James C." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Event notes..." />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editEvent ? 'Update Event' : 'Save Event'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
