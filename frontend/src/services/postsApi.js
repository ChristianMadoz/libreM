import { insforge } from '../lib/insforge';

/**
 * Service for interacting with the Posts table on InsForge.
 * Uses the InsForge SDK Database module.
 */
export const postsApi = {
    /**
     * Fetch all posts from the 'posts' table
     */
    getPosts: async () => {
        const { data, error } = await insforge.database
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Fetch a single post by ID
     */
    getPost: async (id) => {
        const { data, error } = await insforge.database
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create a new post
     */
    createPost: async (postData) => {
        const { data, error } = await insforge.database
            .from('posts')
            .insert([{
                ...postData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return data;
    },

    /**
     * Update an existing post
     */
    updatePost: async (id, postData) => {
        const { data, error } = await insforge.database
            .from('posts')
            .update({
                ...postData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
        return data;
    },

    /**
     * Delete a post
     */
    deletePost: async (id) => {
        const { data, error } = await insforge.database
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return data;
    }
};
