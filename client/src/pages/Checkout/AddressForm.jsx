const provinces = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

function AddressForm({ address, onChange }) {
  const set = (field) => (e) =>
    onChange({ ...address, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">
            نام گیرنده
          </label>
          <input
            required
            value={address.receiverName}
            onChange={set("receiverName")}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
          />
        </div>
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">
            شماره تماس گیرنده
          </label>
          <input
            required
            type="tel"
            value={address.receiverPhone}
            onChange={set("receiverPhone")}
            dir="ltr"
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">
            استان
          </label>
          <select
            required
            value={address.province}
            onChange={set("province")}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors bg-paper"
          >
            <option value="">انتخاب کنید</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-body text-sm text-ink/70 mb-1.5">
            شهر
          </label>
          <input
            required
            value={address.city}
            onChange={set("city")}
            className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-sm text-ink/70 mb-1.5">
          آدرس کامل
        </label>
        <textarea
          required
          rows={3}
          value={address.fullAddress}
          onChange={set("fullAddress")}
          className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors resize-none"
        />
      </div>

      <div className="w-1/2">
        <label className="block font-body text-sm text-ink/70 mb-1.5">
          کد پستی
        </label>
        <input
          required
          maxLength={10}
          value={address.postalCode}
          onChange={set("postalCode")}
          dir="ltr"
          className="w-full border border-ink/15 rounded-xl px-4 py-3 font-body text-ink outline-none focus:border-blue transition-colors"
        />
      </div>
    </div>
  );
}

export default AddressForm;
