import { motion } from "motion/react";
import { siteConfig } from "../../config/site";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ASSETS } from "../../lib/assets";

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    } else {
      setChecking(false);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin");
      } else {
        setError(data.error || "Kata sandi yang Anda masukkan salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-primary-50/50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-primary-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-gray-500 font-medium font-sans">Menyiapkan dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50/50 flex items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-200 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary-500/5 border border-primary-100 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img 
            src={ASSETS.LOGO_KONCOKEMO} 
            alt="KoncoKemo" 
            className="w-16 h-16 object-contain mx-auto mb-4" 
          />
          <h1 className="font-display font-bold text-2xl tracking-tight text-primary-900">Admin {siteConfig.name}</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">Masuk untuk mengelola konten dan berita edukasi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Kata Sandi Admin" 
            type={showPassword ? "text" : "password"} 
            placeholder="Masukkan kata sandi..." 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(""); // Auto-feedback: clear error on type
            }}
            error={error}
            required 
            rightElement={
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-4 text-base shadow-lg shadow-primary-500/20 transition-all hover:shadow-primary-500/40" disabled={loading}>
            {loading ? "Memverifikasi..." : "Masuk Dashboard"}
          </Button>
          
          <button 
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors mt-4"
          >
            Kembali ke Beranda
          </button>
        </form>
      </motion.div>
    </div>
  );
}
