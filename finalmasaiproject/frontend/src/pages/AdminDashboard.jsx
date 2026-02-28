import { useState, useEffect, useCallback } from "react";
import {
    Users, ShoppingBag, Package, TrendingUp, Shield, Settings,
    Search, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
    Trash2, UserCheck, UserX, Edit2, Check, X, AlertTriangle,
    DollarSign, BarChart2, RefreshCw, Save
} from "lucide-react";
import { adminService } from "../services";
import toast from "react-hot-toast";


const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_COLORS = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    confirmed: { bg: "#dbeafe", text: "#1e40af" },
    processing: { bg: "#ede9fe", text: "#5b21b6" },
    shipped: { bg: "#d1fae5", text: "#065f46" },
    delivered: { bg: "#d1fae5", text: "#065f46" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

function Badge({ label, color = "#6366f1" }) {
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
            background: color + "22", color, textTransform: "capitalize", whiteSpace: "nowrap"
        }}>{label}</span>
    );
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div style={{
            background: "var(--bg-card)", borderRadius: 18, padding: "22px 24px",
            border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 18,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14, background: color + "18",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1.2 }}>{value}</p>
                {sub && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{sub}</p>}
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 36, height: 36, border: "4px solid var(--border-light)", borderTopColor: "var(--accent)", borderRadius: "50%" }}
                className="animate-spin" />
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center",
            justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)"
        }}>
            <div style={{
                background: "var(--bg-card)", borderRadius: 20, padding: 32, maxWidth: 380, width: "90%",
                boxShadow: "0 24px 60px rgba(0,0,0,0.3)"
            }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 24 }}>
                    <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.5 }}>{message}</p>
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button onClick={onCancel} className="btn-secondary" style={{ fontSize: 14, padding: "9px 20px" }}>Cancel</button>
                    <button onClick={onConfirm} style={{
                        background: "#ef4444", color: "white", border: "none", borderRadius: 10,
                        padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer"
                    }}>Confirm</button>
                </div>
            </div>
        </div>
    );
}


function OverviewTab() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getStats().then(r => setData(r.data)).catch(() => toast.error("Failed to load stats")).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;
    if (!data) return null;

    const { stats, recent_users = [], recent_orders = [] } = data;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <KpiCard icon={Users} label="Total Users" value={stats.total_users?.toLocaleString()} sub={`${stats.total_vendors} vendors`} color="#6366f1" />
                <KpiCard icon={Package} label="Products Listed" value={stats.total_products?.toLocaleString()} color="#8b5cf6" />
                <KpiCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders?.toLocaleString()} color="#f59e0b" />
                <KpiCard icon={DollarSign} label="Platform Revenue" value={fmt(parseFloat(stats.total_revenue || 0))} color="#10b981" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {}
                <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 24, border: "1px solid var(--border-light)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                        <Users size={16} color="#6366f1" /> New Members
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {recent_users.map(u => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "50%", background: "#6366f120",
                                    color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: 14, flexShrink: 0
                                }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</p>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</p>
                                </div>
                                <Badge label={u.role} color={u.role === "vendor" ? "#f59e0b" : u.role === "admin" ? "#ef4444" : "#6366f1"} />
                            </div>
                        ))}
                        {!recent_users.length && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p>}
                    </div>
                </div>

                {}
                <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 24, border: "1px solid var(--border-light)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                        <ShoppingBag size={16} color="#f59e0b" /> Latest Orders
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {recent_orders.map(o => (
                            <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.users?.name || "—"}</p>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtDate(o.created_at)}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{fmt(parseFloat(o.total || 0))}</span>
                                    <Badge label={o.status} color={(STATUS_COLORS[o.status] || {}).text || "#6b7280"} />
                                </div>
                            </div>
                        ))}
                        {!recent_orders.length && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}


