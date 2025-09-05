
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Copy,
  Download,
  Loader2,
  UploadCloud,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  getCaption,
  getHashtags,
  getTextColor,
} from '@/app/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { InstaCraftLogo } from '@/components/icons';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  imageDescription: z.string().optional(),
  caption: z.string().optional(),
  textOverlayContent: z.string().optional(),
  textOverlayFont: z.string().default('Poppins'),
  textOverlayColor: z.string().default('#FFFFFF'),
  textOverlaySize: z.number().min(10).max(100).default(32),
  textOverlayShadow: z.boolean().default(true),
  textOverlayOutline: z.boolean().default(false),
  exportAspectRatio: z.string().default('1:1'),
  exportFitMode: z.string().default('cover'),
});

type FormValues = z.infer<typeof formSchema>;

type TextOverlayBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function InstaCraftPage() {
  const [image, setImage] = React.useState<{ url: string; dataUri: string, naturalWidth: number, naturalHeight: number } | null>(null);
  const [hashtags, setHashtags] = React.useState<string[]>([]);
  const [loadingStates, setLoadingStates] = React.useState({
    caption: false,
    hashtags: false,
    contrast: false,
    exporting: false,
  });

  const [textOverlayBox, setTextOverlayBox] = React.useState<TextOverlayBox>({
    x: 25,
    y: 40,
    width: 50,
    height: 20,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState<string | null>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // New state for image panning
  const [isPanning, setIsPanning] = React.useState(false);
  const [imageOffset, setImageOffset] = React.useState({ x: 50, y: 50 }); // Center by default

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imagePreviewRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageDescription: '',
      caption: '',
      textOverlayContent: 'Your Text Here',
      textOverlayFont: 'Poppins',
      textOverlayColor: '#FFFFFF',
      textOverlaySize: 32,
      textOverlayShadow: true,
      textOverlayOutline: false,
      exportAspectRatio: '1:1',
      exportFitMode: 'cover',
    },
  });

  const watchedValues = form.watch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const reader = new FileReader();
      const img = new window.Image();
      img.onload = () => {
        reader.onload = (e) => {
          const dataUri = e.target?.result as string;
          setImage({ url, dataUri, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
          setImageOffset({ x: 50, y: 50 }); // Reset offset on new image
        };
        reader.readAsDataURL(file);
      }
      img.src = url;
    }
  };

  const handleGenerateCaption = async () => {
    setLoadingStates((s) => ({ ...s, caption: true }));
    const result = await getCaption(watchedValues.imageDescription || 'A beautiful picture.');
    if (result.caption) {
      form.setValue('caption', result.caption);
      toast({ title: 'Caption Generated!', description: 'The AI has generated a new caption for your image.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, caption: false }));
  };

  const handleGenerateHashtags = async () => {
    if (!image) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image first.' });
      return;
    }
    setLoadingStates((s) => ({ ...s, hashtags: true }));
    const result = await getHashtags(image.dataUri, watchedValues.caption || '');
    if (result.hashtags) {
      setHashtags(result.hashtags);
      toast({ title: 'Hashtags Generated!', description: 'AI-powered hashtags are ready.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, hashtags: false }));
  };

  const handleAdjustContrast = async () => {
    if (!image) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image first.' });
      return;
    }
    setLoadingStates((s) => ({ ...s, contrast: true }));
    const result = await getTextColor(image.dataUri, watchedValues.textOverlayColor || '#FFFFFF');
    if (result.adjustedTextColor) {
      form.setValue('textOverlayColor', result.adjustedTextColor);
      toast({ title: 'Color Adjusted!', description: 'AI has picked a new color for better contrast.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoadingStates((s) => ({ ...s, contrast: false }));
  };

  const copyHashtags = () => {
    if (hashtags.length > 0) {
      navigator.clipboard.writeText(hashtags.join(' '));
      toast({ title: 'Copied!', description: 'Hashtags copied to clipboard.' });
    }
  };

  const getTextShadow = (hasShadow: boolean, hasOutline: boolean, color: string) => {
    if (hasOutline) {
      const outlineColor = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
      return `
        -1px -1px 0 ${outlineColor},  
         1px -1px 0 ${outlineColor},
        -1px  1px 0 ${outlineColor},
         1px  1px 0 ${outlineColor}
      `;
    }
    if (hasShadow) {
      return '2px 2px 4px rgba(0, 0, 0, 0.7)';
    }
    return 'none';
  };

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, type: 'drag' | 'resize' | 'pan', cursor?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    if (type === 'drag') setIsDragging(true);
    if (type === 'resize' && cursor) setIsResizing(cursor);
    if (type === 'pan') setIsPanning(true);
    
    setDragStart({ x: clientX, y: clientY });
  };
  
  const handleInteractionEnd = React.useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
    setIsPanning(false);
  }, []);
  
  const handleInteractionMove = React.useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging && !isResizing && !isPanning) return;
    if (!imagePreviewRef.current) return;
  
    const isTouchEvent = 'touches' in e;
    const touch = isTouchEvent ? e.touches[0] : null;

    if (isTouchEvent && !touch) {
      // This can happen on touchEnd.
      return;
    }
    const clientX = isTouchEvent ? touch!.clientX : (e as MouseEvent).clientX;
    const clientY = isTouchEvent ? touch!.clientY : (e as MouseEvent).clientY;
  
    const rect = imagePreviewRef.current.getBoundingClientRect();
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
  
    if (isPanning) {
      setImageOffset(prev => ({
        x: Math.max(0, Math.min(100, prev.x - (dx / rect.width) * 100)),
        y: Math.max(0, Math.min(100, prev.y - (dy / rect.height) * 100)),
      }));
    } else {
        setTextOverlayBox(prev => {
        let { x, y, width, height } = prev;
        const dxPercent = (dx / rect.width) * 100;
        const dyPercent = (dy / rect.height) * 100;

        if (isDragging) {
            x += dxPercent;
            y += dyPercent;
        }

        if (isResizing) {
            if (isResizing.includes('e')) width += dxPercent;
            if (isResizing.includes('w')) { width -= dxPercent; x += dxPercent; }
            if (isResizing.includes('s')) height += dyPercent;
            if (isResizing.includes('n')) { height -= dyPercent; y += dyPercent; }
        }
            
        width = Math.max(10, Math.min(width, 100));
        height = Math.max(10, Math.min(height, 100));
        x = Math.max(0, Math.min(x, 100 - width));
        y = Math.max(0, Math.min(y, 100 - height));

        return { x, y, width, height };
        });
    }

    setDragStart({ x: clientX, y: clientY });
  }, [dragStart, isDragging, isResizing, isPanning]);
  
  React.useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handleInteractionMove(e);
    const endHandler = () => handleInteractionEnd();
  
    window.addEventListener('mousemove', moveHandler, { passive: false });
    window.addEventListener('mouseup', endHandler);
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('touchend', endHandler);
  
    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', endHandler);
    };
  }, [handleInteractionMove, handleInteractionEnd]);

  const handleExportImage = async () => {
    if (!image || !imagePreviewRef.current) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please upload an image first.' });
      return;
    }
  
    setLoadingStates((s) => ({ ...s, exporting: true }));
  
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
  
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = image.url;
      });
  
      const [aspectW, aspectH] = watchedValues.exportAspectRatio.split(':').map(Number);
      const exportWidth = 1080;
      const exportHeight = exportWidth * (aspectH / aspectW);
  
      canvas.width = exportWidth;
      canvas.height = exportHeight;
  
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvas.width / canvas.height;
      let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;
      let dx = 0, dy = 0, dWidth = canvas.width, dHeight = canvas.height;
  
      if (watchedValues.exportFitMode === 'cover') { // FILL
        if (imgAspect > canvasAspect) { // image wider than canvas
          sHeight = img.naturalHeight;
          sWidth = sHeight * canvasAspect;
          sx = (img.naturalWidth - sWidth) * (imageOffset.x / 100);
        } else { // image taller than canvas
          sWidth = img.naturalWidth;
          sHeight = sWidth / canvasAspect;
          sy = (img.naturalHeight - sHeight) * (imageOffset.y / 100);
        }
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      } else { // 'contain' (FIT)
        if (imgAspect > canvasAspect) { // image wider than canvas
          dHeight = canvas.width / imgAspect;
          dy = (canvas.height - dHeight) / 2;
        } else { // image taller than canvas
          dWidth = canvas.height * imgAspect;
          dx = (canvas.width - dWidth) / 2;
        }
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dWidth, dHeight);
      }
  
      // Draw text
      if (watchedValues.textOverlayContent) {
        const previewRect = imagePreviewRef.current.getBoundingClientRect();
        const scale = canvas.width / previewRect.width;
        const scaledFontSize = watchedValues.textOverlaySize * scale;

        const textX = (textOverlayBox.x + textOverlayBox.width / 2) / 100 * canvas.width;
        const textY = (textOverlayBox.y + textOverlayBox.height / 2) / 100 * canvas.height;
        
        ctx.font = `${scaledFontSize}px ${watchedValues.textOverlayFont}`;
        ctx.fillStyle = watchedValues.textOverlayColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
  
        if (watchedValues.textOverlayShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowOffsetX = 2 * scale;
          ctx.shadowOffsetY = 2 * scale;
          ctx.shadowBlur = 4 * scale;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        }
  
        if (watchedValues.textOverlayOutline) {
          const outlineColor = watchedValues.textOverlayColor === '#FFFFFF' ? '#000000' : '#FFFFFF';
          ctx.strokeStyle = outlineColor;
          ctx.lineWidth = 2 * scale;
          ctx.strokeText(watchedValues.textOverlayContent, textX, textY);
        }

        ctx.fillText(watchedValues.textOverlayContent, textX, textY);
      }
  
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = 'instacraft-image.jpg';
      link.href = dataUrl;
      link.click();
  
      toast({ title: 'Image Exported!', description: 'Your image has been saved.' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate the image. Please try again.' });
    } finally {
      setLoadingStates((s) => ({ ...s, exporting: false }));
    }
  };


  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <InstaCraftLogo className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">InstaCraft</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
                <CardDescription>Upload an image to start crafting your post.</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={imagePreviewRef}
                  className={cn(
                    "relative w-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden",
                    { "cursor-grab active:cursor-grabbing": watchedValues.exportFitMode === 'cover' && image }
                  )}
                  style={{ aspectRatio: watchedValues.exportAspectRatio.replace(':', '/') }}
                  onMouseDown={(e) => watchedValues.exportFitMode === 'cover' && image && handleInteractionStart(e, 'pan')}
                  onTouchStart={(e) => watchedValues.exportFitMode === 'cover' && image && handleInteractionStart(e, 'pan')}
                >
                  {image ? (
                    <>
                      <Image 
                        src={image.url} 
                        alt="Preview" 
                        fill
                        priority
                        className={cn('rounded-md select-none pointer-events-none', {
                          'object-cover': watchedValues.exportFitMode === 'cover', // FILL
                          'object-contain': watchedValues.exportFitMode === 'contain', // FIT
                        })}
                        style={{
                           objectPosition: `${imageOffset.x}% ${imageOffset.y}%`
                        }}
                      />
                      {watchedValues.textOverlayContent && (
                        <div
                          className="absolute p-2 pointer-events-none"
                          style={{
                            left: `${textOverlayBox.x}%`,
                            top: `${textOverlayBox.y}%`,
                            width: `${textOverlayBox.width}%`,
                            height: `${textOverlayBox.height}%`,
                            boxSizing: 'border-box',
                          }}
                        >
                           <div className="w-full h-full flex items-center justify-center">
                              <span
                                style={{
                                  fontFamily: watchedValues.textOverlayFont,
                                  fontSize: `${watchedValues.textOverlaySize}px`,
                                  color: watchedValues.textOverlayColor,
                                  textShadow: getTextShadow(!!watchedValues.textOverlayShadow, !!watchedValues.textOverlayOutline, watchedValues.textOverlayColor),
                                  textAlign: 'center',
                                  lineHeight: 1.2,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {watchedValues.textOverlayContent}
                              </span>
                           </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">Upload your image</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Click the button below to select a photo</p>
                      <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud className="mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                   {image && (
                     <div
                        className="absolute p-2 border-2 border-dashed border-white/50 cursor-move hover:border-white"
                        style={{
                          left: `${textOverlayBox.x}%`,
                          top: `${textOverlayBox.y}%`,
                          width: `${textOverlayBox.width}%`,
                          height: `${textOverlayBox.height}%`,
                          boxSizing: 'border-box',
                        }}
                        onMouseDown={(e) => handleInteractionStart(e, 'drag')}
                        onTouchStart={(e) => handleInteractionStart(e, 'drag')}
                      >
                        <div onMouseDown={(e) => handleInteractionStart(e, 'resize', 'nw')} onTouchStart={(e) => handleInteractionStart(e, 'resize', 'nw')} className="absolute -left-1 -top-1 w-4 h-4 bg-white border border-gray-800 rounded-full cursor-nw-resize" />
                        <div onMouseDown={(e) => handleInteractionStart(e, 'resize', 'ne')} onTouchStart={(e) => handleInteractionStart(e, 'resize', 'ne')} className="absolute -right-1 -top-1 w-4 h-4 bg-white border border-gray-800 rounded-full cursor-ne-resize" />
                        <div onMouseDown={(e) => handleInteractionStart(e, 'resize', 'sw')} onTouchStart={(e) => handleInteractionStart(e, 'resize', 'sw')} className="absolute -left-1 -bottom-1 w-4 h-4 bg-white border border-gray-800 rounded-full cursor-sw-resize" />
                        <div onMouseDown={(e) => handleInteractionStart(e, 'resize', 'se')} onTouchStart={(e) => handleInteractionStart(e, 'resize', 'se')} className="absolute -right-1 -bottom-1 w-4 h-4 bg-white border border-gray-800 rounded-full cursor-se-resize" />
                      </div>
                   )}
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Form {...form}>
              <form className="space-y-6">
                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">
                      Caption & Hashtags
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="imageDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Context</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. A happy dog playing in the park" {...field} />
                            </FormControl>
                            <FormDescription>Give the AI some context for a better caption.</FormDescription>
                          </FormItem>
                        )}
                      />

                      <Button type="button" className="w-full" onClick={handleGenerateCaption} disabled={loadingStates.caption}>
                        {loadingStates.caption ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                        Generate Caption with AI
                      </Button>

                      <FormField
                        control={form.control}
                        name="caption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Caption</FormLabel>
                            <FormControl>
                              <Textarea rows={5} placeholder="Your amazing caption..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-2">
                        <Label>Hashtags</Label>
                        <div className="p-3 bg-muted/50 rounded-lg min-h-[60px] flex flex-wrap gap-2">
                          {hashtags.length > 0 ? (
                            hashtags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)
                          ) : (
                            <p className="text-sm text-muted-foreground">Generate hashtags based on your image and caption.</p>
                          )}
                        </div>
                         <div className="flex gap-2">
                           <Button type="button" variant="outline" className="w-full" onClick={handleGenerateHashtags} disabled={loadingStates.hashtags || !image}>
                            {loadingStates.hashtags ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Generate Hashtags
                          </Button>
                          <Button type="button" size="icon" variant="ghost" onClick={copyHashtags} disabled={hashtags.length === 0}>
                            <Copy />
                          </Button>
                         </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Text Overlay</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                       <FormField
                        control={form.control}
                        name="textOverlayContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your text..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="textOverlayFont"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Font</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select a font" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Poppins">Poppins</SelectItem>
                                    <SelectItem value="Arial">Arial</SelectItem>
                                    <SelectItem value="Georgia">Georgia</SelectItem>
                                    <SelectItem value="'Source Code Pro', monospace" className="font-code">Source Code Pro</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        <FormField
                          control={form.control}
                          name="textOverlayColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color</FormLabel>
                              <div className="flex gap-2 items-center">
                                <FormControl>
                                  <Input type="color" className="p-1 h-10 w-14" {...field} />
                                </FormControl>
                                 <Button type="button" variant="ghost" size="icon" onClick={handleAdjustContrast} disabled={loadingStates.contrast || !image}>
                                   <Wand2 />
                                 </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                       <FormField
                        control={form.control}
                        name="textOverlaySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Size: {field.value}px</FormLabel>
                            <FormControl>
                                <Slider
                                    min={10} max={100} step={1}
                                    onValueChange={(v) => field.onChange(v[0])}
                                    defaultValue={[field.value]}
                                />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                       <div className="flex justify-between items-center">
                          <FormField control={form.control} name="textOverlayShadow" render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Shadow</FormLabel>
                              </FormItem>
                            )}
                          />
                           <FormField control={form.control} name="textOverlayOutline" render={({ field }) => (
                              <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Outline</FormLabel>
                              </FormItem>
                            )}
                          />
                       </div>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Export Options</AccordionTrigger>
                     <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="exportAspectRatio" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aspect Ratio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                                    <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                                    <SelectItem value="1.91:1">Landscape (1.91:1)</SelectItem>
                                    <SelectItem value="9:16">Story/Reel (9:16)</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField control={form.control} name="exportFitMode" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fit Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select fit mode" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="cover">FILL (заполнить рамку)</SelectItem>
                                    <SelectItem value="contain">FIT (вместить целиком)</SelectItem>
                                </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button type="button" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleExportImage} disabled={loadingStates.exporting || !image}>
                              {loadingStates.exporting ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                              Export Image
                          </Button>
                     </AccordionContent>
                   </AccordionItem>
                </Accordion>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}

    