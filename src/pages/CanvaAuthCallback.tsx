import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CanvaService } from "@/services/CanvaService";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CanvaAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Canva Auth Error:", error);
        setStatus("error");
        setErrorMsg("Authentication canceled by user.");
        toast.error("Canva connection failed");
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMsg("Missing authorization code.");
        return;
      }

      try {
        const result = await CanvaService.exchangeCodeForToken(code);
        if (result.success) {
          setStatus("success");
          toast.success("Successfully connected to Canva!");
          // Small delay for UI gratification
          setTimeout(() => {
            const returnPath = localStorage.getItem("canva_return_path") || "/";
            navigate(returnPath);
          }, 2000);
        } else {
          throw new Error(result.error);
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Failed to complete Canva authentication.");
        toast.error("Canva connection failed");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[80px] -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-accent animate-pulse flex items-center justify-center shadow-lg shadow-accent/20">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black tracking-tight">Syncing Canva...</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Securing your design bridge with Canva Connect
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center shadow-lg shadow-success/20"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black tracking-tight text-success">Connected!</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Returning to your design desk...
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-destructive flex items-center justify-center shadow-lg shadow-destructive/20">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-black tracking-tight text-destructive">Auth Failed</h2>
                <p className="text-xs font-medium text-muted-foreground max-w-[200px] mx-auto">
                  {errorMsg}
                </p>
                <button 
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 bg-secondary rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80"
                >
                  Return Home
                </button>
              </div>
            </>
          )}

          <div className="mt-8 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground italic">PrintFlow Design Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaAuthCallback;
