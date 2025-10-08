import React from "react";
import ReactApexChart from "react-apexcharts";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

// 🔹 Статистика карточки
const stats = [
  {
    label: "Bugungi foyda",
    value: "2 450 000 UZS",
    icon: <DollarSign className="w-7 h-7 text-green-500" />,
    color: "bg-green-100",
  },
  {
    label: "Qarzdorlar soni",
    value: 12,
    icon: <AlertCircle className="w-7 h-7 text-red-500" />,
    color: "bg-red-100",
  },
  {
    label: "Bu oy daromad",
    value: "45 200 000 UZS",
    icon: <DollarSign className="w-7 h-7 text-blue-500" />,
    color: "bg-blue-100",
  },
  {
    label: "O‘sish darajasi",
    value: "+8.4%",
    icon: <TrendingUp className="w-7 h-7 text-purple-500" />,
    color: "bg-purple-100",
  },
];

// 🔸 Oylik daromadlar (Line + Gradient)
const incomeOptions = {
  chart: {
    type: "area",
    toolbar: { show: false },
    foreColor: "#6b7280",
  },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0,
    },
  },
  colors: ["#3b82f6"],
  dataLabels: { enabled: false },
  xaxis: { categories: ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul"] },
  yaxis: {
    labels: {
      formatter: (val) => (val / 1000000).toFixed(0) + "m",
    },
  },
};
const incomeSeries = [
  {
    name: "Daromad",
    data: [18000000, 22000000, 25000000, 21000000, 27000000, 30000000, 45200000],
  },
];

// 🔸 Haftalik qarzdorlar (Bar Chart)
const debtorsOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    foreColor: "#6b7280",
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "40%",
    },
  },
  colors: ["#ef4444"],
  dataLabels: { enabled: false },
  xaxis: { categories: ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"] },
};
const debtorsSeries = [
  {
    name: "Qarzdorlar",
    data: [3, 4, 5, 2, 6, 3, 1],
  },
];

export default function Dashboard() {
  return (
    <div className=" ">
      {/* 📊 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="shadow-md border border-gray-100 hover:shadow-xl transition duration-300"
          >
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <Typography variant="h6" className="font-bold text-gray-800">
                  {stat.value}
                </Typography>
                <Typography className="text-sm text-gray-500">
                  {stat.label}
                </Typography>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 📈 Charts */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        {/* Oylik daromad */}
        <Card className="shadow-md border border-gray-100">
          <CardBody>
            <Typography variant="h6" className="mb-4 text-gray-800">
              📈 Oylik Daromadlar (UZS)
            </Typography>
            <ReactApexChart
              options={incomeOptions}
              series={incomeSeries}
              type="area"
              height={320}
            />
          </CardBody>
        </Card>

        {/* Haftalik qarzdorlar */}
        <Card className="shadow-md border border-gray-100">
          <CardBody>
            <Typography variant="h6" className="mb-4 text-gray-800">
              📊 Haftalik Qarzdorlar
            </Typography>
            <ReactApexChart
              options={debtorsOptions}
              series={debtorsSeries}
              type="bar"
              height={320}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
