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
    const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // New contact form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [companyId, setCompanyId] = useState("");

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

    const fetchCompanies = async () => {
        const { data } = await insforge.database
            .from("companies")
            .select("id, name")
            .order("name");
        if (data) setCompanies(data);
    };

    useEffect(() => {
        fetchContacts();
        fetchCompanies();
    }, []);

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await insforge.database
            .from("contacts")
            .insert([{
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                company_id: companyId || null,
                tags: []
            }]);

        if (!error) {
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setCompanyId("");
            setIsAdding(false);
            fetchContacts();
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;
        const { error } = await insforge.database.from("contacts").delete().eq("id", id);
        if (!error) fetchContacts();
    };

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
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
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
                                <th className="px-6 py-4 font-medium text-neutral-400 text-right">Actions</th>
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
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => deleteContact(contact.id)}
                                                className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                                            >
                                                <span className="text-xs">Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Contact Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">Add New Contact</h3>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">First Name</label>
                                    <input
                                        autoFocus
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Last Name</label>
                                    <input
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Phone Number</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Company</label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a company...</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all font-semibold shadow-lg shadow-indigo-600/20"
                                >
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
