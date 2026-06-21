import { useCollabStore } from '../../store/collaboration.store';

export const PresenceBar = () => {
  const { isConnected, onlineUsers, activities } = useCollabStore();

  if (!isConnected) return null;

  return (
    <div className="absolute top-4 right-4 z-[9990] flex flex-col items-end gap-2 pointer-events-none">
      {/* Online Users */}
      <div className="flex gap-2 items-center pointer-events-auto">
        <div className="bg-black/40 px-3 py-1.5 rounded-full text-xs mr-2 border border-white/10">
          {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
        </div>
        {onlineUsers.map((u, i) => (
          <div key={`${u.id}-${i}`} className="relative group">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md border-2 border-white/20"
              style={{ backgroundColor: u.color }}
            >
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div className="absolute top-10 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {u.username}
            </div>
          </div>
        ))}
      </div>

      {/* Mini Activity Feed */}
      <div className="flex flex-col gap-1 items-end mt-4">
        {activities.slice(0, 3).map(act => (
          <div key={act.id} className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-auto max-w-[250px] truncate">
            {act.message}
          </div>
        ))}
      </div>
    </div>
  );
};
