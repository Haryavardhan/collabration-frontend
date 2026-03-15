import React, { useState, useEffect } from 'react';
import { X, CreditCard, Clock, IndianRupee, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

/* ─── Tiny Toast ─────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: isSuccess ? 'rgba(20,60,40,0.97)' : 'rgba(60,20,20,0.97)',
      border: `1px solid ${isSuccess ? '#22c55e' : '#f87171'}`,
      borderRadius: 12, padding: '14px 20px', color: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'slideInToast 0.3s ease',
    }}>
      {isSuccess
        ? <CheckCircle size={18} color="#22c55e" />
        : <AlertCircle size={18} color="#f87171" />
      }
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', marginLeft: 6, display: 'flex', alignItems: 'center' }}>
        <X size={14} />
      </button>
    </div>
  );
};

/* ─── Main PaymentModal ──────────────────────────────────────── */
const PaymentModal = ({ mentor, onClose, onSuccess }) => {
  const token   = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Derived pricing
  const rate     = mentor.charge_per_min || 0;
  const discount = mentor.discount_percent || 0;
  const baseAmt  = rate * minutes;
  const discAmt  = baseAmt * (discount / 100);
  const total    = baseAmt - discAmt;

  const showToast = (message, type) => setToast({ message, type });

  const handlePay = async () => {
    if (minutes <= 0) return showToast('Enter a valid number of minutes', 'error');

    setLoading(true);
    try {
      // Step 1 — Create Razorpay order via backend
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`}/api/payments/create-order/${mentor.id}`,
        { minutes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { order_id, amount_paise, key_id, payment_db_id } = res.data;

      // Step 2 — Open Razorpay Checkout popup
      const options = {
        key: key_id,
        amount: amount_paise,
        currency: 'INR',
        name: 'CollabSphere',
        description: `Session with ${mentor.name} — ${minutes} min`,
        order_id,
        prefill: {
          name:  storedUser.name  || '',
          email: storedUser.email || '',
        },
        theme: { color: '#7c3aed' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showToast('Payment cancelled', 'error');
          }
        },
        handler: async (response) => {
          try {
            // Step 3 — Verify payment on backend
            const verifyRes = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify`,
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                payment_db_id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setLoading(false);
            showToast(`Payment of ₹${total.toFixed(2)} successful! 🎉`, 'success');
            if (onSuccess) onSuccess(verifyRes.data.payment);
            setTimeout(onClose, 2500);
          } catch (err) {
            setLoading(false);
            showToast(err.response?.data?.error || 'Payment verification failed', 'error');
          }
        },
      };

      if (!window.Razorpay) {
        setLoading(false);
        return showToast('Razorpay SDK not loaded. Check your internet connection.', 'error');
      }
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        showToast('Payment failed. Please try again.', 'error');
      });
      rzp.open();

    } catch (err) {
      setLoading(false);
      showToast(err.response?.data?.error || 'Could not initiate payment', 'error');
    }
  };

  // Preset quick-select durations
  const PRESETS = [15, 30, 60, 90];

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}
      />

      {/* ── Modal ── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 440,
        background: 'linear-gradient(145deg, #16101f, #1a1130)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 20, padding: '2rem',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: 'white',
        animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>Book a Session</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>with {mentor.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Mentor rate info */}
        <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Rate</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#a78bfa' }}>₹{rate}/min</p>
          </div>
          {discount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Discount</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#facc15' }}>{discount}% off</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginLeft: 'auto' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Payment</p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem', color: '#34d399' }}>UPI · Cards · Net Banking</p>
          </div>
        </div>

        {/* Minutes input */}
        <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />
          Duration (minutes)
        </label>

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setMinutes(p)}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${minutes === p ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                background: minutes === p ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                color: minutes === p ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {p}m
            </button>
          ))}
        </div>

        <input
          type="number"
          min={1}
          max={480}
          step={1}
          placeholder="Enter minutes..."
          value={minutes}
          onChange={e => {
            const val = e.target.value === '' ? '' : Math.max(1, Math.floor(Number(e.target.value)));
            setMinutes(val);
          }}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 10, padding: '0.8rem 1.1rem',
            color: 'white', fontSize: '1.2rem', fontWeight: 700, outline: 'none',
            marginBottom: '1.5rem',
            textAlign: 'center',
            transition: 'all 0.2s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onFocus={e => e.target.style.borderColor = '#7c3aed'}
          onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.3)'}
        />

        {/* Price breakdown */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>₹{rate} × {minutes} min</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>₹{baseAmt.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#facc15', fontSize: '0.85rem' }}>Discount ({discount}%)</span>
              <span style={{ color: '#facc15', fontSize: '0.85rem' }}>− ₹{discAmt.toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 2 }}>
              <IndianRupee size={18} strokeWidth={2.5} />
              {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || total <= 0}
          style={{
            width: '100%', padding: '0.85rem',
            background: loading || total <= 0 ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: 'none', borderRadius: 12,
            color: 'white', fontSize: '1rem', fontWeight: 700,
            cursor: loading || total <= 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          {loading ? (
            <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
          ) : (
            <><CreditCard size={18} /> Pay ₹{total.toFixed(2)} via Razorpay</>
          )}
        </button>

        <p style={{ margin: '0.85rem 0 0', textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
          🔒 Secure payment · Supports UPI, PhonePe, Google Pay, Cards & Net Banking
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default PaymentModal;
