import { useState, useRef } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductActive } from '@/hooks/useProductsDB';
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Loader2, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminProducts = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();
  const { uploadImage, isUploading } = useImageUpload();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', original_price: '', category: '', 
    images: [] as string[], videos: [] as string[], is_active: true,
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', original_price: '', category: '', images: [], videos: [], is_active: true });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setIsUploadingVideo(true);
    for (const file of Array.from(files)) {
      // Use the same upload function but for videos
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, videos: [...prev.videos, url] }));
      }
    }
    setIsUploadingVideo(false);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      images: formData.images.length > 0 ? formData.images : ['/placeholder.svg'],
      videos: formData.videos,
      is_active: formData.is_active,
    };

    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct, ...productData });
      setEditingProduct(null);
    } else {
      await createProduct.mutateAsync(productData);
      setIsAddOpen(false);
    }
    resetForm();
  };

  const handleEdit = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setFormData({
        name: product.name, description: product.description, price: product.price.toString(),
        original_price: product.original_price?.toString() || '', category: product.category,
        images: product.images || [], videos: (product as any).videos || [], is_active: product.is_active,
      });
      setEditingProduct(productId);
    }
  };

  const productFormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images ({formData.images.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({formData.videos.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="images" className="space-y-2 mt-4">
          <Label>Product Images</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploading}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors">
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          <p className="text-xs text-muted-foreground">Upload multiple images. First image will be the main display.</p>
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-2 mt-4">
          <Label>Product Videos</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.videos.map((video, i) => (
              <div key={i} className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                <video src={video} className="w-full h-full object-cover" muted preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={isUploadingVideo}
              className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors">
              {isUploadingVideo ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Video</span>
                </>
              )}
            </button>
          </div>
          <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" />
          <p className="text-xs text-muted-foreground">Upload product demo videos (MP4, WebM). Max 50MB per video.</p>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_price">Original Price (₹)</Label>
          <Input id="original_price" type="number" step="0.01" value={formData.original_price} onChange={e => setFormData(prev => ({ ...prev, original_price: e.target.value }))} placeholder="Optional" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} required />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="is_active" checked={formData.is_active} onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))} />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || isUploading || isUploadingVideo}>
          {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingProduct ? 'Update' : 'Add'} Product
        </Button>
      </DialogFooter>
    </form>
  );

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog for testing.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a new product to test market demand.</DialogDescription>
            </DialogHeader>
            {productFormContent}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Media</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                      <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <span className="font-medium">₹{Number(product.price).toFixed(2)}</span>
                  {product.original_price && <span className="text-xs text-muted-foreground ml-2 line-through">₹{Number(product.original_price).toFixed(2)}</span>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {product.images?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {(product as any).videos?.length || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive.mutate({ id: product.id, is_active: !product.is_active })}
                    className={product.is_active ? 'text-score-scale' : 'text-muted-foreground'}>
                    {product.is_active ? <><Eye className="h-4 w-4 mr-1" />Active</> : <><EyeOff className="h-4 w-4 mr-1" />Hidden</>}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog open={editingProduct === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product.id)}><Pencil className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
                        {productFormContent}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete "{product.name}".</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProduct.mutate(product.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products?.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products yet. Add your first product to start testing.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminProducts;
