'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from './ui/Button';
import { PenSquare, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/75 backdrop-blur-lg dark:border-zinc-800 dark:bg-black/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
             B
           </div>
           <span className="font-bold text-xl tracking-tight hidden sm:block">DevBlog</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role !== 'ADMIN' && (
                <Link href="/creator/editor">
                  <Button variant="ghost" className="hidden sm:flex gap-2">
                    <PenSquare className="w-4 h-4" />
                    Write
                  </Button>
                </Link>
              )}
              
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100 transition-colors dark:hover:bg-zinc-800 outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm bg-cover bg-center border border-zinc-200"
                      style={user?.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}>
                    {!user?.avatar && user?.nickname?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-900 dark:ring-zinc-700 border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.nickname}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.username}</p>
                    </div>
                    
                    <div className="py-1">
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin/dashboard" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              onClick={() => setIsMenuOpen(false)}>
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <Link href="/user/profile" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-3 h-4 w-4" />
                        My Profile
                      </Link>
                      
                      {user?.role !== 'ADMIN' && (
                        <>
                          <Link href="/creator/articles" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                onClick={() => setIsMenuOpen(false)}>
                            <PenSquare className="mr-3 h-4 w-4" />
                            Creator Center
                          </Link>

                          <Link href="/creator/drafts" className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                onClick={() => setIsMenuOpen(false)}>
                            <Settings className="mr-3 h-4 w-4" />
                            Drafts
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
