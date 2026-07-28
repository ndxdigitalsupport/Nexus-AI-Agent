import ChatArea from '@/components/ChatArea';
import TaskBoard from '@/components/TaskBoard';
import { useStore } from '@/store';

export default function Home() {
  const { isActionBoardOpen } = useStore();

  return (
    <div className="flex-1 flex h-full overflow-hidden relative">
      <ChatArea />
      
      {/* Collapsible Action Board Drawer */}
      <div className={`h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        isActionBoardOpen ? 'w-72 md:w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}>
        <TaskBoard />
      </div>
    </div>
  );
}