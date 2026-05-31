import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values when Supabase project is set up
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null as any;

export interface Booking {
  id?: string;
  service_id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  notes?: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  created_at?: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_from: number;
  deposit_required: number;
  duration: string;
  duration_minutes: number;
  category: string;
  image?: string;
}

// Mock services data as fallback
const FALLBACK_SERVICES: Service[] = [
  // Hands - Short
  { id: 's1', name: 'French Tip Nails', description: 'Clean and classic — the perfect everyday nails. Please use the add-ons for extra lengths (long–XXL), designs, etc.', price_from: 35, deposit_required: 15, duration: '1h 45m', duration_minutes: 105, category: 'Hands - Short' },
  { id: 's2', name: 'Nail Art', description: 'Charms and gems are not included — design only. Price can change depending on the complexity of the set.', price_from: 40, deposit_required: 15, duration: '2h', duration_minutes: 120, category: 'Hands - Short' },
  { id: 's3', name: 'Solid Colour Nails', description: 'Includes one colour only.', price_from: 30, deposit_required: 10, duration: '1h 20m', duration_minutes: 80, category: 'Hands - Short' },
  { id: 's4', name: 'Freestyle Set', description: 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.', price_from: 45, deposit_required: 15, duration: '2h 30m', duration_minutes: 150, category: 'Hands - Short' },
  { id: 's5', name: 'Infill', description: 'Previous set must be 2.5 weeks old. If over the time mark you will be charged full price. This price only includes french tip — please include any add-ons.', price_from: 30, deposit_required: 10, duration: '1h 55m', duration_minutes: 115, category: 'Hands - Short' },

  // Hands - Medium
  { id: 'm1', name: 'Solid Colour', description: 'Includes one colour only.', price_from: 30, deposit_required: 10, duration: '1h 30m', duration_minutes: 90, category: 'Hands - Medium' },
  { id: 'm2', name: 'French Tip Nails', description: 'Classic french tip nails. Please use the add-ons for any extras (charms, length).', price_from: 35, deposit_required: 15, duration: '1h 45m', duration_minutes: 105, category: 'Hands - Medium' },
  { id: 'm3', name: 'Nail Art', description: 'Does not include gems and rhinestones — design only. Please include any add-ons.', price_from: 40, deposit_required: 15, duration: '2h', duration_minutes: 120, category: 'Hands - Medium' },
  { id: 'm4', name: 'Freestyle', description: 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.', price_from: 45, deposit_required: 15, duration: '2h 30m', duration_minutes: 150, category: 'Hands - Medium' },

  // Hands - Long
  { id: 'l1', name: 'French Tip', description: 'Classic and clean. Please use the add-ons for any extras (charms, length).', price_from: 40, deposit_required: 15, duration: '2h', duration_minutes: 120, category: 'Hands - Long' },
  { id: 'l2', name: 'Freestyle', description: 'Indecisive about a set? Send me 5 inspo pictures 48 hours before your appointment so I can come up with a design for you. 3 small charms are included in this price.', price_from: 45, deposit_required: 15, duration: '2h 50m', duration_minutes: 170, category: 'Hands - Long' },
  { id: 'l3', name: 'Solid Colour', description: 'One colour only.', price_from: 35, deposit_required: 15, duration: '1h 30m', duration_minutes: 90, category: 'Hands - Long' },
  { id: 'l4', name: 'Nail Art', description: 'Does not include charms and gems — design only. Please include any add-ons.', price_from: 50, deposit_required: 15, duration: '2h 55m', duration_minutes: 175, category: 'Hands - Long' },
  { id: 'l5', name: 'Infill', description: 'Old set must be 2.5 weeks old. Anything over that will be charged as a full set. Please include any add-ons.', price_from: 40, deposit_required: 15, duration: '2h 35m', duration_minutes: 155, category: 'Hands - Long' },

  // Toes
  { id: 'p1', name: 'French Tip Toes', description: 'Classic and clean!', price_from: 30, deposit_required: 10, duration: '1h', duration_minutes: 60, category: 'Toes' },
  { id: 'p2', name: 'Toes Infill', description: 'For toes that have been done 3–4 weeks prior. Anything over this will be charged as a full set.', price_from: 30, deposit_required: 10, duration: '55 mins', duration_minutes: 55, category: 'Toes' },
  { id: 'p3', name: 'Solid Colour Toes', description: 'Includes one colour only.', price_from: 25, deposit_required: 10, duration: '50 mins', duration_minutes: 50, category: 'Toes' },

  // Deals
  { id: 'c1', name: 'Full Blinged Out French Tips', description: 'Rhinestone french tips. Includes short–medium length. For extra length, please use the add-ons.', price_from: 60, deposit_required: 20, duration: '3h', duration_minutes: 180, category: 'Deals' },
  { id: 'c2', name: 'Prom Deal', description: 'Any set — hands and feet for £65.', price_from: 65, deposit_required: 20, duration: '2h 55m', duration_minutes: 175, category: 'Deals' },
  { id: 'c3', name: 'Prom Deal With Bestie', description: 'Share this deal with your friend — £60 each for any set, hands and toes!', price_from: 120, deposit_required: 40, duration: '4h 40m', duration_minutes: 280, category: 'Deals' },
  { id: 'c4', name: 'Any Set Hands & Toes Deal', description: 'Hands and toes — the perfect combo!', price_from: 75, deposit_required: 20, duration: '3h', duration_minutes: 180, category: 'Deals' },
  { id: 'c5', name: 'French Tip Hands & Toes', description: 'French tip hands and toes deal.', price_from: 55, deposit_required: 20, duration: '2h 20m', duration_minutes: 140, category: 'Deals' },

  // Add-ons
  { id: 'a1', name: 'Soak Off', description: 'Keep your natural nails healthy! Book a soak off if your nails are over 3–4 weeks old.', price_from: 10, deposit_required: 5, duration: '40 mins', duration_minutes: 40, category: 'Add-ons' },
];

export async function getServices(): Promise<Service[]> {
  if (!supabaseUrl || !supabaseKey) {
    return FALLBACK_SERVICES;
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('base_price', { ascending: false }); // Optional ordering

    if (error || !data) {
      console.warn('Error fetching services from Supabase, returning fallback.', error);
      return FALLBACK_SERVICES;
    }

    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price_from: Number(s.base_price),
      deposit_required: Number(s.deposit_required || 15),
      duration: s.duration_minutes < 60 ? `${s.duration_minutes} mins` : `${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60 > 0 ? (s.duration_minutes % 60) + 'm' : ''}`,
      duration_minutes: Number(s.duration_minutes),
      category: s.category || 'General'
    }));
  } catch (err) {
    console.error('Failed to fetch services:', err);
    return FALLBACK_SERVICES;
  }
}

