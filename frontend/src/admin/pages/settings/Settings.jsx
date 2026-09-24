import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import AdminModuleShell from "../../components/AdminModuleShell";
import { adminApi } from "@/lib/api/adminApi";

export default function Settings() {
  const [form, setForm] = useState({
    businessName: "",
    currency: "INR",
    enquiryChannel: "WhatsApp",
    whatsappNumber: "",
    storefrontStatus: "Live",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Evict old local mock
    try {
      localStorage.removeItem("ashSettings");
    } catch {
      // ignore
    }

    async function loadSettings() {
      try {
        setLoading(true);
        const res = await adminApi.getSettings();
        if (res?.data) {
          setForm((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminApi.updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModuleShell
      eyebrow="MANAGEMENT / SETTINGS"
      title="Settings"
      description="Manage core business, enquiry and storefront configuration."
    >
      <div className="products-card module-card">
        <div className="products-card-header">
          <div>
            <h2>Business settings</h2>
            <p>Configure live store variables and customer communication channels.</p>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#8a8277",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ margin: "0 auto 8px auto", display: "block" }}
            />
            <span>Loading settings...</span>
          </div>
        ) : (
          <form className="settings-form" onSubmit={submit}>
            <div className="settings-grid">
              {Object.entries(form).map(([key, value]) => (
                <label className="form-field" key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <input
                    value={value || ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
              <button
                className="save-product-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Save Settings
              </button>

              {saved && (
                <span
                  className="settings-saved"
                  style={{ color: "#10b981", fontSize: "13px", fontWeight: 600 }}
                >
                  ✓ Saved successfully to database
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </AdminModuleShell>
  );
}
