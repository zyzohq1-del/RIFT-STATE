import React, { useState } from 'react';
import { ShoppingBag, Check, ShieldCheck, X, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import { Language, StoreItem } from '../types';
import { storeCatalog } from '../data/serverData';

interface StoreViewProps {
  lang: Language;
}

export const StoreView: React.FC<StoreViewProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<StoreItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [checkoutForm, setCheckoutForm] = useState({
    discordId: '',
    steamHex: '',
    citizenId: '',
    paymentMethod: 'applepay',
  });

  const filteredItems = storeCatalog.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const addToCart = (item: StoreItem) => {
    if (!cart.some((c) => c.id === item.id)) {
      setCart([...cart, item]);
      setCartOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.priceSar, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
          {lang === 'ar' ? 'المتجر الرسمي لدعم السيرفر' : 'Official Community Store'}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-arabic">
          {lang === 'ar' ? 'متجر رتب الدعم والتخصيصات الحصرية' : 'VIP Tiers & In-Game Packages'}
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'مساهمتك تدعم استمرارية الخوادم وتطوير البرمجيات. جميع الحزم تقدم ميزات شكلية وأولوية دخول دون الإخلال بتوازن اللعب.'
            : 'All store revenue funds dedicated hosting, anti-DDoS protection, and custom script development without Pay-to-Win advantages.'}
        </p>
      </div>

      {/* Filter and Cart trigger bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'vip', labelAr: 'رتب الدعم VIP', labelEn: 'VIP Tiers' },
            { id: 'vehicles', labelAr: 'استيراد السيارات', labelEn: 'Vehicles' },
            { id: 'business', labelAr: 'المشاريع والرخص', labelEn: 'Businesses' },
            { id: 'customs', labelAr: 'اللوحات المميزة', labelEn: 'Custom Plates' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Cart Button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative py-2 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white hover:border-neutral-700 flex items-center gap-2 text-xs font-semibold cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}</span>
          {cart.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center font-mono">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const inCart = cart.some((c) => c.id === item.id);
          return (
            <div
              key={item.id}
              className={`bg-neutral-900/60 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-neutral-700 relative overflow-hidden ${
                item.popular ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-neutral-800'
              }`}
            >
              {item.popular && (
                <div className="absolute top-0 end-0 bg-amber-500 text-neutral-950 font-bold text-[10px] uppercase py-1 px-3 rounded-bl-lg font-mono">
                  {lang === 'ar' ? 'الأكثر طلباً' : 'Popular'}
                </div>
              )}

              <div className="space-y-4">
                {item.image && (
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-neutral-800/80 mb-3">
                    <img
                      src={item.image}
                      alt={item.titleAr}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white font-arabic">
                    {lang === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-white tabular-nums">
                      {item.priceSar}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">
                      {lang === 'ar' ? 'ريال سعودي' : 'SAR'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
                </p>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                  <div className="text-[11px] font-semibold text-neutral-400">
                    {lang === 'ar' ? 'المزايا المشمولة في الحزمة:' : 'Included Package Perks:'}
                  </div>
                  {(lang === 'ar' ? item.featuresAr : item.featuresEn).map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-neutral-800">
                <button
                  onClick={() => addToCart(item)}
                  disabled={inCart}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    inCart
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/10'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'مضاف في السلة' : 'Added in Cart'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer / Slide-over */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border-s border-neutral-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-arabic">
                    {lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
                  </h3>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500">
                  {lang === 'ar' ? 'السلة فارغة حالياً. قم باختيار إحدى الحزم لإضافتها.' : 'Your cart is empty.'}
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white">
                          {lang === 'ar' ? item.titleAr : item.titleEn}
                        </div>
                        <div className="text-xs font-mono text-amber-400 tabular-nums">
                          {item.priceSar} SAR
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 font-medium">
                    {lang === 'ar' ? 'المجموع الكلي:' : 'Total Amount:'}
                  </span>
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {totalPrice} SAR
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutModalOpen(true);
                    setCheckoutSuccess(false);
                  }}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إتمام الدفع والتفعيل' : 'Proceed to Checkout'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-arabic">
                  {lang === 'ar' ? 'تفعيل الحزم والتسليم الآلي' : 'Secure In-Game Delivery'}
                </h3>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white font-arabic">
                  {lang === 'ar' ? 'تمت عملية الشراء بنجاح!' : 'Payment & Activation Successful!'}
                </h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                  {lang === 'ar'
                    ? 'تم إرسال الرتب والمزايا لحسابك داخل السيرفر تلقائياً، وستظهر التغييرات بمجرد تسجيل دخولك القادم في FiveM.'
                    : 'Your package perks and roles have been provisioned to your CFX account automatically.'}
                </p>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-amber-400">
                  INVOICE #HLCRP-TX-{Math.floor(100000 + Math.random() * 900000)}
                </div>
                <button
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setCart([]);
                  }}
                  className="py-2 px-6 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg"
                >
                  {lang === 'ar' ? 'إغلاق المتجر' : 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-neutral-400">{lang === 'ar' ? 'المبلغ المطلوب سداده:' : 'Total Due:'}</span>
                  <span className="text-base font-bold font-mono text-white tabular-nums">{totalPrice} SAR</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'اسم المستخدم في الديسكورد (Discord ID) *' : 'Discord ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.discordId}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, discordId: e.target.value })}
                    placeholder="مثال: khalid_90"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'معرّف ستيم (Steam Hex) *' : 'Steam Hex *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.steamHex}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, steamHex: e.target.value })}
                    placeholder="steam:1100001xxxxxxxx"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'رقم هوية المواطن داخل السيرفر (Citizen ID)' : 'Citizen ID in Los Santos'}
                  </label>
                  <input
                    type="text"
                    value={checkoutForm.citizenId}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, citizenId: e.target.value })}
                    placeholder="HL-84920"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Simulated Payment Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-neutral-300">
                    {lang === 'ar' ? 'طريقة السداد' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {['Apple Pay', 'مدى / البطاقة', 'PayPal'].map((method, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: method })}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          checkoutForm.paymentMethod === method
                            ? 'bg-neutral-800 border-amber-500 text-white font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutModalOpen(false)}
                    className="py-2 px-4 rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-neutral-950"
                  >
                    {lang === 'ar' ? 'تأكيد السداد والتسليم الفوري' : 'Confirm & Activate'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
