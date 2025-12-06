export default function ManagerDashboard() {

    // Пример данных — потом заменишь на реальные (axios или GraphQL)
    const factoryCount = 12;
    const dealerCount = 34;
    const companyCount = 8;

    const cards = [
        {
            title: "Zavodlar",
            value: factoryCount,
            icon: (
                <svg className="w-10 h-10 text-[#4DA057]" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 26 26"><path fill="currentColor" d="M24.469.993a1 1 0 0 0-.999-.95h-2.849a1 1 0 0 0-.996.91L18 19.268V12h-2V9a1.002 1.002 0 0 0-1.554-.832L8.697 12H8V9a1.002 1.002 0 0 0-1.554-.832l-6 4A1 1 0 0 0 0 13v12a1 1 0 0 0 1 1h24.02c.553 0 .949-.352.949-.904c0-.086-1.5-24.103-1.5-24.103M5 14v3H3v-3zm5 0v3H8v-3zm5 0v3h-2v-3zM5 19v3H3v-3zm5 0v3H8v-3zm5 0v3h-2v-3z"></path></svg>
            ),
        },
        {
            title: "Dilerlar",
            value: dealerCount,
            icon: (
                <svg className="w-10 h-10 text-[#0A9EB3]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M21.987 18.73a2 2 0 0 1-.34.85a1.9 1.9 0 0 1-1.56.8h-1.651a.74.74 0 0 1-.6-.31a.76.76 0 0 1-.11-.67c.37-1.18.29-2.51-3.061-4.64a.77.77 0 0 1-.32-.85a.76.76 0 0 1 .72-.54a7.61 7.61 0 0 1 6.792 4.39a2 2 0 0 1 .13.97M19.486 7.7a4.43 4.43 0 0 1-4.421 4.42a.76.76 0 0 1-.65-1.13a6.16 6.16 0 0 0 0-6.53a.75.75 0 0 1 .61-1.18a4.3 4.3 0 0 1 3.13 1.34a4.46 4.46 0 0 1 1.291 3.12z"></path><path fill="currentColor" d="M16.675 18.7a2.65 2.65 0 0 1-1.26 2.48c-.418.257-.9.392-1.39.39H4.652a2.63 2.63 0 0 1-1.39-.39A2.62 2.62 0 0 1 2.01 18.7a2.6 2.6 0 0 1 .5-1.35a8.8 8.8 0 0 1 6.812-3.51a8.78 8.78 0 0 1 6.842 3.5a2.7 2.7 0 0 1 .51 1.36M14.245 7.32a4.92 4.92 0 0 1-4.902 4.91a4.903 4.903 0 0 1-4.797-5.858a4.9 4.9 0 0 1 6.678-3.57a4.9 4.9 0 0 1 3.03 4.518z"></path></svg>
            ),
        },
        {
            title: "Kompaniyalar",
            value: companyCount,
            icon: (
                <svg className="w-10 h-10 text-[#FFC107]" xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><path fill="currentColor" d="M18 15h-2v2h2m0-6h-2v2h2m2 6h-8v-2h2v-2h-2v-2h2v-2h-2V9h8M10 7H8V5h2m0 6H8V9h2m0 6H8v-2h2m0 6H8v-2h2M6 7H4V5h2m0 6H4V9h2m0 6H4v-2h2m0 6H4v-2h2m6-10V3H2v18h20V7z"></path></svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {cards.map((card, index) => (
                <div
                    key={index}
                    className="
                        p-6 rounded-2xl shadow-md
                        bg-card-light dark:bg-card-dark
                        text-text-light dark:text-text-dark
                        flex items-center gap-6 transition-all duration-300
                        hover:scale-[1.02] hover:shadow-lg
                    "
                >
                    <div>{card.icon}</div>

                    <div>
                        <h2 className="text-lg font-semibold">{card.title}</h2>
                        <p className="text-3xl font-bold mt-1">{card.value}</p>
                    </div>
                </div>
            ))}

        </div>
    );
}
