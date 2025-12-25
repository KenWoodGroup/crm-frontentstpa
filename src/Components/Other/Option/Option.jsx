import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
} from "@material-tailwind/react";
import { OptionApi } from "../../../utils/Controllers/OptionApi";
import CreateOption from "./_components/CreateOption";
import Loading from "../../UI/Loadings/Loading";
import EmptyData from "../../UI/NoData/EmptyData";
import DeleteOption from "./_components/DeleteOption";
import EditOption from "./_components/EditOption";

export default function Option() {
    const [options, setOptions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true)

    const getOptions = async (pageNumber = 1) => {
        setLoading(true)
        try {
            const response = await OptionApi.GetOption(pageNumber);

            setOptions(response?.data.data.records);
            setTotalPages(response?.data?.data.pagination.total_pages);
            setPage(Number(response?.data?.data.pagination.currentPage));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        getOptions(page);
    }, [page]);


    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-[25px] font-bold">
                    Variantlar
                </h1>
                <CreateOption refresh={() => getOptions(page)} />
            </div>

            {/* Cards */}
            {options?.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((item) => (
                            <Card key={item.id} className="shadow-md">
                                <CardBody>
                                    <div className="flex items-center justify-between">
                                        <Typography variant="h6" className="mb-2">
                                            {item.name}
                                        </Typography>
                                        <div className="flex items-center gap-[10px]">
                                            <EditOption data={item} refresh={() => getOptions(page)} />
                                            <DeleteOption id={item?.id} refresh={() => getOptions(page)}/>
                                        </div>
                                    </div>
                                    <Typography className="text-gray-700 mb-1">
                                        Narxi:{" "}
                                        <span className="font-semibold">
                                            {Number(item.price).toLocaleString("uz-UZ")} so‘m
                                        </span>
                                    </Typography>

                                    <Typography className="text-gray-600 text-sm">
                                        Izoh: {item.note || "—"}
                                    </Typography>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                                size="sm"
                                variant="outlined"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Oldingi
                            </Button>

                            <span className="text-sm font-medium">
                                {page} / {totalPages}
                            </span>

                            <Button
                                size="sm"
                                variant="outlined"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Keyingi
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <EmptyData text="Ma’lumot yo‘q" />
            )}

        </>
    );
}
