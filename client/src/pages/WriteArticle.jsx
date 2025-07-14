import React, { useState } from 'react';
import { Edit, Sparkles } from 'lucide-react';
import {apiRequest} from "../utils/apiRequest.js";
import {useAuth} from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

const articleLength = [
    { length: 800, text: 'Short (500–800 words)' },
    { length: 1280, text: 'Medium (800–1200 words)' },
    { length: 1600, text: 'Long (1200+ words)' },
];

const WriteArticle = () => {
    const [input, setInput] = useState('');
    const [selectedLength, setSelectedLength] = useState(articleLength[0]);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    const { getToken } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const prompt = `Write an article about "${input}" in ${selectedLength.text}.`;
        try {
            const token = await getToken();
            const response = await apiRequest(
                'POST',
                '/api/ai/generate-article',
                { prompt, length: selectedLength.length },
                token);

            if (response.success) {
                setContent(response.data);
                setInput('');
                setSelectedLength(articleLength[0]);
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
                    <Sparkles className="w-6 text-[#2563EB]" />
                    <h2 className="text-lg font-semibold ">Article Configuration</h2>
                </div>

                <label htmlFor="topic" className="text-sm font-medium text-gray-700">
                    Topic
                </label>
                <input
                    id="topic"
                    type="text"
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 px-3 mt-2 rounded-md border border-gray-300 outline-none text-sm"
                    placeholder="The future of artificial intelligence."
                />

                <p className="mt-4 text-sm font-medium text-gray-700">Article Length</p>
                <div className="mt-3 flex gap-3 flex-wrap sm:max-w-[90%]">
                    {articleLength.map((item, index) => (
                        <span
                            key={index}
                            onClick={() => setSelectedLength(item)}
                            className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                                selectedLength.length === item.length
                                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                    : 'hover:bg-blue-50 text-gray-700 border-gray-300'
                            }`}
                        >
              {item.text}
            </span>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 mt-6
            text-white px-4 py-2 rounded-lg transition
            bg-gradient-to-r from-[#2563EB] to-[#60A5FA]
            hover:from-[#1E40AF] hover:to-[#3B82F6]"
                >
                    {
                    loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> :
                        <Edit className="w-5" />
                    }
                    Generate Article
                </button>
            </form>

            {/* Right Column: Output */}
            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <Edit className="w-5 h-5 text-[#2563EB]" />
                    <h2 className="text-xl font-semibold text-slate-700">Generated Article</h2>
                </div>

                {!content ? (  <div className="flex-1 flex justify-center items-center">
                    <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                        <Edit className="h-9 w-9" />
                        <p>Enter a topic and click "Generate article" to get started</p>
                    </div>
                </div>):(
                    <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset-tw'>
                        <Markdown>
                            {content}
                        </Markdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WriteArticle;
