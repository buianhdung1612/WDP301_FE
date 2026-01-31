import axios from "axios"
const BASE_URL = "http://localhost:3000"
// const BASE_URL = "https://ox9honvra.localto.net"

const apiApp = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

export { apiApp }