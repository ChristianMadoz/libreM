import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { insforge } from "../../lib/insforge";
import {
    ArrowLeft, Paperclip, CheckSquare, MessageSquare,
    DollarSign, User, Building, Calendar
} from "lucide-react";
import { AISummary } from "../../components/crm/AISummary";
import { cn } from "../../lib/utils";

export function DealDetailPage() {
    const { id } = useParams();
    const [deal, setDeal] = useState(null);
    const [notes, setNotes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [attachments, setAttachments] = useState([]);

    // Form states
    const [newNote, setNewNote] = useState("");
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const fetchDealData = async () => {
        if (!id) return;

        // Fetch primary deal
        const { data: dealData } = await insforge.database
            .from("deals")
            .select("*, contacts(first_name, last_name, email), companies(name)")
            .eq("id", id)
            .single();

        setDeal(dealData);

        // Fetch related
        const [notesRes, tasksRes, attachmentsRes] = await Promise.all([
            insforge.database.from("notes").select("*").eq("deal_id", id).order("created_at", { ascending: false }),
            insforge.database.from("tasks").select("*").eq("deal_id", id).order("created_at", { ascending: true }),
            insforge.database.from("attachments").select("*").eq("deal_id", id).order("created_at", { ascending: false })
        ]);

        setNotes(notesRes.data || []);
        setTasks(tasksRes.data || []);
        setAttachments(attachmentsRes.data || []);
    };

    useEffect(() => {
        fetchDealData();
    }, [id]);

    const addNote = async () => {
        if (!newNote.trim() || !id) return;
        const { data } = await insforge.database
            .from("notes")
            .insert({ deal_id: id, content: newNote })
            .select()
            .single();
        if (data) setNotes([data, ...notes]);
        setNewNote("");
    };

    const addTask = async () => {
        if (!newTaskTitle.trim() || !id) return;
        const { data } = await insforge.database
            .from("tasks")
            .insert({ deal_id: id, title: newTaskTitle })
            .select()
            .single();
        if (data) setTasks([...tasks, data]);
        setNewTaskTitle("");
    };

    const toggleTask = async (taskId, currentStatus) => {
        setTasks(tasks.map((t) => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
        await insforge.database
            .from("tasks")
            .update({ is_completed: !currentStatus })
            .eq("id", taskId);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

        // 1. Upload to Storage auto
        const { data: storageData, error } = await insforge.storage
            .from("deal-attachments")
            .uploadAuto(file);

        if (error || !storageData) {
            alert("File upload failed");
            return;
        }

        // 2. Save reference to DB
        const { data: dbData } = await insforge.database
            .from("attachments")
            .insert({
                deal_id: id,
                file_name: file.name,
                file_key: storageData.key,
                file_url: storageData.url
            })
            .select()
            .single();

        if (dbData) setAttachments([dbData, ...attachments]);
    };

    if (!deal) return <div className="text-white p-8">Loading deal details...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <Link to="/crm" className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight text-white">{deal.title}</h2>
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                            {deal.stage}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* LEFT COLUMN: Overview & CRM Metadata */}
                <div className="space-y-6">
                    <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Deal Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <DollarSign className="w-5 h-5 opacity-80" />
                                <span className="text-2xl font-bold">${Number(deal.value || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-300">
                                <Calendar className="w-5 h-5 text-neutral-500" />
                                <span>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "No date set"}</span>
                            </div>

                            <div className="pt-4 border-t border-neutral-800/60 space-y-3">
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <User className="w-5 h-5 text-purple-500/70" />
                                    <div>
                                        <span className="block font-medium">{deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : "No contact"}</span>
                                        {deal.contacts?.email && <span className="text-xs text-neutral-500">{deal.contacts.email}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-300">
                                    <Building className="w-5 h-5 text-indigo-500/70" />
                                    <span className="font-medium">{deal.companies ? deal.companies.name : "No company linked"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Paperclip className="w-5 h-5 text-neutral-400" />
                                Attachments
                            </h3>
                            <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-medium transition">
                                Upload
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>

                        <div className="space-y-2">
                            {attachments.length === 0 ? (
                                <p className="text-sm text-neutral-500 italic">No files attached.</p>
                            ) : (
                                attachments.map(file => (
                                    <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-neutral-950/50 hover:border-indigo-500/40 transition group">
                                        <span className="text-sm text-neutral-300 truncate w-4/5 group-hover:text-indigo-400">{file.file_name}</span>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Activity Timeline & Tasks */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                    
                    {/* AI Insights Section */}
                    <AISummary deal={deal} notes={notes} tasks={tasks} />

                    {/* Tasks/Reminders Section */}
                    <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-neutral-400" />
                            Tasks & Follow-ups
                        </h3>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTask()}
                                placeholder="What needs to be done next?"
                                className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                            />
                            <button
                                onClick={addTask}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                Add
                            </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {tasks.length === 0 ? (
                                <p className="text-sm text-neutral-500 italic text-center py-4">No pending tasks.</p>
                            ) : (
                                tasks.map(task => (
                                    <div key={task.id} className={cn("flex items-center gap-3 p-3 rounded-lg border border-neutral-800/60 transition", task.is_completed ? "bg-neutral-950/30 opacity-60" : "bg-neutral-900/60")}>
                                        <input
                                            type="checkbox"
                                            checked={task.is_completed}
                                            onChange={() => toggleTask(task.id, task.is_completed)}
                                            className="w-4 h-4 rounded border-neutral-700 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                                        />
                                        <span className={cn("text-sm", task.is_completed ? "text-neutral-500 line-through" : "text-neutral-200")}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-neutral-400" />
                            Activity Timeline
                        </h3>

                        <div className="flex gap-2 mb-6">
                            <textarea
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Log a call, meeting, or note..."
                                className="flex-1 bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none h-24"
                            />
                            <button
                                onClick={addNote}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition self-end h-10"
                            >
                                Post
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {notes.length === 0 ? (
                                <p className="text-sm text-neutral-500 italic text-center mt-4">No activity logged yet.</p>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="relative pl-6 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-neutral-800">
                                        <div className="absolute left-0.5 top-1.5 w-3 h-3 rounded-full bg-neutral-800 border-2 border-neutral-900"></div>
                                        <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
                                            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                                            {note.created_at && (
                                                <p className="text-xs text-neutral-500 mt-2">
                                                    {new Date(note.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
