// /controllers/aiController.js
import { sendResponse } from "../lib/response.js";
import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import pdf from 'pdf-parse/lib/pdf-parse.js'
import resumeReviewPrompt from "../lib/resumeReviewPrompt.js";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Helper: Increment free usage for non-premium users
const incrementFreeUsage = async (userId, currentUsage) => {
    await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
            free_usage: currentUsage + 1
        }
    });
};

export const generateArticle = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt, length } = req.body;
        const { plan, free_usage } = req;

        if (plan !== "premium" && free_usage >= 10) {
            return sendResponse(res, 400, "Limit reached. Upgrade your plan to continue.");
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: length
        });

        const content = response.choices?.[0]?.message?.content || "";

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'article')
        `;

        if (plan !== "premium") {
            await incrementFreeUsage(userId, free_usage);
        }

        return sendResponse(res, 200, "Article created successfully", content);
    } catch (error) {
        console.error("Error creating article:", error);
        return sendResponse(res, 500, "Failed to create article");
    }
};

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt } = req.body;
        const { plan, free_usage } = req;

        if (plan !== "premium" && free_usage >= 10) {
            return sendResponse(res, 400, "Limit reached. Upgrade your plan to continue.");
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 100
        });

        const content = response.choices?.[0]?.message?.content || "";

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
        `;

        if (plan !== "premium") {
            await incrementFreeUsage(userId, free_usage);
        }

        return sendResponse(res, 200, "Blog Title created successfully", content);
    } catch (error) {
        console.error("Error creating blog title:", error);
        return sendResponse(res, 500, "Failed to create blog title");
    }
};

export const generateImage = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { prompt, publish } = req.body;
        const { plan } = req;

        if (plan !== "premium") {
            return sendResponse(res, 400, "Upgrade your plan to continue.");
        }

        const formData = new FormData();
        formData.append("prompt", prompt);

        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                ...formData.getHeaders(),
                "x-api-key": process.env.CLIPDROP_API_KEY
            },
            responseType: "arraybuffer"
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

        return sendResponse(res, 200, "Image generated successfully", { content: secure_url });
    } catch (error) {
        console.error("Error generating image:", error);
        return sendResponse(res, 500, "Failed to generate image");
    }
};

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const plan = req.plan;
        const image = req.file;

        if (!image) {
            return sendResponse(res, 400, "Image file is required.");
        }

        if (plan !== "premium") {
            return sendResponse(res, 400, "Upgrade your plan to use this feature.");
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: "background_removal",
                    background_removal: "remove_the_background",
                },
            ],
        });

        await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Removed background from image', ${secure_url}, 'image')
    `;

        return sendResponse(res, 200, "Background removed successfully", {
            content: secure_url,
        });
    } catch (error) {
        console.error("Error in removeImageBackground:", error);
        return sendResponse(res, 500, "Failed to remove image background");
    }
};

// ✅ Remove Specific Object from Image
export const removeImageObject = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const plan = req.plan;
        const { object } = req.body;
        const image = req.file;

        if (!image || !object) {
            return sendResponse(res, 400, "Image and object prompt are required.");
        }

        if (plan !== "premium") {
            return sendResponse(res, 400, "Upgrade your plan to use this feature.");
        }

        // Upload image to Cloudinary and get public_id and format
        const { public_id, format } = await cloudinary.uploader.upload(image.path);

        // ✅ Sanitize object name — only one keyword allowed
        const cleanObject = object.trim().split(" ").pop().toLowerCase();

        const transformedUrl = cloudinary.url(`${public_id}.${format}`, {
            transformation: [{ effect: `gen_remove:${cleanObject}` }],
            resource_type: "image",
        });

        const promptText = `Remove ${cleanObject} from image`;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, ${promptText}, ${transformedUrl}, 'image')
        `;

        return sendResponse(res, 200, "Object removed successfully", {
            content: transformedUrl,
        });

    } catch (error) {
        console.error("Error in removeImageObject:", error);

        // Optional: add Cloudinary-specific feedback
        if (error?.response?.status === 400) {
            return sendResponse(res, 400, "Cloudinary could not process the transformation. Check if the object name is valid and if your plan supports this feature.");
        }

        return sendResponse(res, 500, "Failed to remove object from image");
    }
};


export const reviewResume = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const plan = req.plan;
        const resume = req.file;

        if (!resume) {
            return sendResponse(res, 400, "Resume file is required.");
        }

        if (plan !== "premium") {
            return sendResponse(res, 400, "Upgrade your plan to use this feature.");
        }

        if (resume.size > 5 * 1024 * 1024) {
            return sendResponse(res, 400, "Resume size exceeds 5MB limit.");
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer); // Extracts text from PDF

        // Inject resume content into the full prompt
        const fullPrompt = `${resumeReviewPrompt}\n\nHere is the resume:\n${pdfData.text}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: fullPrompt }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices?.[0]?.message?.content || "";

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')
        `;

        return sendResponse(res, 200, "Resume reviewed successfully", {
            content,
        });

    } catch (error) {
        console.error("Error in reviewResume:", error);
        return sendResponse(res, 500, "Failed to review resume");
    }
};
