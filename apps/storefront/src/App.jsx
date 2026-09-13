import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const gallery = [
  "/heritage-silver-bangle.jpg",
  "/bangle-1.jpg",
  "/bangle-2.jpg",
  "/bangle-3.jpg",
  "/bangle-4.jpg",
  "/bangle-5.jpg",
  "/bangle-6.jpg",
];

const relatedProducts = [
  ["Kundan Jhumka Earrings", "/kundan-jhumka-earrings.jpg"],
  ["Silver Bangle Set", "/silver-bangle-set.jpg"],
  ["Rings", "/rings.jpg"],
  ["Not Anklets", "/anklets.jpg"],
];

function App() {
  const [selectedImage, setSelectedImage] = useState(gallery[0]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-serif">
      <header className="flex justify-center flex-col items-center p-6 border-b border-gray-200 bg-white">
        <h1 className="text-4xl tracking-widest mb-4">ash jewellery</h1>
        <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-sans font-medium text-gray-600">
          <a href="#" className="hover:text-gray-900">Jewellery</a>
          <a href="#" className="hover:text-gray-900">Collections</a>
          <a href="#" className="hover:text-gray-900">Our Story</a>
          <a href="#" className="hover:text-gray-900">Contact</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-12 mt-8">
        <div className="space-y-4">
          <Card className="border border-gray-200 shadow-none bg-white rounded-none aspect-square flex items-center justify-center overflow-hidden">
            <CardContent className="p-0 w-full h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Heritage Silver Bangle"
                className="w-full h-full object-contain"
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-wrap">
            {gallery.slice(1).map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`w-20 h-20 bg-white border overflow-hidden ${selectedImage === image ? "border-gray-800" : "border-gray-200"}`}
                aria-label={`View bangle image ${index + 2}`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-start space-y-6">
          <div>
            <h2 className="text-4xl mb-3">Heritage Silver Bangle</h2>
            <p className="text-2xl font-sans font-semibold">₹12,499</p>
          </div>

          <p className="text-gray-600 leading-relaxed font-sans">
            Handcrafted from 925 sterling silver, inspired by traditional Indian
            heritage and intricate filigree art. A timeless masterpiece.
          </p>

          <ul className="list-disc list-inside text-gray-600 font-sans space-y-2">
            <li>Metal: 925 Sterling Silver</li>
            <li>Weight: 45g</li>
            <li>Finish: Antique Silver</li>
            <li>Authenticity Certificate Included</li>
          </ul>

          <div className="pt-6">
            <Button className="bg-[#FF9933] hover:bg-orange-500 text-white w-full text-lg py-6 font-sans font-semibold rounded-none">
              Enquire on WhatsApp
            </Button>
          </div>

          <section className="pt-4">
            <h3 className="text-center text-sm tracking-widest mb-4">YOU MAY ALSO LIKE</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {relatedProducts.map(([name, image]) => (
                <Card key={name} className="rounded-none border-gray-200 bg-white overflow-hidden">
                  <img src={image} alt={name} className="w-full aspect-square object-cover" />
                  <CardContent className="p-2 text-center">
                    <p className="text-xs font-sans font-medium">{name}</p>
                    <button className="text-[10px] uppercase text-[#B47700] mt-1">View</button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
