import { useEffect, useState } from 'react';
import { Check, Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { createBooking, getServices, getBookedSlotsForDate, getBlockedDates, supabase } from '@/lib/supabase';
import type { Service } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'service' | 'rules' | 'datetime' | 'details' | 'payment' | 'success';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

const getMinDate = () => {
  const minDateConfig = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  return minDateConfig.toISOString().split('T')[0];
};

export function BookingModal({ isOpen, onClose, preselectedService }: BookingModalProps) {
  const [step, setStep] = useState<Step>('service');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ start_datetime: string, end_datetime: string }[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  
  // Booking rules state
  const [rulesAccepted, setRulesAccepted] = useState({
    cleanNails: false,
    noForeignWork: false,
    reschedulePolicy: false,
    noPlusOnes: false
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram: '',
    phone: '',

    service: '',
    date: getMinDate(),
    time: '',
    notes: '',
  });

  useEffect(() => {
    async function loadServices() {
      if (isOpen && services.length === 0) {
        const data = await getServices();
        setServices(data);
        const uniqueCats = Array.from(new Set(data.map((s) => s.category)));
        const order: Record<string, number> = {
          'Hands - Short': 0, 'Short Canvas': 0,
          'Hands - Medium': 1, 'Medium Canvas': 1,
          'Hands - Long': 2, 'Long Canvas': 2,
          'Toes': 3, 'Pedicures': 3,
          'Deals': 4, 'Combos': 4,
          'Add-ons': 5,
        };
        uniqueCats.sort((a, b) => {
          const indexA = order[a] ?? 99;
          const indexB = order[b] ?? 99;
          return indexA - indexB;
        });
        setCategories(uniqueCats);
      }
    }
    loadServices();
  }, [isOpen, services.length]);

  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      if (preselectedService) {
        setFormData(prev => ({ ...prev, service: preselectedService }));
        setStep('rules');
      } else {
        if (params.get('booking_success') === 'true') {
          setStep('success');
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          setStep('service');
        }
      }
    }
  }, [isOpen, preselectedService]);

  useEffect(() => {
    async function loadBookedSlots() {
      if (formData.date) {
        const slots = await getBookedSlotsForDate(formData.date);
        setBookedSlots(slots);
      } else {
        setBookedSlots([]);
      }
    }
    loadBookedSlots();
  }, [formData.date]);

  useEffect(() => {
    async function loadBlockedDates() {
      if (isOpen) {
        const dates = await getBlockedDates();
        setBlockedDates(dates);
      }
    }
    loadBlockedDates();
  }, [isOpen]);

  const handleDepositPayment = async () => {
    setIsSubmitting(true);

    const selectedServiceDetails = services.find(s => s.name === formData.service);
    if (!selectedServiceDetails) {
      alert('Service not found.');
      setIsSubmitting(false);
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + selectedServiceDetails.duration_minutes * 60000);

    const isLateNightTime = (time: string) => {
      const hour = parseInt(time.split(':')[0], 10);
      return hour >= 22 || hour < 5;
    };
    const isLate = isLateNightTime(formData.time);
    const basePrice = isLate ? selectedServiceDetails.price_from * 2 : selectedServiceDetails.price_from;
    const isPayingFull = paymentOption === 'full';
    const depositAmount = isPayingFull ? basePrice : (selectedServiceDetails.deposit_required || 15);
    const processingFee = 1;
    const totalNow = isPayingFull ? basePrice + processingFee : depositAmount + processingFee;

    const { data: bData, error } = await createBooking({
      service_id: selectedServiceDetails.id,
      name: formData.name,
      email: formData.email,
      instagram: formData.instagram,
      phone: formData.phone,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      deposit_paid: false,
      deposit_amount: depositAmount,
      total_price: basePrice,
      notes: formData.notes || '',
      status: 'pending',
    });

    if (error || !bData || bData.length === 0) {
      console.error(error);
      alert('Error creating your booking. Please try again.');
      setIsSubmitting(false);
      return;
    }

    const bookingId = bData[0].id;

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setIsSubmitting(false);
      setStep('success');
      return;
    }

    try {
      const successParams = new URLSearchParams({
        booking_success: 'true',
        service: selectedServiceDetails.name,
        date: formData.date,
        time: formData.time,
        total_price: totalNow.toString()
      }).toString();

      const checkoutBody = isPayingFull
        ? {
            booking_id: bookingId,
            name: formData.name,
            email: formData.email,
            service_name: selectedServiceDetails.name,
            total_price: basePrice + processingFee,
            return_url: `${window.location.origin}?${successParams}`
          }
        : {
            booking_id: bookingId,
            name: formData.name,
            email: formData.email,
            service_name: selectedServiceDetails.name,
            deposit_amount: depositAmount,
            processing_fee: processingFee,
            return_url: `${window.location.origin}?${successParams}`
          };

      const { data: functionData, error: functionError } = await supabase.functions.invoke('stripe-checkout', {
        body: checkoutBody
      });

      if (functionError || !functionData?.url) {
        console.error('Checkout error:', functionError || functionData);
        alert('Could not initiate payment. Please contact us or try again later.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('thenailscientizt_booking', JSON.stringify({
        service: selectedServiceDetails.name,
        date: formData.date,
        time: formData.time,
        total_price: totalNow
      }));

      window.location.href = functionData.url;
    } catch (err) {
      console.error('Network error during checkout:', err);
      alert('Payment initialization failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      instagram: '',
      phone: '',
      service: '',
      date: getMinDate(),
      time: '',
      notes: '',
    });
    setRulesAccepted({
      cleanNails: false,
      noForeignWork: false,
      reschedulePolicy: false,
      noPlusOnes: false
    });
    setStep('service');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    if (step === 'rules') setStep('service');
    else if (step === 'datetime') setStep('rules');
    else if (step === 'details') setStep('datetime');
    else if (step === 'payment') setStep('details');
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00'
  ];

  const selectedServiceDetails = services.find(s => s.name === formData.service);
  const basePrice = selectedServiceDetails ? selectedServiceDetails.price_from : 0;
  const depositAmount = paymentOption === 'full' ? basePrice : (selectedServiceDetails ? selectedServiceDetails.deposit_required : 15);
  const processingFee = 1;
  const totalNow = paymentOption === 'full' ? basePrice + processingFee : depositAmount + processingFee;

  const isTimeSlotAvailable = (timeStart: string) => {
    if (!selectedServiceDetails || !formData.date) return true;

    const startDateTime = new Date(`${formData.date}T${timeStart}:00`);
    const endDateTime = new Date(startDateTime.getTime() + selectedServiceDetails.duration_minutes * 60000);

    for (const slot of bookedSlots) {
      const bStart = new Date(slot.start_datetime);
      const bEnd = new Date(slot.end_datetime);

      const bEndWithBuffer = new Date(bEnd.getTime() + 10 * 60000); // 10 min buffer
      const endDateTimeWithBuffer = new Date(endDateTime.getTime() + 10 * 60000);

      if (startDateTime < bEndWithBuffer && endDateTimeWithBuffer > bStart) {
        return false;
      }
    }
    return true;
  };

  const minDate = getMinDate();
  const isInvalidDate = formData.date ? formData.date < minDate : false;
  const isBlockedDate = formData.date ? blockedDates.includes(formData.date) : false;
  const allRulesAccepted = Object.values(rulesAccepted).every(Boolean);

  const stepsList = ['service', 'rules', 'datetime', 'details', 'payment', 'success'];
  const currentStepIndex = stepsList.indexOf(step);
  const progressPercent = (currentStepIndex / (stepsList.length - 1)) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby={undefined} className="bg-obsidian/95 backdrop-blur-2xl text-lab-white border border-neon-pink/30 max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto w-[95vw] sm:w-[90vw] rounded-2xl p-5 sm:p-6 !box-border shadow-[0_0_50px_rgba(255,0,127,0.15)]">

        <DialogHeader className="relative pb-4 border-b border-white/10 mb-4">
          {step !== 'service' && step !== 'success' && (
            <button
              onClick={handleBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 -mt-2 p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0 z-10"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-neon-pink" />
            </button>
          )}
          <DialogTitle className="font-display text-2xl uppercase tracking-wider text-center w-full text-transparent bg-clip-text bg-gradient-to-r from-lab-white to-metallic-silver">
            {step === 'service' && '1. Pick a Service'}
            {step === 'rules' && '2. Before You Book'}
            {step === 'datetime' && '3. Pick Date & Time'}
            {step === 'details' && '4. Your Details'}
            {step === 'payment' && '5. Payment'}
            {step === 'success' && 'Booking Confirmed!'}
          </DialogTitle>
        </DialogHeader>

        {/* PROGRESS BAR */}
        {step !== 'success' && (
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-6">
            <div
              className="bg-neon-pink h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,0,127,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="pt-2">
          {/* STEP 1: SERVICE */}
          {step === 'service' && (
            <div className="space-y-6 animation-fade-in">
              {categories.map(cat => {
                const catServices = services.filter(s => s.category === cat);
                if (catServices.length === 0) return null;
                return (
                  <div key={cat}>
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-metallic-silver mb-3 ml-2">{cat}</h3>
                    <div className="space-y-3 stagger-children">
                      {catServices.map(svc => (
                        <button
                          key={svc.id}
                          onClick={() => { setFormData({ ...formData, service: svc.name }); setStep('rules'); }}
                          className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-neon-pink/50 transition-all flex justify-between items-center group bg-white/5 hover:bg-white/10 hover-lift press-feedback"
                        >
                          <div>
                            <h4 className="font-display font-bold uppercase text-lg text-lab-white">{svc.name}</h4>
                            <p className="text-sm text-lab-white/60 mt-1 flex items-center gap-2">
                              <Clock size={14} className="inline opacity-70" /> {svc.duration}
                              <span className="opacity-40">•</span>
                              <span className="font-medium text-neon-pink">From £{svc.price_from}</span>
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-neon-pink group-hover:bg-neon-pink/20 transition-colors shrink-0">
                            <ChevronRight size={18} className="text-white/70 group-hover:text-neon-pink" strokeWidth={2} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: BOOKING RULES */}
          {step === 'rules' && (
            <div className="space-y-6 animation-fade-in">
              <div className="bg-neon-pink/10 p-4 rounded-xl border border-neon-pink/20 flex items-start gap-3">
                <AlertTriangle className="text-neon-pink shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-lab-white/80 leading-relaxed font-light">
                  please read and agree to these before booking. they're here to make sure your set is perfect every time.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" className="w-4 h-4 accent-neon-pink" checked={rulesAccepted.cleanNails} onChange={(e) => setRulesAccepted({...rulesAccepted, cleanNails: e.target.checked})} />
                  </div>
                  <div>
                    <span className="block font-heading font-semibold text-sm uppercase text-lab-white">Clean Natural Nails</span>
                    <span className="block text-xs text-lab-white/60 mt-1">Nails must be completely bare unless you have booked a soak-off add-on.</span>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" className="w-4 h-4 accent-neon-pink" checked={rulesAccepted.noForeignWork} onChange={(e) => setRulesAccepted({...rulesAccepted, noForeignWork: e.target.checked})} />
                  </div>
                  <div>
                    <span className="block font-heading font-semibold text-sm uppercase text-lab-white">No Foreign Work</span>
                    <span className="block text-xs text-lab-white/60 mt-1">i don't infill or soak off work done by other techs. sorry!</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" className="w-4 h-4 accent-neon-pink" checked={rulesAccepted.reschedulePolicy} onChange={(e) => setRulesAccepted({...rulesAccepted, reschedulePolicy: e.target.checked})} />
                  </div>
                  <div>
                    <span className="block font-heading font-semibold text-sm uppercase text-lab-white">24-Hour Policy</span>
                    <span className="block text-xs text-lab-white/60 mt-1">Rescheduling or cancellations must be done 24 hours prior. Deposits are non-refundable.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="pt-0.5">
                    <input type="checkbox" className="w-4 h-4 accent-neon-pink" checked={rulesAccepted.noPlusOnes} onChange={(e) => setRulesAccepted({...rulesAccepted, noPlusOnes: e.target.checked})} />
                  </div>
                  <div>
                    <span className="block font-heading font-semibold text-sm uppercase text-lab-white">No Plus Ones</span>
                    <span className="block text-xs text-lab-white/60 mt-1">this is a home-based studio. please come on your own.</span>
                  </div>
                </label>
              </div>

              <Button
                onClick={() => setStep('datetime')}
                disabled={!allRulesAccepted}
                className="w-full btn-primary"
              >
                Accept & Continue
              </Button>
            </div>
          )}

          {/* STEP 3: DATETIME */}
          {step === 'datetime' && (
            <div className="space-y-8 animation-fade-in">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="font-heading font-semibold uppercase tracking-wider text-xs mb-1 text-neon-pink">Your Service</p>
                <p className="font-medium">{formData.service} <span className="font-light text-lab-white/60">({selectedServiceDetails?.duration})</span></p>
              </div>

              <div className="w-full">
                <Label className={`font-heading font-semibold uppercase text-sm mb-3 flex items-center gap-2 ${isInvalidDate ? 'text-red-400' : 'text-lab-white/90'}`}>
                  <CalendarIcon size={18} /> 1. Select Date
                </Label>
                <div className="w-full max-w-full overflow-hidden block box-border relative">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value, time: '' });
                    }}
                    className={`bg-white/5 border border-white/10 p-3 sm:p-4 h-auto text-base sm:text-lg w-full max-w-full rounded-xl transition-all cursor-pointer box-border block appearance-none focus:border-neon-pink text-lab-white ${isInvalidDate
                      ? 'border-red-500/50 bg-red-500/10 text-red-300'
                      : ''
                      }`}
                    min={minDate}
                    required
                  />
                  {isInvalidDate && (
                    <p className="text-red-400 text-[11px] sm:text-xs font-semibold mt-2 font-heading uppercase tracking-wide">
                      ⚠ Please select a date at least 1 day from now.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-heading font-semibold uppercase text-sm flex items-center gap-2 text-lab-white/90">
                  <Clock size={16} /> 2. Select Time
                </Label>

                {!formData.date ? (
                  <div className="p-6 bg-white/5 rounded-xl border border-dashed border-white/20 text-center">
                    <p className="text-lab-white/50 font-light">Please pick a date first to see available slots.</p>
                  </div>
                ) : isBlockedDate ? (
                  <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                    <p className="text-red-400 font-semibold text-sm uppercase tracking-wider">🚫 Fully Booked</p>
                    <p className="text-red-400/80 text-xs mt-1">Please choose a different date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map((time) => {
                      const available = isTimeSlotAvailable(time);
                      const isSelected = formData.time === time;
                      return (
                        <button
                          key={time}
                          disabled={!available}
                          onClick={() => setFormData({ ...formData, time })}
                          className={`py-3 px-2 rounded-xl border text-[15px] font-medium transition-all duration-200 ${isSelected
                            ? 'bg-neon-pink border-neon-pink-light text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-[1.02]'
                            : available
                              ? 'border-white/10 hover:border-neon-pink/50 text-lab-white/80 bg-white/5 hover:bg-white/10'
                              : 'border-white/5 bg-transparent text-lab-white/20 line-through cursor-not-allowed'
                            }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  if (isInvalidDate) {
                    alert("Please select a date at least 1 day from now.");
                    return;
                  }
                  if (!formData.date || !formData.time) {
                    alert("Please select both a valid date and a time.");
                    return;
                  }
                  setStep('details');
                }}
                disabled={!formData.date || !formData.time || isInvalidDate || isBlockedDate}
                className="w-full btn-primary py-7 text-lg disabled:opacity-50 disabled:hover:bg-neon-pink disabled:shadow-none"
              >
                Proceed to Details
              </Button>
            </div>
          )}

          {/* STEP 4: DETAILS */}
          {step === 'details' && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setStep('payment');
            }} className="space-y-5 animation-fade-in">

              <div>
                <Label htmlFor="name" className="font-heading font-semibold uppercase text-xs text-metallic-silver tracking-wider mb-1 block">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border border-white/10 focus:border-neon-pink mt-1 p-4 h-auto rounded-xl transition-colors text-lab-white placeholder:text-lab-white/20"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-heading font-semibold uppercase text-xs text-metallic-silver tracking-wider mb-1 block">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border border-white/10 focus:border-neon-pink mt-1 p-4 h-auto rounded-xl transition-colors text-lab-white placeholder:text-lab-white/20"
                  placeholder="you@email.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram" className="font-heading font-semibold uppercase text-xs text-metallic-silver tracking-wider mb-1 block">Instagram *</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-neon-pink mt-1 p-4 h-auto rounded-xl transition-colors text-lab-white placeholder:text-lab-white/20"
                    placeholder="@yourhandle"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="font-heading font-semibold uppercase text-xs text-metallic-silver tracking-wider mb-1 block">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/5 border border-white/10 focus:border-neon-pink mt-1 p-4 h-auto rounded-xl transition-colors text-lab-white placeholder:text-lab-white/20"
                    placeholder="+44 7XXX XXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="font-heading font-semibold uppercase text-xs text-metallic-silver tracking-wider mb-1 block">Add-ons / Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-neon-pink mt-1 p-4 rounded-xl min-h-[100px] resize-none focus:outline-none transition-colors text-lab-white placeholder:text-lab-white/20 text-sm"
                  placeholder="Include any specific requests or extra add-ons needed..."
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-primary py-7 text-lg"
              >
                Review & Pay
              </Button>
            </form>
          )}

          {/* STEP 5: PAYMENT */}
          {step === 'payment' && (
            <div className="space-y-6 animation-fade-in">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <h3 className="font-display font-bold uppercase text-lg mb-4 flex items-center gap-2 text-lab-white">
                  <Check className="text-neon-pink" size={20} strokeWidth={3} /> Booking Summary
                </h3>

                <div className="space-y-3 text-[15px] font-light text-lab-white/80">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-metallic-silver">Service</span>
                    <span className="font-medium text-lab-white text-right">{formData.service}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-metallic-silver">Time</span>
                    <span className="font-medium text-lab-white text-right">{formData.date} at {formData.time}</span>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-metallic-silver">Base Price</span>
                    <span className="font-medium text-lab-white">£{basePrice.toFixed(2)}</span>
                  </div>

                  {paymentOption === 'deposit' && (
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="font-medium text-neon-pink">Booking Deposit</span>
                      <span className="font-bold text-neon-pink">£{depositAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-metallic-silver flex items-center gap-1">Processing Fee</span>
                    <span className="font-medium text-lab-white">£{processingFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="text-metallic-silver font-medium text-lg">Due Now</span>
                    <div className="text-right">
                      <span className="font-bold text-xl text-neon-pink drop-shadow-sm">£{totalNow.toFixed(2)}</span>
                    </div>
                  </div>

                  {paymentOption === 'deposit' && (
                    <div className="flex justify-between pt-1 border-t border-white/10 mt-1">
                      <span className="text-lab-white/40">Remaining (pay on the day)</span>
                      <span className="font-medium text-lab-white/60">£{(basePrice - depositAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Option Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentOption('deposit')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    paymentOption === 'deposit'
                      ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,0,127,0.2)] scale-[1.02]'
                      : 'border-white/10 bg-white/5 text-lab-white/60 hover:border-white/30'
                  }`}
                >
                  <p className="font-heading font-semibold uppercase text-sm text-lab-white">Deposit</p>
                  <p className="text-2xl font-display font-bold mt-1 text-neon-pink">£{(depositAmount + processingFee).toFixed(2)}</p>
                  <p className={`text-[11px] mt-1 ${paymentOption === 'deposit' ? 'text-lab-white/80' : 'text-lab-white/40'}`}>Pay the rest later</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    paymentOption === 'full'
                      ? 'border-neon-pink bg-neon-pink/10 shadow-[0_0_15px_rgba(255,0,127,0.2)] scale-[1.02]'
                      : 'border-white/10 bg-white/5 text-lab-white/60 hover:border-white/30'
                  }`}
                >
                  <p className="font-heading font-semibold uppercase text-sm text-lab-white">Full Price</p>
                  <p className="text-2xl font-display font-bold mt-1 text-neon-pink">£{(basePrice + processingFee).toFixed(2)}</p>
                  <p className={`text-[11px] mt-1 ${paymentOption === 'full' ? 'text-lab-white/80' : 'text-lab-white/40'}`}>Nothing left to pay</p>
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-neon-pink/80 italic leading-tight uppercase font-semibold tracking-wider">
                  ⚠️ Note: There is a £10 fee for lateness (over 15 mins).
                </p>
                <p className="text-xs text-lab-white/50 mt-2 max-w-[280px] mx-auto leading-tight font-light">
                  Payments are securely processed via Stripe. Deposits are non-refundable.
                </p>
              </div>

              <Button
                onClick={handleDepositPayment}
                disabled={isSubmitting}
                className="w-full btn-primary py-8 text-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Confirm & Pay'
                )}
              </Button>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-4 animation-fade-in">
              <div className="w-24 h-24 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,0,127,0.4)] border border-neon-pink">
                <Check className="w-12 h-12 text-neon-pink" strokeWidth={3} />
              </div>

              <div>
                <h2 className="text-3xl font-display font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-lab-white to-metallic-silver">You're All Booked In!</h2>
                <p className="text-sm text-lab-white/70 mt-3 max-w-[300px] mx-auto font-light">
                  your booking is confirmed. check your email for the details.
                </p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-left">
                <p className="font-heading font-semibold uppercase text-neon-pink mb-3 tracking-widest text-sm">Your Booking</p>
                <div className="space-y-2 text-sm text-lab-white/80 font-light">
                  <p><span className="text-metallic-silver inline-block w-20">Service:</span> <span className="font-medium text-lab-white">{new URLSearchParams(window.location.search).get('service') || formData.service || "Booking"}</span></p>
                  <p><span className="text-metallic-silver inline-block w-20">Date:</span> <span className="font-medium text-lab-white">{new URLSearchParams(window.location.search).get('date') || formData.date}</span></p>
                  <p><span className="text-metallic-silver inline-block w-20">Time:</span> <span className="font-medium text-lab-white">{new URLSearchParams(window.location.search).get('time') || formData.time}</span></p>
                  <p><span className="text-metallic-silver inline-block w-20">Where:</span> <span className="font-medium text-lab-white">Private Studio (Details in Email)</span></p>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full btn-secondary text-lg"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
