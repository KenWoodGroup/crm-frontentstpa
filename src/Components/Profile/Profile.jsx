import { useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";

export default function Profile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ name, email, password });
        // Здесь можно добавить отправку данных на backend
    };

    return (
        <div className="flex justify-center mt-10">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader
                    color="blue"
                    className="mb-4 p-4 text-center"
                >
                    <Typography variant="h5" color="white">
                        Profile
                    </Typography>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Name"
                            size="lg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            type="email"
                            label="Email"
                            size="lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            label="Password"
                            size="lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" color="blue" size="lg" className="mt-2">
                            Save
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
