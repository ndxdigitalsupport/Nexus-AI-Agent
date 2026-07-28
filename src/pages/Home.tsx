import ChatArea from '@/components/ChatArea';
import TaskBoard from '@/components/TaskBoard';
import { useStore } from '@/store';

export default function Home() {
  const { isActionBoardOpen } = useStore();

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      <ChatArea />
      
      {/* Collapsible Action Board Drawer */}
      <div className={`
        fixed md:relative inset-y-0 right-0 z-50 md:z-auto h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-[#0a0d1a] md:bg-transparent
        ${isActionBoardOpen ? 'w-full sm:w-80 md:w-80 opacity-100 shadow-2xl' : 'w-0 opacity-0 pointer-events-none'}
      `}>
        <TaskBoard />
      </div>
    </div>
  );
}