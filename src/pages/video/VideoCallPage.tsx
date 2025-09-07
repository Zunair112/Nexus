import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Monitor, Users, Settings, Maximize2, Volume2, User
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface CallParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  stream?: MediaStream;
}

export const VideoCallPage: React.FC = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Media controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // UI state
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<number | null>(null);
  
  // Mock participants for demo
  const [participants] = useState<CallParticipant[]>([
    {
      id: 'participant-1',
      name: 'Sarah Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      isAudioEnabled: true,
      isVideoEnabled: true,
    },
    {
      id: 'participant-2', 
      name: 'Michael Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isAudioEnabled: true,
      isVideoEnabled: false,
    }
  ]);
  
  // Initialize WebRTC
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Initialize peer connection
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        });
        
        peerConnectionRef.current = peerConnection;
        
        // Add local stream to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
        
        // Handle remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };
    
    initializeWebRTC();
    
    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);
  
  // Start call timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive]);
  
  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartCall = async () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsCallActive(true);
    }, 2000);
  };
  
  const handleEndCall = () => {
    setIsCallActive(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/messages');
  };
  
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };
  
  const toggleAudio = async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };
  
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Replace video track in peer connection
        if (peerConnectionRef.current && localStreamRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(cameraStream => {
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = cameraStream;
              }
            });
        };
      } else {
        // Stop screen sharing and switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error with screen sharing:', error);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Auto-hide controls
  useEffect(() => {
    let timeout: number;
    
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (isCallActive) {
          setIsControlsVisible(false);
        }
      }, 3000);
    };
    
    if (isCallActive) {
      document.addEventListener('mousemove', handleMouseMove);
      timeout = window.setTimeout(() => setIsControlsVisible(false), 3000);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isCallActive]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Main video container */}
      <div className="h-full flex">
        {/* Remote video (main view) */}
        <div className="flex-1 relative">
          {isCallActive ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              {isConnecting ? (
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-lg">Connecting...</p>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Video size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">Ready to start video call</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Call ID: {callId || 'new-call'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Local video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User size={24} />
                  </div>
                  <p className="text-xs">{user.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Participants sidebar (when call is active) */}
        {isCallActive && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center">
                <Users size={20} className="mr-2" />
                Participants ({participants.length + 1})
              </h3>
              <span className="text-sm text-gray-400">{formatDuration(callDuration)}</span>
            </div>
            
            <div className="space-y-3">
              {/* Current user */}
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{user.name} (You)</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {isVideoEnabled ? (
                      <Video size={14} className="text-green-400" />
                    ) : (
                      <VideoOff size={14} className="text-red-400" />
                    )}
                    {isAudioEnabled ? (
                      <Mic size={14} className="text-green-400" />
                    ) : (
                      <MicOff size={14} className="text-red-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Other participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center p-3 bg-gray-700 rounded-lg">
                  <img
                    src={participant.avatarUrl}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{participant.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {participant.isVideoEnabled ? (
                        <Video size={14} className="text-green-400" />
                      ) : (
                        <VideoOff size={14} className="text-red-400" />
                      )}
                      {participant.isAudioEnabled ? (
                        <Mic size={14} className="text-green-400" />
                      ) : (
                        <MicOff size={14} className="text-red-400" />
                      )}
                    </div>
                  </div>
                  <Volume2 size={16} className="text-gray-400" />
                </div>
              ))}
            </div>
            
            {/* Call settings */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <Button
                className="w-full text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent border-none"
              >
                <Settings size={16} className="mr-2" />
                Call Settings
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Call controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
        isControlsVisible || !isCallActive ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-center space-x-4">
          {!isCallActive ? (
            /* Pre-call controls */
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleVideo}
                className={`rounded-full p-4 ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
              </Button>
              
              <Button
                onClick={toggleAudio}
                className={`rounded-full p-4 ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
              </Button>
              
              <Button
                onClick={handleStartCall}
                disabled={isConnecting}
                className="rounded-full p-6 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Phone size={28} />
                )}
              </Button>
            </div>
          ) : (
            /* In-call controls */
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleVideo}
                className={`rounded-full p-3 ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </Button>
              
              <Button
                onClick={toggleAudio}
                className={`rounded-full p-3 ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>
              
              <Button
                onClick={toggleScreenShare}
                className={`rounded-full p-3 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
              >
                <Monitor size={20} />
              </Button>
              
              <Button
                onClick={toggleFullscreen}
                className="rounded-full p-3 bg-gray-600 hover:bg-gray-500 text-white"
              >
                <Maximize2 size={20} />
              </Button>
              
              <Button
                onClick={handleEndCall}
                className="rounded-full p-4 bg-red-600 hover:bg-red-700 text-white"
              >
                <PhoneOff size={24} />
              </Button>
            </div>
          )}
        </div>
        
        {/* Call info */}
        {isCallActive && (
          <div className="text-center mt-4">
            <p className="text-white text-sm">
              {isScreenSharing ? 'Screen sharing active' : 'Video call active'} • {formatDuration(callDuration)}
            </p>
          </div>
        )}
      </div>
      
      {/* Call header */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 ${
        isControlsVisible || !isCallActive ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-lg font-medium">
              {isCallActive ? 'Video Call' : 'Start Video Call'}
            </h1>
            {callId && (
              <p className="text-sm text-gray-300">Call ID: {callId}</p>
            )}
          </div>
          
          {isCallActive && (
            <div className="flex items-center space-x-2 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live • {participants.length + 1} participants</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection status overlay */}
      {isConnecting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-800 font-medium">Connecting to call...</p>
            <p className="text-gray-600 text-sm mt-1">Please wait while we establish the connection</p>
          </div>
        </div>
      )}
    </div>
  );
};