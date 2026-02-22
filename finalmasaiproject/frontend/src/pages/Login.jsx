import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success("Welcome back!");
            navigate(data.user.role === "vendor" ? "/vendor/dashboard" : "/");
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid email or password");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex" style={{ background: "var(--bg-secondary)" }}>
            {/* Left visual */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=1200&fit=crop" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-10" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 30%, transparent)" }}>
                    <p className="text-white text-2xl font-bold mb-2">Find something you&apos;ll love.</p>
                    <p className="text-white/80 text-sm">Thousands of unique products from local shops.</p>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm animate-up">
                    <div className="flex items-center gap-2 mb-8">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect width="24" height="24" rx="4" fill="var(--accent)" /><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="serif">SL</text></svg>
                        <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>ShopLocal</span>
                    </div>

                    <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>Sign in to ShopLocal</h1>
                    <p className="text-sm mb-7" style={{ color: "var(--text-secondary)" }}>Don&apos;t have an account? <Link to="/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Register</Link></p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input !pr-11" placeholder="Enter password" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full !text-base !py-3 !rounded-full">
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                        By signing in, you agree to our <span className="underline cursor-pointer">Terms of Use</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}
