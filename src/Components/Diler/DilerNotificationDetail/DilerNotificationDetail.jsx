import { useParams } from "react-router-dom"
import { Notification } from "../../../utils/Controllers/Notification"
import { useEffect } from "react"

export default function DilerNotificationDetail() {

    const { id } = useParams()


    const GetNotification = async () => {
        try {
            const response = await Notification?.GetNotoficationById(id)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        GetNotification()
    }, [])

    return (
        <>

        </>
    )
}