// Helper function to create a booking
export async function createBooking(bookingData: Omit<Booking, 'id' | 'created_at'>) {
  // If Supabase is not configured, store in localStorage for demo
  if (!supabaseUrl || !supabaseKey) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const newBooking = {
      ...bookingData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return { data: newBooking, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select();

  return { data, error };
}

// Helper function to get all bookings
export async function getBookings() {
  if (!supabaseUrl || !supabaseKey) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    return { data: bookings, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
}

// Helper function to get booked times for a specific date
export async function getBookedSlotsForDate(dateStr: string) {
  if (!supabaseUrl || !supabaseKey) return [];

  // Parse strings directly for Supabase matching. Format: YYYY-MM-DD
  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('bookings')
    .select('start_datetime, end_datetime')
    .eq('status', 'confirmed')
    .gte('start_datetime', startOfDay)
    .lte('start_datetime', endOfDay);

  if (error) {
    console.error('Error fetching booked slots:', error);
    return [];
  }

  return data || [];
}

// Helper function to get all blocked dates from today onwards
export async function getBlockedDates(): Promise<string[]> {
  if (!supabaseUrl || !supabaseKey) return [];

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('blocked_date')
    .gte('blocked_date', today)
    .order('blocked_date', { ascending: true });

  if (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }

  return (data || []).map((d: { blocked_date: string }) => d.blocked_date);
}

// Helper function to add a blocked date (admin only — uses anon key but RLS allows insert for now)
export async function addBlockedDate(date: string, reason?: string) {
  if (!supabaseUrl || !supabaseKey) return { error: 'Not configured' };

  const { data, error } = await supabase
    .from('blocked_dates')
    .insert([{ blocked_date: date, reason: reason || null }])
    .select();

  return { data, error };
}

// Helper function to remove a blocked date
export async function removeBlockedDate(date: string) {
  if (!supabaseUrl || !supabaseKey) return { error: 'Not configured' };

  const { error } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('blocked_date', date);

  return { error };
}

// Helper to check if a date is blocked
export async function isDateBlocked(dateStr: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseKey) return false;

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('blocked_date', dateStr)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

// Helper to get confirmed bookings for a specific date (used by admin page)
export async function getConfirmedBookingsForDate(dateStr: string) {
  if (!supabaseUrl || !supabaseKey) return [];

  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from('bookings')
    .select('id, name, phone, instagram, email, notes, start_datetime, end_datetime, status, services(name)')
    .eq('status', 'confirmed')
    .gte('start_datetime', startOfDay)
    .lte('start_datetime', endOfDay);

  if (error) {
    console.error('Error fetching bookings for date:', error);
    return [];
  }

  return data || [];
}

// =============================================
// REFERRAL CODE SYSTEM
// =============================================

export interface ReferralValidation {
  is_valid: boolean;
  discount: number;
  owner: string;
  code_id: string;
}

// Validate a referral/promo code
export async function validateReferralCode(_code: string): Promise<ReferralValidation | null> {
  // Referral system disabled
  return null;
}

// Increment the usage count of a referral code
export async function incrementReferralUsage(_codeId: string) {
  // Referral system disabled
}

// Generate a referral code for a completed booking
export async function generateReferralCode(
  _bookingId: string,
  _name: string,
  _email: string,
  _instagram: string
): Promise<string | null> {
  // Referral system disabled
  return null;
}
