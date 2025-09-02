import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Video,
  MapPin,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from "lucide-react";


interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  type: 'video' | 'in-person' | 'phone';
  location?: string;
  status: 'confirmed' | 'pending' | 'declined';
  organizer: string;
  description?: string;
}

interface MeetingRequest {
  id: string;
  from: string;
  fromName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'video' | 'in-person' | 'phone';
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<Record<string, TimeSlot[]>>({});
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);

  // Mock data - In real app, fetch from API
  useEffect(() => {
    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Pitch Presentation',
        date: '2025-09-05',
        startTime: '10:00',
        endTime: '11:00',
        attendees: ['investor@example.com'],
        type: 'video',
        status: 'confirmed',
        organizer: user?.id || 'current-user',
        description: 'Present our Q3 growth strategy'
      },
      {
        id: '2',
        title: 'Team Standup',
        date: '2025-09-03',
        startTime: '09:00',
        endTime: '09:30',
        attendees: ['team@company.com'],
        type: 'video',
        status: 'confirmed',
        organizer: user?.id || 'current-user'
      }
    ];

    const mockRequests: MeetingRequest[] = [
      {
        id: '1',
        from: 'investor123',
        fromName: 'Sarah Johnson',
        date: '2025-09-06',
        startTime: '14:00',
        endTime: '15:00',
        title: 'Investment Discussion',
        message: 'Would love to discuss your latest product roadmap.',
        status: 'pending',
        type: 'video'
      },
      {
        id: '2',
        from: 'entrepreneur456',
        fromName: 'Mike Chen',
        date: '2025-09-07',
        startTime: '11:00',
        endTime: '12:00',
        title: 'Partnership Opportunity',
        status: 'pending',
        type: 'in-person'
      }
    ];

    setMeetings(mockMeetings);
    setMeetingRequests(mockRequests);

    // Mock availability slots
    const today = new Date();
    const mockAvailability: Record<string, TimeSlot[]> = {};
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      mockAvailability[dateStr] = [
        { id: '1', startTime: '09:00', endTime: '10:00', isAvailable: true },
        { id: '2', startTime: '10:00', endTime: '11:00', isAvailable: i % 3 !== 0 },
        { id: '3', startTime: '11:00', endTime: '12:00', isAvailable: true },
        { id: '4', startTime: '14:00', endTime: '15:00', isAvailable: i % 2 !== 0 },
        { id: '5', startTime: '15:00', endTime: '16:00', isAvailable: true },
        { id: '6', startTime: '16:00', endTime: '17:00', isAvailable: i % 4 !== 0 }
      ];
    }
    
    setAvailabilitySlots(mockAvailability);
  }, [user]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
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

  const getAvailabilitiesForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return availabilitySlots[dateStr] || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRequestResponse = (requestId: string, action: 'accept' | 'decline') => {
    setMeetingRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
          : req
      )
    );

    if (action === 'accept') {
      const request = meetingRequests.find(req => req.id === requestId);
      if (request) {
        const newMeeting: Meeting = {
          id: Date.now().toString(),
          title: request.title,
          date: request.date,
          startTime: request.startTime,
          endTime: request.endTime,
          attendees: [request.from],
          type: request.type,
          status: 'confirmed',
          organizer: request.from,
          description: request.message
        };
        setMeetings(prev => [...prev, newMeeting]);
      }
    }
  };

  const NewMeetingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Schedule New Meeting</h3>
          <button onClick={() => setShowNewMeetingModal(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={selectedDate ? formatDate(selectedDate) : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="video">Video Call</option>
              <option value="in-person">In Person</option>
              <option value="phone">Phone Call</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email addresses"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewMeetingModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AvailabilityModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Set Availability</h3>
          <button onClick={() => setShowAvailabilityModal(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={selectedDate ? formatDate(selectedDate) : ''}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="09:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="17:00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedDate && getAvailabilitiesForDate(selectedDate).map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                  <button
                    onClick={() => {
                      const dateStr = formatDate(selectedDate);
                      setAvailabilitySlots(prev => ({
                        ...prev,
                        [dateStr]: prev[dateStr]?.map(s => 
                          s.id === slot.id ? { ...s, isAvailable: !s.isAvailable } : s
                        ) || []
                      }));
                    }}
                    className={`px-2 py-1 rounded text-xs ${
                      slot.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAvailabilityModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MeetingRequestsPanel = () => (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg z-40 transform transition-transform">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Meeting Requests</h3>
          <button onClick={() => setShowRequestsPanel(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {meetingRequests.filter(req => req.status === 'pending').map((request) => (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{request.title}</h4>
                  <p className="text-sm text-gray-600">From: {request.fromName}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {request.type === 'video' && <Video size={16} className="text-blue-500" />}
                  {request.type === 'in-person' && <MapPin size={16} className="text-green-500" />}
                  {request.type === 'phone' && <Clock size={16} className="text-orange-500" />}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>{request.date} at {request.startTime} - {request.endTime}</p>
                {request.message && <p className="mt-1 italic">"{request.message}"</p>}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequestResponse(request.id, 'accept')}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </button>
                <button
                  onClick={() => handleRequestResponse(request.id, 'decline')}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  <X size={16} className="mr-1" />
                  Decline
                </button>
              </div>
            </div>
          ))}
          
          {meetingRequests.filter(req => req.status === 'pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No pending requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const pendingRequestsCount = meetingRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <CalendarIcon className="mr-3 text-blue-600" size={28} />
                Calendar
              </h1>
              <p className="text-gray-600 mt-1">Manage your meetings and availability</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowRequestsPanel(true)}
                className="relative flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Users size={18} className="mr-2" />
                Requests
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowAvailabilityModal(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Clock size={18} className="mr-2" />
                Set Availability
              </button>
              
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                New Meeting
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <h2 className="text-lg font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-24" />;
                    }
                    
                    const isToday = day.toDateString() === today.toDateString();
                    const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                    const dayMeetings = getMeetingsForDate(day);
                    const dayAvailabilities = getAvailabilitiesForDate(day);
                    const availableSlots = dayAvailabilities.filter(slot => slot.isAvailable).length;
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`p-2 h-24 border rounded-md cursor-pointer transition-colors relative ${
                          isToday 
                            ? 'bg-blue-50 border-blue-300' 
                            : isSelected
                            ? 'bg-blue-100 border-blue-400'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm font-medium ${
                          isToday ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        {/* Meeting indicators */}
                        <div className="mt-1 space-y-1">
                          {dayMeetings.slice(0, 2).map((meeting) => (
                            <div
                              key={meeting.id}
                              className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                                meeting.type === 'video' ? 'bg-blue-500' :
                                meeting.type === 'in-person' ? 'bg-green-500' : 'bg-orange-500'
                              }`}
                            >
                              {meeting.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayMeetings.length - 2} more
                            </div>
                          )}
                        </div>
                        
                        {/* Availability indicator */}
                        {availableSlots > 0 && (
                          <div className="absolute bottom-1 right-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full" title={`${availableSlots} available slots`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {/* Meetings for selected date */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Meetings</h4>
                  {getMeetingsForDate(selectedDate).map((meeting) => (
                    <div key={meeting.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">{meeting.title}</h5>
                        <div className="flex items-center space-x-1">
                          {meeting.type === 'video' && <Video size={14} className="text-blue-500" />}
                          {meeting.type === 'in-person' && <MapPin size={14} className="text-green-500" />}
                          {meeting.type === 'phone' && <Clock size={14} className="text-orange-500" />}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {meeting.startTime} - {meeting.endTime}
                      </p>
                      {meeting.description && (
                        <p className="text-sm text-gray-600">{meeting.description}</p>
                      )}
                      <div className="flex space-x-2">
                        <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          <Edit3 size={12} className="inline mr-1" />
                          Edit
                        </button>
                        <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                          <Trash2 size={12} className="inline mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {getMeetingsForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-gray-500">No meetings scheduled</p>
                  )}
                </div>
                
                {/* Available slots for selected date */}
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Available Slots</h4>
                  {getAvailabilitiesForDate(selectedDate)
                    .filter(slot => slot.isAvailable)
                    .map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <span className="text-sm text-green-800">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                          Book
                        </button>
                      </div>
                    ))}
                  
                  {getAvailabilitiesForDate(selectedDate).filter(slot => slot.isAvailable).length === 0 && (
                    <p className="text-sm text-gray-500">No available slots</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming Meetings</h3>
              <div className="space-y-3">
                {meetings
                  .filter(meeting => new Date(meeting.date) >= today)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 3)
                  .map((meeting) => (
                    <div key={meeting.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <h4 className="font-medium text-gray-900 text-sm">{meeting.title}</h4>
                      <p className="text-xs text-gray-600">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.startTime}
                      </p>
                      <div className="flex items-center mt-1">
                        {meeting.type === 'video' && <Video size={12} className="text-blue-500 mr-1" />}
                        {meeting.type === 'in-person' && <MapPin size={12} className="text-green-500 mr-1" />}
                        {meeting.type === 'phone' && <Clock size={12} className="text-orange-500 mr-1" />}
                        <span className="text-xs text-gray-500 capitalize">{meeting.type}</span>
                      </div>
                    </div>
                  ))}
                
                {meetings.filter(meeting => new Date(meeting.date) >= today).length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming meetings</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowNewMeetingModal(true)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-2 text-green-600" />
                  Schedule Meeting
                </button>
                
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Clock size={16} className="mr-2 text-blue-600" />
                  Update Availability
                </button>
                
                <button
                  onClick={() => setShowRequestsPanel(true)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Bell size={16} className="mr-2 text-orange-600" />
                  View Requests ({pendingRequestsCount})
                </button>
              </div>
            </div>

            {/* Meeting Types Legend */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Meeting Types</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Video size={16} className="text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Video Call</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">In Person</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-orange-500 mr-2" />
                  <span className="text-sm text-gray-700">Phone Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewMeetingModal && <NewMeetingModal />}
      {showAvailabilityModal && <AvailabilityModal />}
      {showRequestsPanel && <MeetingRequestsPanel />}
    </div>
  );
};

export { Calendar };