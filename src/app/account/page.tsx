import ChangeCredentialsForm from "@/components/forms/ChangeCredentialsForm";

export default function AccountPage() {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-slate-900">أمان الحساب</h1>
        <p className="mt-1 text-slate-600">إدارة بيانات تسجيل الدخول بشكل آمن.</p>
      </div>

      <ChangeCredentialsForm />
    </section>
  );
}
