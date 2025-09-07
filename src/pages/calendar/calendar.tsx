import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, X, Check, MessageSquare, Video } from 'lucide-react';

// Mock data for demonstration
const mockMeetings = [
  {
    id: '1',
    title: 'Pitch Review with TechVentures',
    date: '2025-09-05',
    time: '10:00',
    duration: 60,
    type: 'investor-meeting',
    status: 'confirmed',
    participants: ['John Smith', 'Sarah Johnson'],
    meetingType: 'video'
  },
  {
    id: '2',
    title: 'Q3 Strategy Discussion',
    date: '2025-09-08',
    time: '14:00',
    duration: 90,
    type: 'internal',
    status: 'pending',
    participants: ['Team Lead'],
    meetingType: 'in-person'
  }
];

const mockAvailability = [
  { date: '2025-09-05', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { date: '2025-09-06', slots: ['10:00', '11:00', '13:00', '16:00'] },
  { date: '2025-09-09', slots: ['09:00', '10:00', '14:00', '15:00', '16:00'] }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState('calendar'); // 'calendar', 'availability', 'requests'
  const [meetings, setMeetings] = useState(mockMeetings);
  const [availability, setAvailability] = useState(mockAvailability);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    participants: '',
    meetingType: 'video',
    type: 'investor-meeting'
  });

  const [newAvailabilityDate, setNewAvailabilityDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMeetingsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return meetings.filter(meeting => meeting.date === dateStr);
  };

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return availability.find(avail => avail.date === dateStr);
  };

  const handleCreateMeeting = () => {
    const meeting = {
      id: Date.now().toString(),
      ...newMeeting,
      status: 'pending',
      participants: newMeeting.participants.split(',').map(p => p.trim()).filter(p => p)
    };
    
    setMeetings([...meetings, meeting]);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      duration: 60,
      participants: '',
      meetingType: 'video',
      type: 'investor-meeting'
    });
    setShowNewMeetingModal(false);
  };

  const handleUpdateMeetingStatus = (meetingId: string, newStatus: string) => {
    setMeetings(meetings.map(meeting =>
      meeting.id === meetingId ? { ...meeting, status: newStatus } : meeting
    ));
  };

  const handleAddAvailability = () => {
    const existing = availability.find(avail => avail.date === newAvailabilityDate);
    
    if (existing) {
      setAvailability(availability.map(avail =>
        avail.date === newAvailabilityDate
          ? { ...avail, slots: [...new Set([...avail.slots, ...selectedTimeSlots])] }
          : avail
      ));
    } else {
      setAvailability([...availability, {
        date: newAvailabilityDate,
        slots: selectedTimeSlots
      }]);
    }
    
    setNewAvailabilityDate('');
    setSelectedTimeSlots([]);
    setShowAvailabilityModal(false);
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const pendingMeetings = meetings.filter(meeting => meeting.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Calendar</h1>
          <p className="text-gray-600">Manage your meetings and availability</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView('availability')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'availability' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Availability
          </button>
          <button
            onClick={() => setView('requests')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Requests
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold text-gray-900">{monthYear}</h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
            
            <button
              onClick={() => setShowNewMeetingModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Meeting
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = formatDate(day) === formatDate(new Date());
              const dayMeetings = getMeetingsForDate(day);
              const dayAvailability = getAvailabilityForDate(day);
              
              return (
                <div
                  key={`${formatDate(day)}-${index}`}
                  className={`min-h-[100px] p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </div>
                  
                  {dayAvailability && (
                    <div className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded mb-1">
                      Available
                    </div>
                  )}
                  
                  {dayMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className={`text-xs p-1 rounded mb-1 truncate cursor-pointer ${
                        meeting.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMeeting(meeting);
                      }}
                    >
                      {meeting.time} {meeting.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Availability View */}
      {view === 'availability' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manage Availability</h2>
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Availability
            </button>
          </div>

          <div className="grid gap-4">
            {availability.map((avail, index) => (
              <div key={`${avail.date}-${index}`} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {new Date(avail.date + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <span className="text-sm text-gray-500">{avail.slots.length} slots</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {avail.slots.map((slot, slotIndex) => (
                    <span
                      key={`${slot}-${slotIndex}`}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Requests View */}
      {view === 'requests' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Meeting Requests</h2>
          
          <div className="grid gap-4">
            {pendingMeetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-gray-600">
                      {new Date(meeting.date + 'T00:00:00').toLocaleDateString()} at {meeting.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Duration: {meeting.duration} minutes • {meeting.meetingType}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateMeetingStatus(meeting.id, 'confirmed')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateMeetingStatus(meeting.id, 'declined')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {meeting.participants.join(', ')}
                  </div>
                  {meeting.meetingType === 'video' && (
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      Video call
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {pendingMeetings.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending meeting requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Schedule New Meeting</h3>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <select
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
                </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                <input
                  type="text"
                  value={newMeeting.participants}
                  onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter participant emails, separated by commas"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type</label>
                <select
                  value={newMeeting.meetingType}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meetingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Availability</h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newAvailabilityDate}
                  onChange={(e) => setNewAvailabilityDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleTimeSlot(slot)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedTimeSlots.includes(slot)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAvailability}
                disabled={!newAvailabilityDate || selectedTimeSlots.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Meeting Details</h3>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{selectedMeeting.title}</h4>
                <p className="text-gray-600">
                  {new Date(selectedMeeting.date + 'T00:00:00').toLocaleDateString()} at {selectedMeeting.time}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedMeeting.duration} minutes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedMeeting.participants.join(', ')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedMeeting.meetingType === 'video' && <Video className="w-4 h-4 text-gray-500" />}
                <span className="text-sm text-gray-600 capitalize">{selectedMeeting.meetingType} meeting</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  selectedMeeting.status === 'confirmed' ? 'bg-green-500' :
                  selectedMeeting.status === 'pending' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 capitalize">{selectedMeeting.status}</span>
              </div>
              
              {selectedMeeting.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      handleUpdateMeetingStatus(selectedMeeting.id, 'declined');
                      setSelectedMeeting(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateMeetingStatus(selectedMeeting.id, 'confirmed');
                      setSelectedMeeting(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Detail */}
      {selectedDate && view === 'calendar' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Meetings for selected date */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Meetings</h4>
              {getMeetingsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getMeetingsForDate(selectedDate).map(meeting => (
                    <div key={meeting.id} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-blue-900">{meeting.title}</p>
                          <p className="text-sm text-blue-700">{meeting.time} - {meeting.duration}min</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          meeting.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No meetings scheduled</p>
              )}
            </div>
            
            {/* Availability for selected date */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
              {getAvailabilityForDate(selectedDate) ? (
                <div className="flex flex-wrap gap-2">
                  {getAvailabilityForDate(selectedDate)?.slots.map((slot, index) => (
                    <span
                      key={`${slot}-${index}`}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No availability set</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};