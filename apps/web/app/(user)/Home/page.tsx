
import React from 'react'
import { HomePageBg } from '@/components/homePageBg'
import { Input } from '@/components/ui/input'

function Home() {
  return (
    <div className="relative min-h-screen">
      <HomePageBg>

        <div className='flex flex-col items-center gap-4'>
          <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative z-20">
            Paste your youtube video link here
          </h1>
          <input className='flex  rounded-lg m-4 text-white bg-gray-800 w-full h-10 p-2' placeholder='example--www.youtube.com/.... '>
          </input>
          <button className='bg-white text-black px-4 py-2 flex justify-center items-center rounded-lg '>
            Get Notes!
          </button>

        </div>


      </HomePageBg>

    </div>
  )
}
export default Home


