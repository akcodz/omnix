import React, { useState } from 'react';
import { Eraser, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { apiRequest } from '../utils/apiRequest';
import toast from 'react-hot-toast';

const RemoveBackground = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');

    const { getToken } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('image', file);

            const response = await apiRequest(
                'POST',
                '/api/ai/remove-image-background',
                formData,
                token,
            );

            if (response.success) {
                setContent(response.data.content);
                toast.success('🎉 Background removed successfully');
            } else {
                toast.error("❌ " + response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-scroll p-6 flex flex-col lg:flex-row items-start gap-y-2 lg:gap-x-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200"
            >
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 text-[#A855F7]" />
                    <h2 className="text-lg font-semibold">Remove Background</h2>
                </div>

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
                    file:cursor-pointer file:mr-4 file:border-0"
                />

                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, and other image formats</p>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 mt-6 text-white px-4 py-2 rounded-lg transition
                    bg-gradient-to-r from-[#A855F7] to-[#F43F5E]
                    hover:from-[#9333EA] hover:to-[#E11D48]"
                >
                    {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" />
                    ) : (
                        <Eraser className="w-5" />
                    )}
                    Remove Background
                </button>
            </form>

            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <Eraser className="w-5 h-5 text-[#A855F7]" />
                    <h2 className="text-xl font-semibold text-slate-700">Output Preview</h2>
                </div>

                <div className="flex-1 flex justify-center items-center overflow-y-auto max-h-[80vh]">
                    {content ? (
                        <img
                            src={content}
                            alt="Processed"
                            className="object-contain max-h-[70vh] max-w-full "
                        />
                    ) : (
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <Eraser className="h-9 w-9" />
                            <p>Upload an image to preview and remove its background</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RemoveBackground;
