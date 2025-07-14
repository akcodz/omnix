import React from 'react'
import {useNavigate} from "react-router-dom";
import {assets} from "../assets/assets.js";

const Hero = () => {
    const navigate = useNavigate()
    return (
        <div
            className="px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url('/gradientBackground.png')] bg-cover bg-no-repeat min-h-screen"
        >
            <div className="text-center mb-6">
                <h1 className="text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-semibold mx-auto leading-[1.2]">
                    Create amazing content with <span className="text-primary">tools</span>
                </h1>
                <p className="max-w-xs sm:max-w-lg xl:max-w-xl mx-auto text-sm sm:text-base text-gray-600 mt-4">
                    Transform your content creation with our suite of premium AI tools.
                    Write articles, generate images, and enhance your workflow.
                </p>
            </div>
            <div className="flex gap-4 flex-wrap justify-center text-sm max-sm:text-sm">
                <button
                    onClick={() =>navigate("/ai")}
                    className="bg-primary text-white px-10 py-3 rounded-lg hover:scale-105 active:scale-95 transition duration-200 cursor-pointer"
                >
                    Start creating now
                </button>

                <button
                    className="bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-105 active:scale-95 transition duration-200 cursor-pointer"
                >
                    Watch demo
                </button>
            </div>
            <div className="flex items-center gap-4 mt-8 mx-auto text-gray-600 justify-center">
                <img src={assets.user_group} alt="User Group" className="h-8" />
                <p className="text-sm sm:text-base font-medium">
                    Trusted by <span className="font-semibold text-black">100+</span> people
                </p>
            </div>

        </div>

    )
}
export default Hero
