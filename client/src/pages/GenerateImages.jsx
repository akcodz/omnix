import React, { useState } from 'react';
import { Sparkles, Image } from 'lucide-react';
import {useAuth} from "@clerk/clerk-react";
import {apiRequest} from "../utils/apiRequest.js";
import toast from "react-hot-toast";

const imageStyles = [
    'Realistic',
    'Ghibli',
    'Cyberpunk',
    'Minimalist',
    'Anime',
    'Surreal',
    'Futuristic',
];

const GenerateImages = () => {
    const [input, setInput] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(imageStyles[0]);
    const [publish, setPublish] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    const {getToken}= useAuth()

    const handleSubmit =async (e) => {
        setLoading(true);
        e.preventDefault();
        const token = getToken();

        const prompt = `Generate an image of  "${input}" in the style ${selectedStyle}.`;
        try {
            const token = await getToken();
            const response = await apiRequest(
                'POST',
                '/api/ai/generate-image',
                {prompt,publish} ,
                token);

            if (response.success) {
                console.log(response);
                setContent(response.data.content);
                setInput('');
                setSelectedStyle(imageStyles[0]);
            } else {
                toast.error("❌ " + response.message);
            }
        } catch (error) {
            toast.error("Unexpected error occurred.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-y-2 lg:gap-x-4">
            {/* Left Column: Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 text-yellow-500" />
                    <h2 className="text-lg font-semibold text-slate-800">Image Generator</h2>
                </div>

                {/* Prompt Textarea */}
                <label htmlFor="Prompt" className="text-sm font-medium text-slate-700">
                    Prompt
                </label>
                <textarea
                    id="prompt"
                    required
                    rows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 px-3 mt-2 rounded-md border border-gray-300 outline-none text-sm resize-none"
                    placeholder="e.g., A futuristic skyline with glowing buildings"
                />

                {/* Image Style Selection */}
                <p className="mt-4 text-sm font-medium text-slate-700">Choose a Style</p>
                <div className="mt-3 flex gap-3 flex-wrap sm:max-w-[90%]">
                    {imageStyles.map((style, index) => (
                        <span
                            key={index}
                            onClick={() => setSelectedStyle(style)}
                            className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition font-medium ${
                                selectedStyle === style
                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                    : 'hover:bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                        >
              {style}
            </span>
                    ))}
                </div>

                <div className="my-6 flex items-center gap-2">
                    <label className="relative inline-block w-9 h-5 cursor-pointer">
                        <input
                            type="checkbox"
                            onChange={(e) => setPublish(e.target.checked)}
                            checked={publish}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300" />
                        <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
                    </label>
                    <p className="text-sm text-slate-700">Make this image public</p>
                </div>


                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 mt-6
             text-white px-4 py-2 rounded-lg transition
             bg-gradient-to-r from-[#F59E0B] to-[#EF4444]
             hover:from-[#D97706] hover:to-[#DC2626]"
                >{
                    loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> :
                    <Image className="w-5"/>}
                    Generate Image
                </button>

            </form>

            {/* Right Column: Output */}
            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <Image className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-700">Generated Image</h2>
                </div>

                <div className="flex-1 flex justify-center items-center overflow-y-auto max-h-[80vh]">
                    {content ? (
                        <div className="mt-3 max-h-full max-w-full overflow-auto">
                            <img
                                src={content}
                                alt="Generated"
                                className="object-contain max-h-[70vh] max-w-full "
                            />
                        </div>
                    ) : (
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <Image className="h-9 w-9" />
                            <p>Enter a prompt and select a style to generate an image</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GenerateImages;
