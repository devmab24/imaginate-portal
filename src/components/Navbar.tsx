
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Image as ImageIcon,
  History, 
  Home,
  UserCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const location = useLocation();
  const navigate = useNavigate();

  // Refresh user data when the navbar mounts or when auth state changes
  useEffect(() => {
    console.log("Navbar useEffect - Auth state:", isAuthenticated ? "authenticated" : "not authenticated");
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  const openLoginModal = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      // Navigate to home after logout
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-imaginate-purple text-white p-2 rounded-md">
              <ImageIcon size={20} />
            </div>
            <span className="font-bold text-xl text-imaginate-dark">Imaginate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-imaginate-purple transition-colors">Home</Link>
            {isAuthenticated && user && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-imaginate-purple transition-colors">Dashboard</Link>
                <Link to="/history" className="text-gray-600 hover:text-imaginate-purple transition-colors">History</Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{user?.name || user?.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => navigate('/profile')}
                  >
                    <UserCircle size={16} className="mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => navigate('/dashboard')}
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => navigate('/history')}
                  >
                    <History size={16} className="mr-2" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500" 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" onClick={openLoginModal}>
                  Login
                </Button>
                <Button onClick={openSignupModal}>
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3">
              <button 
                className="px-2 py-1 rounded hover:bg-gray-100 text-left flex items-center space-x-2"
                onClick={() => navigateTo('/')}
              >
                <Home size={18} />
                <span>Home</span>
              </button>
              
              {isAuthenticated && user ? (
                <>
                  <button 
                    className="px-2 py-1 rounded hover:bg-gray-100 text-left flex items-center space-x-2"
                    onClick={() => navigateTo('/profile')}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </button>
                  <button 
                    className="px-2 py-1 rounded hover:bg-gray-100 text-left flex items-center space-x-2"
                    onClick={() => navigateTo('/dashboard')}
                  >
                    <ImageIcon size={18} />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    className="px-2 py-1 rounded hover:bg-gray-100 text-left flex items-center space-x-2"
                    onClick={() => navigateTo('/history')}
                  >
                    <History size={18} />
                    <span>History</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-2 py-1 text-left text-red-500 rounded hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      openLoginModal();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      openSignupModal();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
      />
    </nav>
  );
};

export default Navbar;
