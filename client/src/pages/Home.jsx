import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";

const sampleProducts = [
  {
    _id: "1",
    name: "پیراهن کتان مردانه",
    slug: "test-1",
    price: 890000,
    discountPrice: 690000,
    images: [
      "https://picsum.photos/400/533?1",
      "https://picsum.photos/400/533?2",
    ],
    colors: ["#121212", "#2D4FFF", "#F2A93B"],
    isNew: false,
  },
  {
    _id: "2",
    name: "تیشرت بیسیک زنانه",
    slug: "test-2",
    price: 450000,
    images: [
      "https://picsum.photos/400/533?3",
      "https://picsum.photos/400/533?4",
    ],
    colors: ["#121212", "#FAFAFA"],
    isNew: true,
  },
  {
    _id: "1",
    name: "پیراهن کتان مردانه",
    slug: "test-1",
    price: 890000,
    discountPrice: 690000,
    images: [
      "https://picsum.photos/400/533?1",
      "https://picsum.photos/400/533?2",
    ],
    colors: ["#121212", "#2D4FFF", "#F2A93B"],
    isNew: false,
  },
  {
    _id: "2",
    name: "تیشرت بیسیک زنانه",
    slug: "test-2",
    price: 450000,
    images: [

    ],
    colors: ["#121212", "#FAFAFA"],
    isNew: true,
  },
];

function Home() {
  return (
    <div>
      <Hero />
      <ProductGrid products={sampleProducts} />
    </div>
  );
}

export default Home;
