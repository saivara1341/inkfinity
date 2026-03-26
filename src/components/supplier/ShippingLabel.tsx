import { QrCode } from "lucide-react"; 
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type Order = any; // Using any for now to bypass strict DB type checks for new columns

interface ShippingLabelProps {
  order: Order;
  supplierName: string;
}

export const ShippingLabel = ({ order, supplierName }: ShippingLabelProps) => {
  const labelData = order.label_data || {};
  
  return (
    <div className="w-[400px] bg-white text-black p-6 border-2 border-black font-sans shadow-lg">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tighter">{(order as any).courier_partner || "Standard Express"}</h2>
          <p className="text-xs font-semibold">Priority Printing Network</p>
        </div>
        <div className="text-right">
          <p className="text-xs">Date: {format(new Date(), "dd-MM-yyyy")}</p>
          <p className="text-xs font-bold">AWB: {order.tracking_number || "PENDING"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-600">From:</p>
          <p className="text-sm font-bold">{supplierName}</p>
          <p className="text-xs leading-tight">Manufacturer Hub<br/>Indus Area, Phase II<br/>New Delhi, 110020</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-600">To:</p>
          <p className="text-sm font-bold">{(order as any).customer_name || "Valued Customer"}</p>
          <p className="text-xs leading-tight">
            {order.delivery_address || "No address provided"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t-2 border-black pt-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-gray-600">Package Details:</p>
          <p className="text-xs font-bold">{order.product_name}</p>
          <p className="text-xs">Qty: {order.quantity}</p>
          <p className="text-xs">Weight: {(order as any).weight || "0.5"} kg</p>
        </div>
        
        {/* Stylized QR Code Placeholder */}
        <div className="w-24 h-24 border-2 border-black p-1 flex items-center justify-center bg-gray-50">
          <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-full h-full opacity-80">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`w-full h-full ${Math.random() > 0.4 ? 'bg-black' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-gray-400 text-center">
        <p className="text-[8px] uppercase tracking-widest text-gray-500">Scan to track order #{order.order_number}</p>
        <p className="text-lg font-mono font-bold mt-1 tracking-[10px]">{order.order_number}</p>
      </div>
    </div>
  );
};
