import Link from "next/link"
 
export default function Logo(){
    return(
        <div className="border-2 border-red-600 flex text-xl  text-white justify-center w-32 h-auto" style={{fontFamily:"monospace"}}>
            <Link href= "/"> KUCHIKI</Link>
        </div>
    )
}