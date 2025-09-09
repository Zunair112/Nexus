import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, CircleDollarSign, Wallet, Calendar, Video, 
  FileText, MessageCircle, Bell, Settings, Shield, HelpCircle
} from 'lucide-react';

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

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Dashboard route based on role (matching Navbar logic)
  const dashboardRoute = user?.role === 'entrepreneur' 
    ? '/dashboard/entrepreneur' 
    : '/dashboard/investor';
  
  // Profile route based on role and ID (matching Navbar logic)
  const profileRoute = `/profile/${user.role}/${user.id}`;
  
  // Main navigation items (matching Navbar structure)
  const mainNavItems = [
    {
      icon: user?.role === 'entrepreneur' ? <Building2 size={20} /> : <CircleDollarSign size={20} />,
      text: 'Dashboard',
      path: dashboardRoute,
    },
    {
      icon: <Wallet size={20} />,
      text: 'Payments',
      path: '/payments',
    },
    {
      icon: <Calendar size={20} />,
      text: 'Calendar',
      path: '/calendar',
    },
    {
      icon: <Video size={20} />,
      text: 'Video Call',
      path: '/video-call',
    },
    {
      icon: <FileText size={20} />,
      text: 'Documents',
      path: '/document-chamber',
    },
    {
      icon: <MessageCircle size={20} />,
      text: 'Messages',
      path: '/messages',
    },
    {
      icon: <Bell size={20} />,
      text: 'Notifications',
      path: '/notifications',
    }
  ];
  
  // Settings section items (matching Navbar user menu)
  const settingsItems = [
    {
      icon: <Settings size={20} />,
      text: 'Settings',
      path: '/settings',
    },
    {
      icon: <Shield size={20} />,
      text: 'Security',
      path: '/settings/security',
    },
    {
      icon: <HelpCircle size={20} />,
      text: 'Help & Support',
      path: '/help',
    }
  ];
  
  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 hidden md:block">
      <div className="h-full flex flex-col">
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <NavLink 
            to={profileRoute}
            className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              {user?.role === 'entrepreneur' ? (
                <Building2 size={20} className="text-white" />
              ) : (
                <CircleDollarSign size={20} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user.role === 'entrepreneur' ? 'My Startup' : 'My Portfolio'}
              </p>
            </div>
          </NavLink>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          {/* Main Navigation */}
          <div className="px-3 space-y-1">
            {mainNavItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.path}
                icon={item.icon}
                text={item.text}
              />
            ))}
          </div>
          
          {/* Settings Section */}
          <div className="mt-8 px-3">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            <div className="mt-2 space-y-1">
              {settingsItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.path}
                  icon={item.icon}
                  text={item.text}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Support Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600">Need assistance?</p>
            <h4 className="text-sm font-medium text-gray-900 mt-1">Contact Support</h4>
            <a 
              href="mailto:support@businessnexus.com" 
              className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              support@businessnexus.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};