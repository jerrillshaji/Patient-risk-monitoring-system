import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { usePatients } from "../../context/PatientContext";

export default function Dashboard() {
  const { patients } = usePatients();

  const low = patients.filter(p => p.riskLevel === "LOW").length;
  const medium = patients.filter(p => p.riskLevel === "MEDIUM").length;
  const high = patients.filter(p => p.riskLevel === "HIGH").length;

  const data = [
    { name: "Low", value: low },
    { name: "Medium", value: medium },
    { name: "High", value: high },
  ];

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <PieChart width={300} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      <div>
        <p>Total Patients: {patients.length}</p>
        <p>High Risk: {high}</p>
      </div>
    </div>
  );
}
