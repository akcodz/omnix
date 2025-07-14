import React, { useState } from 'react';
import {Edit, Hash, Sparkles} from 'lucide-react';
import {apiRequest} from "../utils/apiRequest.js";
import toast from "react-hot-toast";
import {useAuth} from "@clerk/clerk-react";
import Markdown from "react-markdown";

const blogCategories = [
    'Technology',
    'Health & Wellness',
    'Finance',
    'Travel',
    'Education',
    'Lifestyle',
    'Marketing',
    'Career & Jobs',
];

const BlogTitles = () => {
    const [input, setInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(blogCategories[0]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const {getToken} =  useAuth();
    const handleSubmit =async (e) => {
        e.preventDefault();
        setLoading(true);

        const prompt = `Write an article about "${input}" in the category ${selectedCategory}.`;
        try {
            const token = await getToken();
            const response = await apiRequest(
                'POST',
                '/api/ai/generate-blog-title',
                prompt ,
                token);

            if (response.success) {
                setContent(response.data);
                setInput('');
                setSelectedCategory(blogCategories[0]);
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
            {/* Left Column */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-teal-500" />
                    <h2 className="text-lg font-semibold text-slate-800">Blog Configuration</h2>
                </div>

                <label htmlFor="keyword" className="text-sm font-medium text-slate-700">Keyword</label>
                <input
                    id="keyword"
                    type="text"
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full p-2 px-3 mt-2 rounded-md border border-gray-300 outline-none text-sm"
                    placeholder="e.g., Artificial Intelligence, Sustainable Travel, etc."
                />

                <p className="mt-4 text-sm font-medium text-slate-700">Select a Blog Category</p>
                <div className="mt-3 flex gap-3 flex-wrap sm:max-w-[90%]">
                    {blogCategories.map((category, index) => (
                        <span
                            key={index}
                            onClick={() => setSelectedCategory(category)}
                            className={`text-xs px-4 py-1 border rounded-full cursor-pointer transition ${
                                selectedCategory === category
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
              {category}
            </span>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 mt-6
          text-white px-4 py-2 rounded-lg transition
          bg-gradient-to-r from-[#10B981] to-[#14B8A6]
          hover:from-[#047857] hover:to-[#0F766E]"
                >
                    {
                        loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Hash className="w-5" />
                    }
                    Generate Title
                </button>
            </form>

            {/* Right Column */}
            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <Hash className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-semibold text-slate-700">Generated Blog Titles</h2>
                </div>

                {!content ? (  <div className="flex-1 flex justify-center items-center">
                    <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                        <Edit className="h-9 w-9" />
                        <p>Enter a topic and choose category and  click "Generate Title" to get started</p>
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

export default BlogTitles;
