import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Hero from "../components/Hero";
import CategoryShowcase from "../components/CategoryShowcase";
import PromoBanner from "../components/PromoBanner";
import BestSellersSection from "../components/BestSellersSection";
import ProductSection from "../components/ProductSection";
import {
  fetchLatestProducts,
  fetchBestSellers,
} from "../redux/slices/productSlice";
import HeroRail from "../components/Hero";
import HeroArch from "../components/Hero";
import HeroArchPortal from "../components/Hero";

function Home() {
  const dispatch = useDispatch();
  const { latest, latestStatus, latestError } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchLatestProducts());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  return (
    <div>
      <Hero />
      <div className="max-w-7xl mx-auto px-4">
        <ProductSection
          title="جدیدترین محصولات"
          products={latest}
          loading={latestStatus === "loading"}
          error={latestStatus === "failed" ? latestError : null}
          onRetry={() => dispatch(fetchLatestProducts())}
          viewMoreLink="/products"
        />
        <CategoryShowcase />
        <BestSellersSection />

        <PromoBanner />
        {/* <HeroRail/> */}
        {/* <HeroArch/> */}
        
      </div>
    </div>
  );
}

export default Home;
