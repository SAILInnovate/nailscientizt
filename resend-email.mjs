// Quick one-off script to resend the stylist notification email
// Usage: node resend-email.mjs

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dbjgmnaguvmgxkrikcww.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiamdtbmFndXZtZ3hrcmlrY3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTk5MDgsImV4cCI6MjA4NzM3NTkwOH0.-CK4Hwl5PBhbZ5gpnfWEuZ_DFj3BtK4nz3Z_aQKUEw0'
);

const bookingId = '4ab532ef-acae-48f3-ba87-579361723171';

console.log('Invoking resend-notification function...');

const { data, error } = await supabase.functions.invoke('resend-notification', {
  body: { booking_id: bookingId }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Result:', data);
}
