import { useState, useEffect } from "react";
import { Search, Plus, Building2, Globe, Trash2 } from "lucide-react";
import { insforge } from "../../lib/insforge";

export function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newIndustry, setNewIndustry] = useState("");
    const [newWebsite, setNewWebsite] = useState("");

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await insforge.database
            .from("companies")
            .select("*")
            .order("name", { ascending: true });

        if (!error && data) {
            setCompanies(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleAddCompany = async (e) => {
        e.preventDefault();
        const { error } = await insforge.database
            .from("companies")
            .insert([{ 
                name: newName, 
                industry: newIndustry, 
                website: newWebsite 
            }]);

        if (!error) {
            setNewName("");
            setNewIndustry("");
            setNewWebsite("");
            setIsAdding(false);
            fetchCompanies();
        }
    };

    const deleteCompany = async (id) => {
        if (!window.confirm("Are you sure you want to delete this company?")) return;
        const { error } = await insforge.database
            .from("companies")
            .delete()
            .eq("id", id);
        
        if (!error) {
            fetchCompanies();
        }
    };

    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Companies</h2>
                    <p className="text-neutral-400">Accounts and organizations you do business with.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Company
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800/60 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search companies by name..."
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
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Company</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Industry</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Website</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Created</th>
                                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                                        Loading companies...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 italic">
                                        No companies found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((company) => (
                                    <tr key={company.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-neutral-100">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400 text-sm">
                                            {company.industry || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {company.website ? (
                                                <a 
                                                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                                                >
                                                    <Globe className="w-3.5 h-3.5" />
                                                    {company.website.replace(/^https?:\/\//, "")}
                                                </a>
                                            ) : (
                                                <span className="text-neutral-600 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 text-sm italic">
                                            {company.created_at ? new Date(company.created_at).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => deleteCompany(company.id)}
                                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Delete company"
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
                        <h3 className="text-xl font-bold text-white mb-4">Add New Company</h3>
                        <form onSubmit={handleAddCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Company Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Industry</label>
                                <input
                                    type="text"
                                    value={newIndustry}
                                    onChange={(e) => setNewIndustry(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Technology"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Website</label>
                                <input
                                    type="text"
                                    value={newWebsite}
                                    onChange={(e) => setNewWebsite(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="www.acme.com"
                                />
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
                                    Create Company
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
