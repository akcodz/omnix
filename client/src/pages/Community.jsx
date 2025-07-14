import React, { useEffect, useState } from 'react';
import {useAuth, useUser} from "@clerk/clerk-react";
import { dummyPublishedCreationData } from "../assets/assets.js";
import { Heart } from "lucide-react";
import {apiRequest} from "../utils/apiRequest.js";
import toast from "react-hot-toast";

const Community = () => {
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    const {getToken} = useAuth();
    const fetchCreations = async () => {
        const token = await getToken(); // Clerk

        const response = await apiRequest(
            "GET",
            "/api/user/get-published-creations",
            {},
            token
        );

        if (response.success) {
            setCreations(response.data);
        } else {
            console.error("Failed to fetch creations:", response.message);
        }
        setLoading(false);
    };
    const toggleLike = async (id) => {
        const token = await getToken();
        const response = await apiRequest(
            "POST",
            "/api/user/toggle-like-creations",
            { id },
            token
        );


        if (response.success) {
            toast.success(response.message);
    await  fetchCreations()
        } else {
            console.error("Like toggle failed:", response.message);
        }
    };

    useEffect(() => {
        fetchCreations();
    }, [user]);

    return !loading ?(
        <div className="flex-1 h-full flex flex-col gap-4 p-6">
            Creations

            <div className="bg-white h-full w-full rounded-xl overflow-y-scroll ">
                {creations?.map((creation, index) => (
                    <div
                        key={index}
                        className="relative group inline-block rounded-lg pl-3 pt-3 w-full  sm:max-w-1/2 lg:max-w-1/3"
                    >
                        <img
                            src={creation.content}
                            alt={`Creation ${index}`}
                            className="w-full h-full object-cover rounded-lg"
                        />

                        {/* Prompt shown on hover */}
                        <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3  group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                            <p className='text-sm hidden group-hover:block'>
                                {creation.prompt}
                            </p>

                            <div className='flex gap-1 items-center '>
                                <span>{creation.likes.length}</span>
                                <Heart
                                    onClick={() => toggleLike(creation.id)}
                                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition ${
                                        creation.likes.includes(user.id)
                                            ? 'fill-red-500 text-red-600'
                                            : 'text-white'
                                    }`}
                                />
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>

    ):(
        <div className='flex justify-center items-center h-full'>
            <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
        </div>

    )
};

export default Community;
