import { useNavigate } from "react-router-dom"

export default function Landing(){

    const navigate = useNavigate()
    function login(){
        navigate("/login")
    }

    return(
        <div className="h-screen flex flex-col items-center justify-center gap-8">

            <div>Sujay Singh</div>
            <div className="text-7xl">
                (●'◡'●)
            </div>
            <button onClick={login} className="bg-black text-white text-lg rounded-full px-6 py-2 font-bold cursor-pointer hover:bg-black/80 duration-100">Login</button>

        </div>
    )
}
