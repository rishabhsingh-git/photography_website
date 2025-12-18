import React, { useState } from "react";
import { Button } from "../../ui/primitives/Button";
import { Input } from "../../ui/primitives/Input";
import { Select } from "../../ui/primitives/Select";
import { Card, CardContent } from "../../ui/primitives/Card";
import { useCategories } from "../../hooks/useCategories";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { api } from "../../api/client";

const ContactPage: React.FC = () => {
  const { categoriesQuery } = useCategories();
  const { add } = useToastStore();
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    categoryId: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/contact", form);
      add({ title: "Message sent", description: "We will reach out shortly", kind: "success" });
      setForm({ name: "", email: "", phone: "", categoryId: "", message: "" });
    } catch (err: any) {
      add({
        title: "Failed to send",
        description: err?.response?.data?.message ?? "Please retry",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact</p>
        <h1 className="text-3xl font-semibold text-slate-50">Tell us about your shoot.</h1>
      </div>

      <Card>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Name</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Email</label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Phone</label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300">Service interest</label>
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300">Message</label>
              <textarea
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
            <Button type="submit" size="lg" loading={submitting}>
              Send inquiry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactPage;


