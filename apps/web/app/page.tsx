import SparklesPreview from "@/components/landingPageBg";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-screen flex items-center justify-center hero relative overflow-hidden">
      <SparklesPreview />
      <Link href={"/Home"}>
        <Button
          className="absolute bottom-70 left-1/2 w-45 h-10 bg-gray-800/30 hover:bg-gray-800/40
                   border-2 border-gray-500
                   shadow-lg shadow-gray-900/50
                   backdrop-blur-lg transform -translate-x-1/2
                   px-12 py-6"
        >
          Get Set Productive
        </Button>
      </Link>
    </div>
  );
}