function UsersTab() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [editingRole, setEditingRole] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [confirm, setConfirm] = useState(null);

    const load = useCallback((page = 1) => {
        setLoading(true);
        adminService.getUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined })
            .then(r => { setUsers(r.data.users); setPagination(r.data.pagination); })
            .catch(() => toast.error("Failed to load users"))
            .finally(() => setLoading(false));
    }, [search, roleFilter, statusFilter]);

    useEffect(() => { load(1); }, [load]);

    const handleBanToggle = (u) => {
        setConfirm({
            message: u.is_active ? `Ban "${u.name}"? They won't be able to log in.` : `Unban "${u.name}"?`,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await adminService.updateUser(u.id, { is_active: !u.is_active });
                    toast.success(u.is_active ? "User banned." : "User unbanned.");
                    load(pagination.page);
                } catch { toast.error("Action failed."); }
            }
        });
    };

    const handleDelete = (u) => {
        setConfirm({
            message: `Permanently delete "${u.name}"? This cannot be undone.`,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await adminService.deleteUser(u.id);
                    toast.success("User deleted.");
                    load(pagination.page);
                } catch (e) { toast.error(e?.response?.data?.error || "Delete failed."); }
            }
        });
    };

    const handleRoleChange = async (u) => {
        if (!newRole || newRole === u.role) { setEditingRole(null); return; }
        try {
            await adminService.updateUser(u.id, { role: newRole });
            toast.success(`Role updated to "${newRole}".`);
            setEditingRole(null);
            load(pagination.page);
        } catch { toast.error("Role update failed."); }
    };

    return (
        <div>
            {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
            {}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" style={{
                        width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                        fontSize: 14, boxSizing: "border-box"
                    }} />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
                    padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: 14, cursor: "pointer"
                }}>
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
                    padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: 14, cursor: "pointer"
                }}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                </select>
            </div>

            {loading ? <Spinner /> : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                                {["User", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}
                                    className="hover:bg-[var(--bg-secondary)] transition">
                                    <td style={{ padding: "12px 12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: "50%", background: "#6366f120",
                                                color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 700, fontSize: 13, flexShrink: 0
                                            }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                                            <span style={{ fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 12px", color: "var(--text-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                                    <td style={{ padding: "12px 12px" }}>
                                        {editingRole === u.id ? (
                                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{
                                                    padding: "4px 8px", borderRadius: 8, border: "1.5px solid var(--border)",
                                                    background: "var(--bg)", color: "var(--text)", fontSize: 12
                                                }}>
                                                    <option value="customer">Customer</option>
                                                    <option value="vendor">Vendor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button onClick={() => handleRoleChange(u)} style={{ color: "#10b981", cursor: "pointer", display: "flex", padding: 4, borderRadius: 6 }} className="hover:bg-[var(--bg-secondary)]"><Check size={14} /></button>
                                                <button onClick={() => setEditingRole(null)} style={{ color: "#ef4444", cursor: "pointer", display: "flex", padding: 4, borderRadius: 6 }} className="hover:bg-[var(--bg-secondary)]"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Badge label={u.role} color={u.role === "vendor" ? "#f59e0b" : u.role === "admin" ? "#ef4444" : "#6366f1"} />
                                                <button onClick={() => { setEditingRole(u.id); setNewRole(u.role); }} style={{ color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 3, borderRadius: 6 }} className="hover:bg-[var(--bg-secondary)]"><Edit2 size={12} /></button>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 12px" }}>
                                        <Badge label={u.is_active !== false ? "Active" : "Banned"} color={u.is_active !== false ? "#10b981" : "#ef4444"} />
                                    </td>
                                    <td style={{ padding: "12px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(u.created_at)}</td>
                                    <td style={{ padding: "12px 12px" }}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button onClick={() => handleBanToggle(u)} title={u.is_active !== false ? "Ban User" : "Unban User"}
                                                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: u.is_active !== false ? "#f59e0b" : "#10b981", fontSize: 12, fontWeight: 600 }}>
                                                {u.is_active !== false ? <UserX size={13} /> : <UserCheck size={13} />}
                                                {u.is_active !== false ? "Ban" : "Unban"}
                                            </button>
                                            <button onClick={() => handleDelete(u)} title="Delete User"
                                                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: "#ef4444", fontSize: 12, fontWeight: 600 }}>
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!users.length && (
                                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {pagination.total} user{pagination.total !== 1 ? "s" : ""} total
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1} style={{
                        padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)",
                        cursor: pagination.page <= 1 ? "not-allowed" : "pointer", opacity: pagination.page <= 1 ? 0.4 : 1, display: "flex"
                    }}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>Page {pagination.page} / {pagination.pages || 1}</span>
                    <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages} style={{
                        padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)",
                        cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer", opacity: pagination.page >= pagination.pages ? 0.4 : 1, display: "flex"
                    }}><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
}


function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    const load = useCallback((page = 1) => {
        setLoading(true);
        adminService.getAllOrders({ page, limit: 15, status: statusFilter || undefined })
            .then(r => { setOrders(r.data.orders); setPagination(r.data.pagination); })
            .catch(() => toast.error("Failed to load orders"))
            .finally(() => setLoading(false));
    }, [statusFilter]);

    useEffect(() => { load(1); }, [load]);

    return (
        <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
                    padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: 14, cursor: "pointer"
                }}>
                    <option value="">All Statuses</option>
                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                </select>
                <button onClick={() => load(1)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {loading ? <Spinner /> : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                                {["Order ID", "Customer", "Amount", "Payment", "Status", "Date"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => {
                                const sc = STATUS_COLORS[o.status] || { bg: "#f3f4f6", text: "#6b7280" };
                                return (
                                    <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}
                                        className="hover:bg-[var(--bg-secondary)] transition">
                                        <td style={{ padding: "12px 12px", fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>#{o.id?.slice(0, 8)}</td>
                                        <td style={{ padding: "12px 12px" }}>
                                            <p style={{ fontWeight: 600, color: "var(--text)" }}>{o.users?.name || "—"}</p>
                                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{o.users?.email}</p>
                                        </td>
                                        <td style={{ padding: "12px 12px", fontWeight: 700, color: "var(--text)" }}>{fmt(parseFloat(o.total || 0))}</td>
                                        <td style={{ padding: "12px 12px" }}>
                                            <Badge label={o.payment_method || "cod"} color="#6366f1" />
                                        </td>
                                        <td style={{ padding: "12px 12px" }}>
                                            <span style={{ padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, textTransform: "capitalize" }}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(o.created_at)}</td>
                                    </tr>
                                );
                            })}
                            {!orders.length && (
                                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No orders found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{pagination.total} order{pagination.total !== 1 ? "s" : ""} total</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", cursor: pagination.page <= 1 ? "not-allowed" : "pointer", opacity: pagination.page <= 1 ? 0.4 : 1, display: "flex" }}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>Page {pagination.page} / {pagination.pages || 1}</span>
                    <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer", opacity: pagination.page >= pagination.pages ? 0.4 : 1, display: "flex" }}><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
}


function ProductsTab() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [confirm, setConfirm] = useState(null);

    const load = useCallback((page = 1) => {
        setLoading(true);
        adminService.getAllProducts({ page, limit: 15, search: search || undefined, is_active: activeFilter || undefined })
            .then(r => { setProducts(r.data.products); setPagination(r.data.pagination); })
            .catch(() => toast.error("Failed to load products"))
            .finally(() => setLoading(false));
    }, [search, activeFilter]);

    useEffect(() => { load(1); }, [load]);

    const handleToggle = (p) => {
        setConfirm({
            message: p.is_active ? `Deactivate "${p.name}"? It will be hidden from the store.` : `Activate "${p.name}"?`,
            onConfirm: async () => {
                setConfirm(null);
                try {
                    await adminService.toggleProductStatus(p.id);
                    toast.success(p.is_active ? "Product deactivated." : "Product activated.");
                    load(pagination.page);
                } catch { toast.error("Toggle failed."); }
            }
        });
    };

    return (
        <div>
            {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{
                        width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: 14, boxSizing: "border-box"
                    }} />
                </div>
                <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)} style={{
                    padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: 14, cursor: "pointer"
                }}>
                    <option value="">All Products</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {loading ? <Spinner /> : (
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                                {["Product", "Vendor", "Category", "Price", "Stock", "Status", "Action"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }} className="hover:bg-[var(--bg-secondary)] transition">
                                    <td style={{ padding: "12px 12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            {p.images?.[0] ? (
                                                <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                                            ) : (
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Package size={16} color="var(--text-muted)" />
                                                </div>
                                            )}
                                            <span style={{ fontWeight: 600, color: "var(--text)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 12px" }}>
                                        <p style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>{p.users?.store_name || p.users?.name || "—"}</p>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.users?.email}</p>
                                    </td>
                                    <td style={{ padding: "12px 12px", color: "var(--text-secondary)" }}>{p.categories?.name || "—"}</td>
                                    <td style={{ padding: "12px 12px", fontWeight: 700, color: "var(--text)" }}>{fmt(p.price)}</td>
                                    <td style={{ padding: "12px 12px", color: p.stock < 5 ? "#ef4444" : "var(--text)" }}>{p.stock}</td>
                                    <td style={{ padding: "12px 12px" }}>
                                        <Badge label={p.is_active ? "Active" : "Inactive"} color={p.is_active ? "#10b981" : "#ef4444"} />
                                    </td>
                                    <td style={{ padding: "12px 12px" }}>
                                        <button onClick={() => handleToggle(p)} style={{
                                            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                                            border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer",
                                            color: p.is_active ? "#ef4444" : "#10b981", fontSize: 12, fontWeight: 600
                                        }}>
                                            {p.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                            {p.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!products.length && (
                                <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{pagination.total} product{pagination.total !== 1 ? "s" : ""} total</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", cursor: pagination.page <= 1 ? "not-allowed" : "pointer", opacity: pagination.page <= 1 ? 0.4 : 1, display: "flex" }}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: "var(--text)" }}>Page {pagination.page} / {pagination.pages || 1}</span>
                    <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages} style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer", opacity: pagination.page >= pagination.pages ? 0.4 : 1, display: "flex" }}><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
}


const DEFAULT_SETTINGS = {
    platform_name: "ShopLocal",
    contact_email: "support@shoplocal.in",
    maintenance_mode: "false",
    max_product_images: "5",
    order_cancellation_window_hours: "24",
    platform_fee_percent: "0",
};

function SettingsTab() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        adminService.getSettings()
            .then(r => setSettings(s => ({ ...s, ...r.data })))
            .catch(() => {
                
                toast("Using default settings. Save to persist.", { icon: "ℹ️" });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateSettings(settings);
            toast.success("Settings saved successfully!");
        } catch { toast.error("Failed to save settings."); }
        finally { setSaving(false); }
    };

    const fields = [
        { key: "platform_name", label: "Platform Name", type: "text" },
        { key: "contact_email", label: "Contact / Support Email", type: "email" },
        { key: "platform_fee_percent", label: "Platform Fee (%)", type: "number" },
        { key: "max_product_images", label: "Max Product Images", type: "number" },
        { key: "order_cancellation_window_hours", label: "Order Cancellation Window (hours)", type: "number" },
    ];

    if (loading) return <Spinner />;

    return (
        <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {fields.map(f => (
                    <div key={f.key}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 6 }}>{f.label}</label>
                        <input
                            type={f.type}
                            value={settings[f.key] || ""}
                            onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                            style={{
                                width: "100%", padding: "11px 14px", borderRadius: 12, fontSize: 14,
                                border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text)",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                ))}

                {}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", background: "var(--bg-secondary)", borderRadius: 14 }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Maintenance Mode</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>When enabled, the store shows a maintenance notice to shoppers.</p>
                    </div>
                    <button onClick={() => setSettings(s => ({ ...s, maintenance_mode: s.maintenance_mode === "true" ? "false" : "true" }))}
                        style={{ flexShrink: 0, marginLeft: 20 }}>
                        {settings.maintenance_mode === "true"
                            ? <ToggleRight size={36} color="#10b981" />
                            : <ToggleLeft size={36} color="var(--text-muted)" />}
                    </button>
                </div>

                <button onClick={handleSave} disabled={saving} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "13px 28px", borderRadius: 14,
                    background: "var(--accent)", color: "white", border: "none", fontWeight: 700, fontSize: 15,
                    cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, alignSelf: "flex-start"
                }}>
                    <Save size={16} /> {saving ? "Saving…" : "Save Settings"}
                </button>
            </div>
        </div>
    );
}


const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <div style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
                padding: "36px clamp(16px, 5vw, 64px) 0"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <Shield size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Admin Panel</h1>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0 }}>Super-Admin · ShopLocal Platform</p>
                    </div>
                </div>

                {}
                <div style={{ display: "flex", gap: 4, overflowX: "auto" }} className="no-scrollbar">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
                                fontSize: 14, fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
                                borderRadius: "12px 12px 0 0", border: "none", cursor: "pointer",
                                background: active ? "var(--bg)" : "transparent",
                                color: active ? "var(--accent)" : "rgba(255,255,255,0.7)",
                                transition: "all 0.15s"
                            }}>
                                <Icon size={15} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {}
            <div style={{ padding: "32px clamp(16px, 5vw, 64px)", maxWidth: 1400, margin: "0 auto" }}>
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "users" && <UsersTab />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "products" && <ProductsTab />}
                {activeTab === "settings" && <SettingsTab />}
            </div>
        </div>
    );
}
