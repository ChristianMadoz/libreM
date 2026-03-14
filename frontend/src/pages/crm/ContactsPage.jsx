import { useState, useEffect } from "react";
import { Search, Plus, UserCircle, Phone, Mail, Building, Trash2 } from "lucide-react";
import { insforge } from "../../lib/insforge";

export function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
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
            setContacts(data);
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

    const handleAddContact = async (e) => {
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

    const deleteContact = async (id) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        const { error } = await insforge.database.from("contacts").delete().eq("id", id);
        if (!error) fetchContacts();
    };

    const filteredContacts = contacts.filter(
        (c) =>
            c.first_name.toLowerCase().includes(search.toLowerCase()) ||
            c.last_name.toLowerCase().includes(search.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-800/60 bg-neutral-800/20">
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Company</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Email</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Phone</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                                        Loading contacts...
                                    </td>
                                </tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                                        No contacts found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <UserCircle className="w-6 h-6" />
                                                </div>
                                                <span className="font-medium text-neutral-100">{contact.first_name} {contact.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.companies?.name ? (
                                                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                                    <Building className="w-3.5 h-3.5 text-neutral-500" />
                                                    {contact.companies.name}
                                                </div>
                                            ) : (
                                                <span className="text-neutral-600 text-sm italic">Individual</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                                {contact.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {contact.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                                                    {contact.phone}
                                                </div>
                                            ) : (
                                                <span className="text-neutral-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => deleteContact(contact.id)}
                                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Delete contact"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Add New Contact</h3>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-neutral-700"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-neutral-700"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Company</label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                >
                                    <option value="">No Company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>{company.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/20"
                                >
                                    Create Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
