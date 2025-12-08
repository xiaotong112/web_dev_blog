'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { User, Mail, Briefcase, Building, FileText } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    company: '',
    position: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
        setFormData({
            nickname: user.nickname || '',
            email: user.email || '',
            company: user.company || '',
            position: user.position || '',
            bio: user.bio || '',
            avatar: user.avatar || ''
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await userService.updateProfile(formData);
          if (res.code === 200) {
              updateUser(formData);
              toast.success('Profile updated successfully');
          } else {
              toast.error(res.message || 'Update failed');
          }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
        
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-zinc-400">{formData.nickname?.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Avatar URL</label>
                        <Input 
                            value={formData.avatar} 
                            onChange={e => setFormData({...formData, avatar: e.target.value})}
                            placeholder="https://..."
                        />
                         <p className="text-xs text-zinc-500 mt-1">Enter an image URL for your avatar.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nickname</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input 
                                className="pl-9"
                                value={formData.nickname} 
                                onChange={e => setFormData({...formData, nickname: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input 
                                className="pl-9"
                                type="email"
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Company</label>
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input 
                                className="pl-9"
                                value={formData.company} 
                                onChange={e => setFormData({...formData, company: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Position</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input 
                                className="pl-9"
                                value={formData.position} 
                                onChange={e => setFormData({...formData, position: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <div className="relative">
                        <textarea 
                            className="w-full rounded-md border border-zinc-200 p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:border-zinc-800"
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button type="submit" isLoading={loading}>Save Changes</Button>
                </div>
            </form>
        </div>
    </div>
  );
}
