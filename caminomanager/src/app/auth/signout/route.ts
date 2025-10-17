import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log('Signout route called');
    const supabase = await createClient()

    // Check if a user's logged in
    const {
      data: { user },
      error: getUserError
    } = await supabase.auth.getUser()

    if (getUserError) {
      console.error('Error getting user:', getUserError);
    }

    if (user) {
      console.log('Signing out user:', user.email);
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
      }
      
      console.log('User signed out successfully');
    } else {
      console.log('No user found, proceeding with redirect');
    }

    revalidatePath('/', 'layout')
    return NextResponse.redirect(new URL('/login', req.url), {
      status: 302,
    })
  } catch (error) {
    console.error('Unexpected error in signout route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}