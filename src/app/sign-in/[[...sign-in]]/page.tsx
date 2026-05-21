import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='w-screen min-h-screen bg-linear-to-r from-[#0f172a]  to-[#334155]'>
            <div className='flex items-center justify-center'>
                <SignIn />
            </div>
        </div>
    )
}