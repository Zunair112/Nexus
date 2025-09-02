import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Building2, CircleDollarSign, Users, MessageCircle, 
  Bell, FileText, Settings, HelpCircle, Video, Phone, Calendar as CalendarIcon
} from 'lucide-react';
// Import VideoCall component - adjust path as needed
// import { VideoCall } from '../ui/VideoCall';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center py-2.5 px-4 rounded-md transition-colors duration-200 ${
          isActive 
            ? 'bg-primary-50 text-primary-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </NavLink>
  );
};

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  lastCall?: string;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  if (!user) return null;
  
  // Mock contacts - in real app, fetch from API based on user connections
  const recentContacts: Contact[] = [
    { id: '1', name: 'Sarah Johnson', role: 'Investor', status: 'online', lastCall: '2 hours ago' },
    { id: '2', name: 'Mike Chen', role: 'Entrepreneur', status: 'away', lastCall: 'Yesterday' },
    { id: '3', name: 'Emma Davis', role: 'Investor', status: 'offline', lastCall: '3 days ago' },
    { id: '4', name: 'Alex Rodriguez', role: 'Entrepreneur', status: 'online', lastCall: 'Last week' }
  ];
  
  // Define sidebar items based on user role
  const entrepreneurItems = [
    { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/calendar', icon: <CalendarIcon size={20} />, text: 'Calendar' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
  ];
  
  const investorItems = [
    { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/calendar', icon: <CalendarIcon size={20} />, text: 'Calendar' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
  ];
  
  const sidebarItems = user.role === 'entrepreneur' ? entrepreneurItems : investorItems;
  
  // Common items at the bottom
  const commonItems = [
    { to: '/settings', icon: <Settings size={20} />, text: 'Settings' },
    { to: '/help', icon: <HelpCircle size={20} />, text: 'Help & Support' },
  ];

  const handleContactCall = (contact: Contact) => {
    setSelectedContact(contact);
    setIsVideoCallOpen(true);
  };
  
  return (
    <>
      <div className="w-64 bg-white h-full border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col">
          <div className="flex-1 py-4 overflow-y-auto">
            <div className="px-3 space-y-1">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  text={item.text}
                />
              ))}
            </div>
            
            {/* Video Calls Section */}
            <div className="mt-8 px-3">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Video Calls
                </h3>
                <button
                  onClick={() => setIsVideoCallOpen(true)}
                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                  title="Start New Call"
                >
                  <Video size={16} />
                </button>
              </div>
              
              {/* Quick Call Button */}
              <button
                onClick={() => setIsVideoCallOpen(true)}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200 mb-3"
              >
                <Video size={18} className="mr-3 text-primary-600" />
                Start Video Call
              </button>

              {/* Recent Contacts */}
              <div className="space-y-1">
                <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Contacts</p>
                {recentContacts.slice(0, 4).map((contact) => (
                  <div key={contact.id} className="group">
                    <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-md transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            contact.status === 'online' ? 'bg-green-500' :
                            contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleContactCall(contact)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 rounded transition-all duration-200"
                        title={`Call ${contact.name}`}
                      >
                        <Phone size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 px-3">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                {commonItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    to={item.to}
                    icon={item.icon}
                    text={item.text}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs text-gray-600">Need assistance?</p>
              <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
              <a 
                href="mailto:support@businessnexus.com" 
                className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
              >
                support@businessnexus.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal - Uncomment when VideoCall component is available */}
      {/* 
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => {
          setIsVideoCallOpen(false);
          setSelectedContact(null);
        }}
        recipientName={selectedContact?.name || "Select Contact"}
        recipientId={selectedContact?.id || ""}
      />
      */}
    </>
  );
};