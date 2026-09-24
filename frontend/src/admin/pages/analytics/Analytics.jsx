import { useState, useEffect } from "react";
import ContentListPage from "../../components/ContentListPage";
import { adminApi } from "@/lib/api/adminApi";

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await adminApi.getAnalytics();
        if (res?.data?.products) {
          setData(res.data.products);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const rows = data.map((item) => [
    <strong className="product-name" key={item.id}>
      {item.name}
    </strong>,
    item.enquiryCount,
    <div className="analytics-bar" key={`bar-${item.id}`}>
      <span
        style={{
          width: `${Math.min(Number(item.enquiryCount) * 10, 100)}%`,
        }}
      />
    </div>,
  ]);

  return (
    <ContentListPage
      eyebrow="MANAGEMENT / ANALYTICS"
      title="Analytics"
      description="Review catalogue, customer and enquiry activity from the Admin dashboard."
      columns={["PRODUCT", "ENQUIRIES", "ACTIVITY LEVEL"]}
      rows={rows}
      loading={loading}
      emptyMessage="No customer enquiry analytics recorded yet. As customers enquire about jewellery items, activity metrics will appear here."
      actionLabel={null}
    />
  );
}
