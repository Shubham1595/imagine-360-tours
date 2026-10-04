import React, { useState } from 'react';
import { CheckCircle2, ArrowUpRight, Zap, Clock, UserCheck, ShieldCheck, Calendar, Phone, Mail, User } from 'lucide-react';
import { PRICING_SERVICES } from '../data/pricing';
import { PricingPlan } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { bookingApi } from '../lib/api';

interface BookServiceSectionProps {
  preselectedService?: string;
  onBookNow: (service: PricingPlan) => void;
}

export const BookServiceSection: React.FC<BookServiceSectionProps> = ({
  preselectedService,
  onBookNow
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingModalPlan, setBookingModalPlan] = useState<PricingPlan | null>(null);

  // Direct Booking State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: tomorrow.toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const categories = ['All', 'Spatial', 'Aerial & Survey', 'SaaS & Billing', 'CRS & Hospitality'];

  const filteredPlans = selectedCategory === 'All'
    ? PRICING_SERVICES
    : PRICING_SERVICES.filter(p => p.category === selectedCategory);

  const handleOpenBooking = (plan: PricingPlan) => {
    setBookingModalPlan(plan);
    setBookingSuccess(false);
    setBookingError(null);
  };

  const handleDirectBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalPlan) return;
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date) {
      setBookingError('Please complete all required fields.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      const priceNum = parseInt(bookingModalPlan.startingPrice.replace(/[^0-9]/g, ''), 10) || undefined;
      await bookingApi.submit({
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        service_name: bookingModalPlan.name,
        booking_date: bookingForm.date,
        amount: priceNum,
        notes: bookingForm.notes || `Package: ${bookingModalPlan.name} (${bookingModalPlan.category})`,
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking schedule. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#07090C] overflow-hidden border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-[#00F2FE]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="cyan">SERVICE ENGAGEMENT</Badge>
              <span className="font-mono text-xs text-[#9BA3AE] tracking-widest uppercase">
                // Configurable Pricing Architecture
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight text-white uppercase leading-tight">
              BOOK A <span className="text-gradient-cyan">SERVICE</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-[#9BA3AE] text-base mb-2">
              Transparent, scalable pricing packages configured for independent creators, architectural firms, and enterprise hospitality chains.
            </p>
            <span className="text-xs font-mono text-[#00F2FE]">
              * Listed rates serve as baseline reference scopes. Direct booking instantly persists to operations calendar.
            </span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                  : 'bg-[#101419] text-[#9BA3AE] hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-[#101419] border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between ${
                plan.popular
                  ? 'border-[#00F2FE]/60 shadow-[0_0_30px_rgba(0,242,254,0.15)] ring-1 ring-[#00F2FE]/40'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00F2FE] text-[#07090C] shadow-md uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                {/* Category & Name */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider">
                    {plan.category}
                  </span>
                  {plan.duration && (
                    <span className="text-[11px] font-mono text-[#9BA3AE] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9BA3AE]" />
                      {plan.duration}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                  {plan.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#9BA3AE] leading-relaxed mb-6">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                      {plan.startingPrice}
                    </span>
                  </div>
                  {plan.priceNote && (
                    <span className="text-[11px] font-mono text-[#9BA3AE] block mt-1">
                      {plan.priceNote}
                    </span>
                  )}
                </div>

                {/* Ideal For */}
                <div className="mb-6 p-3 rounded-xl bg-[#07090C] border border-white/5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#00F2FE] font-mono font-semibold mb-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>IDEAL AUDIENCE</span>
                  </div>
                  <div className="text-[#CBD5E1]">
                    {plan.idealFor}
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="space-y-4 mb-8">
                  <div className="text-xs font-mono text-[#9BA3AE] uppercase tracking-wider">
                    Key Deliverables:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1]">
                        <CheckCircle2 className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => handleOpenBooking(plan)}
                className={`w-full py-3.5 rounded-xl font-tech font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]'
                    : 'bg-[#151D28] text-white hover:bg-[#1A2533] border border-white/10 hover:border-[#00F2FE]/40'
                }`}
              >
                <span>Book This Package</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal Confirmation Dialog */}
      {bookingModalPlan && (
        <Modal
          isOpen={!!bookingModalPlan}
          onClose={() => setBookingModalPlan(null)}
          title={`Book: ${bookingModalPlan.name}`}
          subtitle={`CATEGORY: ${bookingModalPlan.category} // STARTING AT ${bookingModalPlan.startingPrice}`}
          maxWidth="lg"
        >
          {bookingSuccess ? (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white">Booking Scheduled Successfully</h3>
              <p className="text-xs text-[#9BA3AE] max-w-md mx-auto">
                Your reservation for <strong className="text-white">{bookingModalPlan.name}</strong> on <strong className="text-[#00F2FE]">{bookingForm.date}</strong> has been stored in our MySQL operational schedule. Our production engineer will contact you shortly.
              </p>
              <button
                onClick={() => setBookingModalPlan(null)}
                className="px-6 py-2.5 rounded-xl bg-[#00F2FE] text-black font-semibold text-xs hover:bg-[#00F2FE]/90 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleDirectBookingSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#07090C] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{bookingModalPlan.name}</div>
                  <div className="text-[11px] font-mono text-[#00F2FE]">{bookingModalPlan.startingPrice}</div>
                </div>
                <div className="text-right text-[11px] font-mono text-[#9BA3AE]">
                  Turnaround: {bookingModalPlan.duration || '2-4 Days'}
                </div>
              </div>

              {bookingError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={bookingForm.name}
                    onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={bookingForm.phone}
                    onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={bookingForm.email}
                    onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Preferred Shoot Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full bg-[#07090C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00F2FE] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#9BA3AE] block mb-1">Project Site / Special Requirements</label>
                <textarea
                  rows={2}
                  placeholder="Location of the property, square footage, lighting requirements..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full bg-[#07090C] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#00F2FE] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const plan = bookingModalPlan;
                    setBookingModalPlan(null);
                    onBookNow(plan);
                  }}
                  className="text-xs text-[#9BA3AE] hover:text-[#00F2FE] underline"
                >
                  Or fill custom detailed brief
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalPlan(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="px-5 py-2.5 rounded-xl font-tech font-bold text-xs bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-[#07090C] hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingBooking ? 'Scheduling in MySQL...' : 'Confirm Shoot Reservation'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </Modal>
      )}
    </section>
  );
};
