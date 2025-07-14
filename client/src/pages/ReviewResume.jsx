import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import {useAuth} from "@clerk/clerk-react";
import {apiRequest} from "../utils/apiRequest.js";
import Markdown from "react-markdown";

const ReviewResume = () => {
    const [file, setFile] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const { getToken } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setFeedback('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
 setLoading(true);
        const token = await getToken();
        const formData = new FormData();
        formData.append('resume', file);

        setLoading(true);
        const response = await apiRequest(
            'POST',
            '/api/ai/resume-review',
            formData,
            token,
        );
        setLoading(false);

        if (response.success) {
            setFeedback(response.data.content); // Assuming `content` contains feedback
        } else {
            setFeedback(`❌ ${response.message}`);
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
                    <Sparkles className="w-6 text-[#7C3AED]" />
                    <h2 className="text-lg font-semibold text-[#7C3AED]">Resume Review</h2>
                </div>

                {/* Upload Input */}
                <label htmlFor="resume-upload" className="text-sm font-medium text-gray-700">
                    Upload Resume
                </label>
                <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                    className="w-full mt-2 p-2 px-3 text-sm border border-gray-300 rounded-md
                    file:cursor-pointer file:mr-4 file:border-0"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: .pdf, .doc, .docx</p>

                {/* Submit Button */}
                <button
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-4 mt-6
                    text-white px-4 py-2 rounded-lg transition
                    bg-gradient-to-r from-[#7C3AED] to-[#C084FC]
                    hover:from-[#6D28D9] hover:to-[#A855F7]"
                > {loading ? (
                        <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
                    ) : (
                    <FileText className="w-5" />

                    )
                }
                    Submit for Review
                </button>
            </form>

            {/* Output Section */}
            <div className="w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-5 h-5 text-[#7C3AED]" />
                    <h2 className="text-xl font-semibold text-slate-700">Uploaded Resume</h2>
                </div>

                    {feedback ? (
                        <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                            <div className='reset-tw'>
                                <Markdown>
                                    {feedback}
                                </Markdown>
                            </div>
                        </div>
                    ) : (
                <div className="flex-1 flex justify-center items-center">
                        <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
                            <FileText className="h-9 w-9" />
                            <p>Upload your resume to get feedback and suggestions</p>
                        </div>
                </div>
                    )}
            </div>
        </div>
    );
};

export default ReviewResume;
