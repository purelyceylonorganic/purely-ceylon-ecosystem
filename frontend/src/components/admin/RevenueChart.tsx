import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
  darkMode: boolean;
}

export default function RevenueChart({ data, darkMode }: RevenueChartProps) {
  return (
    <div
      style={{
        background: darkMode ? "#1F2937" : "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        color: darkMode ? "#ffffff" : "#111827",
        transition: "background 0.3s, color 0.3s"
      }}
    >
      <h3 
        style={{ 
          margin: "0 0 20px 0", 
          color: darkMode ? "#ffffff" : "#333", 
          fontWeight: 600 
        }}
      >
        📊 Revenue Analytics
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          {/* மென்மையான கிரிட் கோடுகள் - Dark Mode-க்கு ஏற்ப மாறும் */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={darkMode ? "#374151" : "#f0f0f0"} 
          />
          
          {/* அச்சு சீரமைப்புகள் (Axis Ticks) */}
          <XAxis 
            dataKey="month" 
            stroke={darkMode ? "#9CA3AF" : "#666"} 
            fontSize={12} 
            tickLine={false} 
          />
          <YAxis 
            stroke={darkMode ? "#9CA3AF" : "#666"} 
            fontSize={12} 
            tickLine={false} 
            tickFormatter={(value) => `$${value}`} 
          />
          
          {/* டூல்திப் வடிவமைப்பு (Tooltip Dark Mode Setup) */}
          <Tooltip 
            formatter={(value) => [`$${value}`, "Revenue"]}
            contentStyle={{ 
              borderRadius: "8px", 
              background: darkMode ? "#1F2937" : "#ffffff",
              borderColor: darkMode ? "#374151" : "#eee",
              color: darkMode ? "#ffffff" : "#111827"
            }}
            itemStyle={{
              color: darkMode ? "#ffffff" : "#111827"
            }}
          />
          
          {/* வளைகோடு வடிவமைப்பு */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={darkMode ? "#10B981" : "#0E4B32"} // Dark mode-ல் பச்சைக் கோடு பிரகாசமாக தெரிய திருத்தப்பட்டுள்ளது
            strokeWidth={3}
            dot={{ 
              r: 4, 
              stroke: darkMode ? "#10B981" : "#0E4B32", 
              strokeWidth: 2, 
              fill: darkMode ? "#1F2937" : "#fff" 
            }}
            activeDot={{ 
              r: 7, 
              fill: darkMode ? "#10B981" : "#0E4B32" 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}