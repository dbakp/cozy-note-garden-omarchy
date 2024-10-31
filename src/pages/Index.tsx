import Sidebar from "@/components/Sidebar";
import NotesList from "@/components/NotesList";
import NoteEditor from "@/components/NoteEditor";

export default function Index() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <NotesList />
      <NoteEditor />
    </div>
  );
}