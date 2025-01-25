import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export async function uploadAvatar(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      throw new Error('File must be an image (JPG, PNG, or WebP)')
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
} 