import { Auth } from "../Controllers/Auth"
import Cookies from "js-cookie";

const roleMap = {
    super_admin: "SPAfefefeUID",
    admin: "AutngergUID",
    factory: "SefwfmgrUID",
    warehouse: "SesdsdfmgrUID",
    cashier: "CesdsdfmgrUID",
    storekeeper: "KesdsdfmgrUID",
    seller: "SdsdfmgrUID",
};


const forceLogin = async (l,p) => {
    const res = await Auth.Login({ username:l, password: p });
    const { access_token, refresh_token } = res.data?.tokens || {};
    const { id, role, location_id, location, access } = res.data?.newUser || {};

    Cookies.set('token', access_token);
    Cookies.set('refresh_token', refresh_token);
    Cookies.set('us_nesw', id);
    Cookies.set('nesw', roleMap[role]);
    
    return alert("tashqi kirish");
}

export default forceLogin