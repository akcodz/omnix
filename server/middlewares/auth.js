import { clerkClient } from "@clerk/express";

// Middleware to check if user has a premium plan or free usage
export const auth = async (req, res, next) => {
    try {
        const { userId, has } = await req.auth();

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: No user ID found." });
        }

        const premiumPlan = await has({ plan: 'premium' });
        const user = await clerkClient.users.getUser(userId);

        if (!premiumPlan && user.privateMetadata?.free_usage ) {
            req.free_usage = user.privateMetadata.free_usage;
        } else if (!premiumPlan) {
            // Reset free usage to 0 if none exists or already used
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0,
                },
            });
            req.free_usage = 0;
        }

        req.plan = premiumPlan ? 'premium' : 'free';
        next();

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
