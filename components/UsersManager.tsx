
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  UserPlus, Shield, Key, User as UserIcon, X, AlertCircle, 
  Trash2, ShieldCheck, ShieldAlert, BadgeCheck, UserCog, 
  CheckCircle2, AlertTriangle, Save 
} from 'lucide-react';

interface UsersManagerProps {
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onUpdatePassword: (userId: string, newPass: string) => void;
  onRemoveUser: (userId: string) => void;
}

const UsersManager: React.FC<UsersManagerProps> = ({ 
  currentUser, users, onAddUser, onUpdateUser, onUpdatePassword, onRemoveUser 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    username: '',
    password: '',
    role: UserRole.AGENT_SAISIE
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role
    };
    onAddUser(newUser);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    onUpdateUser({
      id: formData.id,
      name: formData.name,
      username: formData.username,
      role: formData.role
    } as User);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', username: '', password: '', role: UserRole.AGENT_SAISIE });
  };

  const openEdit = (u: User) => {
    setFormData({ id: u.id, name: u.name, username: u.username, password: '', role: u.role });
    setShowEditModal(true);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    if (newPassword !== confirmPassword) return;
    onUpdatePassword(targetUser.id, newPassword);
    setShowPassModal(false);
    setNewPassword('');
    setConfirmPassword('');
    setTargetUser(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100"><ShieldCheck className="w-3 h-3" /> Administrateur</span>;
      case UserRole.GERANT:
        return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100"><BadgeCheck className="w-3 h-3" /> Gérant</span>;
      case UserRole.COMPTABLE:
        return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">Comptable</span>;
      default:
        return <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-100">Agent de Saisie</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Agents & Droits d'Accès</h2>
          <p className="text-slate-500 text-sm font-medium">Contrôlez les accès au système PetrolHub.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          <span>Créer un agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-400 font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-3">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg leading-none mb-1 uppercase italic">
                    {u.name}
                  </h4>
                  <p className="text-xs font-mono text-slate-400 font-bold">@{u.username}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => openEdit(u)}
                  className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Modifier l'agent"
                >
                  <UserCog className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setTargetUser(u); setShowPassModal(true); }}
                  className="p-2 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                  title="Réinitialiser mot de passe"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-50">
              {getRoleBadge(u.role)}
              <div className="flex items-center gap-2">
                {u.id !== currentUser.id && (
                  <button 
                    onClick={() => setShowDeleteConfirm(u.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
              </div>
            </div>

            {/* Confirmation de suppression intégrée au card */}
            {showDeleteConfirm === u.id && (
              <div className="absolute inset-0 bg-rose-600/95 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center text-white animate-in fade-in zoom-in duration-200">
                <AlertTriangle className="w-12 h-12 mb-2" />
                <p className="text-sm font-black uppercase mb-4 tracking-tighter">Supprimer définitivement l'accès de {u.name} ?</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase">Annuler</button>
                  <button onClick={() => { onRemoveUser(u.id); setShowDeleteConfirm(null); }} className="flex-1 py-3 bg-white text-rose-600 rounded-xl text-xs font-black uppercase shadow-lg">Confirmer</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Ajouter/Modifier Utilisateur */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-10 border-b border-slate-100 flex justify-between items-center ${showEditModal ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`${showEditModal ? 'bg-white/20' : 'bg-blue-100 text-blue-600'} p-3 rounded-2xl`}>
                  {showEditModal ? <UserCog className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">{showEditModal ? 'Modifier Agent' : 'Nouvel Agent'}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${showEditModal ? 'text-blue-100' : 'text-slate-400'}`}>Configuration des accès PetrolHub</p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className={`p-2 rounded-full transition-colors ${showEditModal ? 'hover:bg-white/20' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={showEditModal ? handleEditUser : handleAddUser} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Identité de l'agent</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                    required placeholder="ex: Omar El Fassi"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Login Système</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-mono font-black text-blue-600" 
                    required placeholder="identifiant"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                {!showEditModal && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Code Secret</label>
                    <input 
                      type="password"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold" 
                      required placeholder="••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Permissions & Rôle</label>
                <div className="grid grid-cols-2 gap-3">
                  {[UserRole.AGENT_SAISIE, UserRole.GERANT, UserRole.COMPTABLE, UserRole.ADMIN].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({...formData, role})}
                      className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        formData.role === role 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30' 
                        : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button type="submit" className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-95 ${showEditModal ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
                  {showEditModal ? 'Appliquer les modifications' : 'Créer le compte agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Réinitialiser Mot de passe */}
      {showPassModal && targetUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><Key className="w-6 h-6" /></div>
                <div>
                   <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Sécurité Accès</h3>
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">{targetUser.name}</p>
                </div>
              </div>
              <button onClick={() => { setShowPassModal(false); setTargetUser(null); }} className="p-2 bg-white/50 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-10 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Nouveau mot de passe</label>
                <input 
                  type="password"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-bold text-slate-800" 
                  required 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirmer le code</label>
                <input 
                  type="password"
                  className={`w-full px-6 py-5 border rounded-2xl outline-none transition-all font-bold text-slate-800 ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100 focus:ring-4 focus:ring-amber-500/10'}`} 
                  required 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" disabled={!newPassword || newPassword !== confirmPassword} className="w-full py-6 bg-amber-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/30 hover:bg-amber-600 transition-all disabled:opacity-30 active:scale-95">
                Valider le nouveau code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
