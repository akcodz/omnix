import sql from "../config/db.js";
import { sendResponse } from "../lib/response.js";

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = await req.auth();

        if (!userId) {
            return sendResponse(res, 401, "Unauthorized: User ID not found.");
        }

        const creations = await sql`
            SELECT *
            FROM creations
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        return sendResponse(res, 200, "Creations fetched successfully", creations);
    } catch (error) {
        console.error("Error fetching user creations:", error);
        return sendResponse(res, 500, "Failed to fetch user creations");
    }
};

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT * 
            FROM creations
            WHERE publish = true
            ORDER BY created_at DESC
        `;

        return sendResponse(res, 200, "Published creations fetched successfully", creations);
    } catch (error) {
        console.error("Error fetching published creations:", error);
        return sendResponse(res, 500, "Failed to fetch published creations");
    }
};


export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        if (!userId) return sendResponse(res, 401, "Unauthorized: User ID not found.");
        if (!id) return sendResponse(res, 400, "Creation ID is required.");

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id}
        `;

        if (!creation) return sendResponse(res, 404, "Creation not found.");

        let currentLikes = creation.likes || [];
        let updatedLikes = [];
        let message = '';

        // Toggle like
        if (currentLikes.includes(userId)) {
            updatedLikes = currentLikes.filter(uid => uid !== userId);
            message='Creation uniked'
        } else {
            updatedLikes = [...currentLikes, userId];
            message='Creation liked'
        }

        const formattedArray=`{${updatedLikes.join(',')}}`
        await sql`
            UPDATE creations
            SET likes = ${formattedArray}::text[], updated_at = NOW()
            WHERE id = ${id}
        `;

        return sendResponse(res, 200, message, );

    } catch (error) {
        console.error("❌ Error toggling like:", error);
        return sendResponse(res, 500, "Failed to toggle like");
    }
};



