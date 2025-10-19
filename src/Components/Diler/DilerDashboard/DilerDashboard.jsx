import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
} from "@material-tailwind/react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

export default function DilerDashboard() {
    const [data, setData] = useState({
        jamiFoyda: 23500000,
        jamiTovarlar: 120,
        jamiSotuvlar: 75,
        jamiXaridlar: 48,
    });

    const [daromadData, setDaromadData] = useState([
        { oy: "Yan", summa: 2000000 },
        { oy: "Fev", summa: 2800000 },
        { oy: "Mar", summa: 3500000 },
        { oy: "Apr", summa: 4200000 },
        { oy: "May", summa: 5100000 },
        { oy: "Iyun", summa: 6100000 },
        { oy: "Iyul", summa: 7500000 },
        { oy: "Avg", summa: 8900000 },
        { oy: "Sen", summa: 10300000 },
        
    ]);

    const [barData] = useState([
        { name: "Yan", sotuv: 4000, xarid: 2400 },
        { name: "Fev", sotuv: 3000, xarid: 1398 },
        { name: "Mar", sotuv: 5000, xarid: 2400 },
        { name: "Apr", sotuv: 2780, xarid: 3908 },
        { name: "May", sotuv: 4890, xarid: 4800 },
    ]);

    const pieData = [
        { name: "Sotuvlar", value: data.jamiSotuvlar },
        { name: "Xaridlar", value: data.jamiXaridlar },
    ];

    const COLORS = ["#4CAF50", "#FF9800"];

    return (
        <div className="">
            <Typography variant="h4" color="blue-gray" className="mb-8 font-semibold">
                Diler boshqaruv paneli
            </Typography>

            {/* Statistik kartalar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardBody className="text-center">
                        <Typography variant="small" color="gray" className="mb-2 uppercase font-bold tracking-wide">
                            Jami foyda
                        </Typography>
                        <Typography variant="h4" color="green" className="font-bold">
                            {data.jamiFoyda.toLocaleString()} so‘m
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardBody className="text-center">
                        <Typography variant="small" color="gray" className="mb-2 uppercase font-bold tracking-wide">
                            Jami tovarlar
                        </Typography>
                        <Typography variant="h4" className="font-bold text-blue-gray-700">
                            {data.jamiTovarlar}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardBody className="text-center">
                        <Typography variant="small" color="gray" className="mb-2 uppercase  font-bold tracking-wide">
                            Sotuvlar
                        </Typography>
                        <Typography variant="h4" color="blue" className="font-bold">
                            {data.jamiSotuvlar}
                        </Typography>
                    </CardBody>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-all duration-200">
                    <CardBody className="text-center">
                        <Typography variant="small" color="gray" className="mb-2 uppercase font-bold tracking-wide">
                            Xaridlar
                        </Typography>
                        <Typography variant="h4" color="orange" className="font-bold">
                            {data.jamiXaridlar}
                        </Typography>
                    </CardBody>
                </Card>
            </div>

            {/* Grafiklar */}
            <div className="space-y-12">
                {/* Pul daromadi o‘sishi */}
                <Card className="shadow-md p-4">
                    <Typography variant="h6" color="blue-gray" className="mb-4 text-left">
                        Daromadning o‘sishi
                    </Typography>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={daromadData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="oy" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString()} so‘m`} />
                            <Line
                                type="monotone"
                                dataKey="summa"
                                stroke="#2196F3"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Sotuv va xarid taqqoslanishi */}
                <Card className="shadow-md p-4">
                    <Typography variant="h6" color="blue-gray" className="mb-4 text-center">
                        Sotuv va xarid taqqoslanishi
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sotuv" fill="#4CAF50" name="Sotuvlar" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="xarid" fill="#FF9800" name="Xaridlar" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}
