import { Outlet, Link } from 'react-router-dom';
import { Activity } from "lucide-react";

const AuthLayout = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans relative overflow-hidden">
            {/* Background decorative blurs */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[500px] h-[500px] bg-teal-400 rounded-full blur-[120px]" />
                <div className="w-[400px] h-[400px] bg-indigo-400 rounded-full blur-[100px] -ml-40 mt-40" />
            </div>

            <div className="z-10 w-full max-w-[600px] p-10 bg-white/80 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-slate-200/50 border border-white mx-4">
                <div className="flex flex-col items-center mb-10 text-center">
                    <Link to="/" className="flex items-center gap-3 mb-4 group">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 transition-all rounded-full bg-teal-500/20 blur-lg group-hover:bg-teal-500/35" />
                            <div className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 bg-teal-600 shadow-lg rounded-2xl shadow-teal-200 group-hover:-rotate-12">
                                <Activity className="text-white" size={26} strokeWidth={3} />
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-800">
                        Ex-<span className="text-teal-600">Ledger</span>
                    </h1>
                    <p className="mt-2 text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                        Secure Global Settlement
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
