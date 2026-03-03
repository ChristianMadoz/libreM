import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsApi } from '../services/postsApi';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, MessageSquare, Trash2, Edit2, User } from 'lucide-react';

const Posts = () => {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [editingPost, setEditingPost] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await postsApi.getPosts();
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('No se pudieron cargar las publicaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) {
            toast.error('Título y contenido son requeridos');
            return;
        }

        try {
            await postsApi.createPost({
                title: newPost.title,
                content: newPost.content,
                author: user.name,
                author_id: user.user_id
            });
            toast.success('Publicación creada');
            setNewPost({ title: '', content: '' });
            setIsCreating(false);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('No se pudo crear la publicación');
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;
        try {
            await postsApi.deletePost(id);
            toast.success('Publicación eliminada');
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('No se pudo eliminar la publicación');
        }
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        try {
            await postsApi.updatePost(editingPost.id, {
                title: editingPost.title,
                content: editingPost.content
            });
            toast.success('Publicación actualizada');
            setEditingPost(null);
            fetchPosts();
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error('No se pudo actualizar la publicación');
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#3483FA] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Publicaciones</h1>
                    {isAuthenticated && !isCreating && (
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-[#3483FA] hover:bg-[#2968C8]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Publicación
                        </Button>
                    )}
                </div>

                {isCreating && (
                    <Card className="mb-8 border-2 border-[#3483FA]/20">
                        <CardHeader>
                            <CardTitle>Crear Nueva Publicación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <Input
                                    placeholder="Título"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                />
                                <Textarea
                                    placeholder="¿Qué quieres compartir?"
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={4}
                                    required
                                />
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-[#3483FA] hover:bg-[#2968C8]">
                                        Publicar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <Card className="p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay publicaciones todavía.</p>
                            {isAuthenticated && (
                                <Button
                                    variant="link"
                                    onClick={() => setIsCreating(true)}
                                    className="text-[#3483FA]"
                                >
                                    ¡Sé el primero en publicar!
                                </Button>
                            )}
                        </Card>
                    ) : (
                        posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                {editingPost?.id === post.id ? (
                                    <CardContent className="pt-6">
                                        <form onSubmit={handleUpdatePost} className="space-y-4">
                                            <Input
                                                value={editingPost.title}
                                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                            />
                                            <Textarea
                                                value={editingPost.content}
                                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                                rows={4}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setEditingPost(null)}>
                                                    Cancelar
                                                </Button>
                                                <Button size="sm" type="submit" className="bg-[#3483FA]">
                                                    Guardar
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                ) : (
                                    <>
                                        <CardHeader className="flex flex-row items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-gray-900">{post.title}</CardTitle>
                                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                                    <User className="w-4 h-4 mr-1" />
                                                    <span className="font-medium mr-2">{post.author}</span>
                                                    <span>•</span>
                                                    <span className="ml-2">
                                                        {new Date(post.created_at).toLocaleDateString('es-AR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            {isAuthenticated && user.user_id === post.author_id && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingPost(post)}
                                                        className="text-gray-400 hover:text-[#3483FA]"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {post.content}
                                            </p>
                                        </CardContent>
                                    </>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Posts;
