'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'
import type { UserInput } from '@/lib/types'

interface ProductFormProps {
  onSubmit: (data: UserInput) => Promise<void>
  isLoading: boolean
}

const SubmitButton = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze Price'
      )}
    </Button>
  )
}

export function ProductForm({ onSubmit, isLoading }: ProductFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setPhotoError('Image size cannot exceed 4MB.')
        return
      }
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select a valid image file.')
        return
      }
      setPhotoError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setPhotoName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!photoPreview) {
      setPhotoError('Product photo is required.')
      return
    }
    const formData = new FormData(event.currentTarget)
    const data: UserInput = {
      productName: formData.get('productName') as string,
      mrp: Number(formData.get('mrp')),
      photoDataUri: photoPreview,
      photoFileName: photoName || 'product.png',
    }
    await onSubmit(data)
  }
  
  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoName(null)
    if(fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex justify-end animate-in fade-in duration-500 slide-in-from-bottom-5">
      <Card className="w-full max-w-full sm:max-w-[80%] shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="font-headline text-lg sm:text-xl">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                name="productName"
                placeholder="e.g., QuantumScribe Smart Pen"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">Maximum Retail Price (MRP) in INR</Label>
              <Input
                id="mrp"
                name="mrp"
                type="number"
                placeholder="e.g., 3999"
                required
                min="1"
                step="1"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Product Photo</Label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="hidden"
                ref={fileInputRef}
                disabled={isLoading}
              />
              {photoPreview ? (
                <div className="relative group">
                  <Image
                    src={photoPreview}
                    alt="Product preview"
                    width={200}
                    height={200}
                    className="rounded-lg w-full h-auto object-cover max-h-64"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={removePhoto}
                    type="button"
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 sm:h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <UploadCloud size={32} className="mb-2" />
                  <span>Click to upload image</span>
                  <span className="text-xs mt-1">(Max 4MB)</span>
                </button>
              )}
              {photoError && <p className="text-sm text-destructive">{photoError}</p>}
            </div>
            <div className="pt-2">
              <SubmitButton isLoading={isLoading} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
