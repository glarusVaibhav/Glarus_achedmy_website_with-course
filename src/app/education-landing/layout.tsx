import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GlarusAcademy — Universal Education Platform for Every Learner",
  description:
    "Explore engaging school subjects (Class 5 to 12), practical coding, generative AI, creative design, and live interactive masterclasses on GlarusAcademy.",
};

export default function EducationLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {children}
    </div>
  );
}
