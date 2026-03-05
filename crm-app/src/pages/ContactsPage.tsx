import { useState, useEffect } from "react";
import { Search, Plus, UserCircle, Phone, Mail, Building } from "lucide-react";
import { insforge } from "../lib/insforge";

type Contact = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    tags: string[];
    companies?: { name: string };
};

export function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchContacts = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from("contacts")
            .select("*, companies(name)")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setContacts(data as Contact[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(
        (c) =>
            c.first_name.toLowerCase().includes(search.toLowerCase()) ||
            c.last_name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Contacts</h2>
                    <p className="text-neutral-400">Manage your customers, leads, and partners.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Plus className="w-5 h-5" />
                    Add Contact
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                {/* Toolbar */}
                <div className="p-4 border-b border-neutral-800/60 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search contacts by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-neutral-900/50 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 font-medium text-neutral-400">Name</th>
                                <th className="px-6 py-4 font-medium text-neutral-400">Contact Info</th>
                                <th className="px-6 py-4 font-medium text-neutral-400">Company</th>
                                <th className="px-6 py-4 font-medium text-neutral-400">Tags</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                        Loading contacts...
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/50 mb-3 text-neutral-400">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <p className="text-neutral-300 font-medium">No contacts found</p>
                                        <p className="text-neutral-500 mt-1">Try adjusting your search or add a new contact.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shadow-sm">
                                                    {contact.first_name[0]}{contact.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-neutral-200 group-hover:text-white transition-colors">
                                                        {contact.first_name} {contact.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                                    <span>{contact.email || "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                                                    <span>{contact.phone || "—"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-neutral-500" />
                                                <span>{contact.companies?.name || "No Company"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {contact.tags?.map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 text-xs border border-neutral-700/50">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {(!contact.tags || contact.tags.length === 0) && (
                                                    <span className="text-neutral-600 text-xs">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
