import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
        tl.from(".login-side-img", { scale: 1.1, opacity: 0, duration: 1.5, clearProps: "all" })
            .from(".login-form-stagger", { y: 30, opacity: 0, stagger: 0.1, clearProps: "all" }, "-=1");
    }, { scope: containerRef });

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
        <div ref={containerRef} className="min-h-screen flex" style={{ background: "var(--bg-secondary)" }}>
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#ffbed6] items-center justify-center flex-col">
                <img src="/sale_bubble.png" alt="Sale" className="w-[85%] max-w-lg h-auto object-contain login-side-img relative z-10 -mt-20" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-12 z-20 pb-20 text-center">
                    <p className="text-[#a81446] text-3xl font-black mb-2 font-['Playfair_Display']">Find something you&apos;ll love.</p>
                    <p className="text-[#a81446]/80 text-base font-medium">Thousands of unique products from local shops.</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center p-8 sm:p-16 lg:p-24 overflow-y-auto max-h-screen">
                <div className="w-full max-w-md mx-auto login-form-wrapper">
                    <div className="flex items-center gap-2 mb-10 login-form-stagger">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect width="24" height="24" rx="4" fill="var(--accent)" /><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="serif">SL</text></svg>
                        <span className="text-xl font-bold tracking-tight" style={{ color: "var(--accent)" }}>ShopLocal</span>
                    </div>

                    <h1 className="text-4xl font-black mb-3 login-form-stagger font-['Playfair_Display'] tracking-tight" style={{ color: "var(--text)" }}>Welcome Back</h1>
                    <p className="text-base mb-10 font-medium login-form-stagger" style={{ color: "var(--text-secondary)" }}>Don&apos;t have an account? <Link to="/signup" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>Register</Link></p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="login-form-stagger">
                            <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" placeholder="you@example.com" />
                        </div>
                        <div className="login-form-stagger">
                            <label className="block text-sm font-bold mb-2 tracking-wide uppercase text-xs" style={{ color: "var(--text-muted)" }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="input !pr-11" placeholder="Enter password" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>
                        <div className="login-form-stagger pt-4">
                            <button type="submit" disabled={loading} className="btn-primary w-full !text-base !py-4 !rounded-full">
                                {loading ? "Signing in…" : "Sign in"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                        By signing in, you agree to our <span className="underline cursor-pointer hover:text-[var(--text)] transition-colors">Terms of Use</span> and <span className="underline cursor-pointer hover:text-[var(--text)] transition-colors">Privacy Policy</span>.
                    </div>
                </div>
            </div>
        </div>
    );
}
