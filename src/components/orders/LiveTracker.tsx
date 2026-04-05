import { motion } from "framer-motion";
import { CheckCircle2, Clock, Printer, Package, Truck, Home, AlertCircle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: any;
  description: string;
}

const STEPS: Step[] = [
  { id: "pending", label: "Order Placed", icon: Clock, description: "Waiting for shop confirmation" },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2, description: "Shop has accepted your order" },
  { id: "processing", label: "In Production", icon: Printer, description: "Your items are being printed" },
  { id: "shipped", label: "Out for Delivery", icon: Truck, description: "Handed over to delivery partner" },
  { id: "delivered", label: "Delivered", icon: Home, description: "Order successfully delivered" },
];

interface LiveTrackerProps {
  currentStatus: string;
}

const LiveTracker = ({ currentStatus }: LiveTrackerProps) => {
  const getStatusIndex = (status: string) => {
    const index = STEPS.findIndex(s => s.id === status);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 text-red-600">
        <AlertCircle className="w-8 h-8" />
        <div>
          <h3 className="font-bold">Order Cancelled</h3>
          <p className="text-sm opacity-80">This order was cancelled and a refund may have been initiated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
      <div className="grid grid-cols-5 gap-2 relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-slate-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
            className="h-full bg-[#FF7300] transition-all duration-1000"
          />
        </div>

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "#FF7300" : "#F1F5F9",
                  scale: isActive ? 1.2 : 1,
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white border-4 border-white shadow-sm ${
                  isCompleted ? "text-white" : "text-slate-400"
                }`}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </motion.div>
              <div className="mt-4 text-center">
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  isCompleted ? "text-slate-900" : "text-slate-400"
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-[#FF7300] font-bold mt-1"
                  >
                    Current Stage
                  </motion.p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Current Status Card */}
      <div className="mt-10 bg-slate-50 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            {currentIndex === 2 ? <Printer className="w-6 h-6 text-[#FF7300]" /> : <Package className="w-6 h-6 text-[#FF7300]" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{STEPS[currentIndex].label}</h4>
            <p className="text-sm text-slate-500">{STEPS[currentIndex].description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Arrival</p>
          <p className="font-bold text-slate-900">Today, 6:30 PM</p>
        </div>
      </div>
    </div>
  );
};

export default LiveTracker;
