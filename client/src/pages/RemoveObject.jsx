import React, { useState } from 'react';
import { Scissors, Sparkles } from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import { apiRequest } from "../utils/apiRequest";
import toast from "react-hot-toast";

const RemoveObject = () => {
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState(null);
    const [outputUrl, setOutputUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const { getToken } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOutputUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !prompt.trim()) return toast.error("Please upload an image and enter a prompt.");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("object", prompt);

            const token = await getToken();
            const response = await apiRequest(
                'POST',
                '/api/ai/remove-image-object',
                formData,
                token
            );

            if (response.success) {
                console.log(response);
                setOutputUrl(response.data.content);
                toast.success("Object removed successfully.");
            } else {
                toast.error("❌ " + response.message);
            }
        } catch (err) {
            toast.error("Unexpected error occurred.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-y-4 lg:gap-x-4">
            {/* Form Section */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 text-[#EA580C]" />
                    <h2 className="text-lg font-semibold text-[#EA580C]">Remove Object from Image</h2>
                </div>

                {/* File Upload */}
                <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                    Upload Image
                </label>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full mt-2 p-2 px-3 text-sm border border-gray-300 rounded-md
                        file:cursor-pointer file:mr-4 file:border-0
                        file:bg-[#FFF7ED] file:text-[#EA580C]"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: .jpg, .png, etc.</p>

                {/* Prompt Input */}
                <label htmlFor="prompt" className="block mt-4 text-sm font-medium text-gray-700">
                    Prompt
                </label>
                <textarea
                    id="prompt"
                    required
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-2 px-3 mt-2 rounded-md border border-gray-300 outline-none text-sm resize-none"
                    placeholder="e.g., Remove tree, Remove car, etc.."
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 mt-6
                        text-white px-4 py-2 rounded-lg transition
                        bg-gradient-to-r from-[#EA580C] to-[#FB7185]
                        hover:from-[#C2410C] hover:to-[#F43F5E]"
                >
                    {loading ? (
                        <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
                    ) : (
                        <Scissors className="w-5" />
                    )}
                    Remove Object
                </button>
            </form>

            {/* Output Section */}
            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <Scissors className="w-5 h-5 text-[#EA580C]" />
                    <h2 className="text-xl font-semibold text-slate-700">Output Preview</h2>
                </div>

                <div className="flex-1 flex justify-center items-center">
                    {outputUrl ? (
                        <img
                            src={outputUrl}
                            alt="Processed"
                            className="max-h-72 rounded shadow object-contain"
                        />
                    ) :  (
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <Scissors className="h-9 w-9" />
                            <p>Upload an image and provide a prompt to remove unwanted objects</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RemoveObject;
