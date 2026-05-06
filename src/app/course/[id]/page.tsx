import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Play, Clock, BarChart, CheckCircle2 } from "lucide-react";
import { COURSES } from "@/lib/data";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = COURSES.find(c => c.id === id);

  if (!course) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Course Header Banner */}
      <section className="bg-card w-full pt-12 pb-20 border-b border-background relative overflow-hidden">
        {/* Abstract Background for Premium feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent opacity-80 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <Link href="/courses" className="inline-flex items-center gap-2 text-subtext hover:text-text text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            
            <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              {course.level}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-text leading-tight mb-6">
              {course.title}
            </h1>
            
            <p className="text-xl text-subtext mb-8">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-text font-medium">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white">
                  {course.instructor.charAt(0)}
                </div>
                <span>By {course.instructor}</span>
              </div>
              <div className="h-4 w-px bg-subtext/30" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-subtext" />
                <span>{course.duration}</span>
              </div>
              <div className="h-4 w-px bg-subtext/30" />
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-subtext" />
                <span>{course.level}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-[400px] bg-background border border-card rounded-3xl p-6 shadow-2xl relative translate-y-12 shrink-0">
            {/* Video Placeholder */}
            <div className="w-full h-48 bg-card rounded-2xl mb-6 relative group overflow-hidden cursor-pointer flex items-center justify-center">
               <Image 
                 src={course.image} 
                 alt={course.title} 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-500" 
               />
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />
               <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 mix-blend-overlay" />
               <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-10">
                 <Play className="w-6 h-6 text-white ml-1" />
               </div>
            </div>
            
            <div className="text-3xl font-bold text-text mb-6">
              ₹{course.price.toLocaleString()}
            </div>
            
            <AddToCartButton course={course} />
            
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-text text-sm">This course includes:</h4>
              <ul className="text-sm text-subtext space-y-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {course.duration} on-demand video</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 12 Real-world Projects</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Access to AI Tutor</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details Content */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-text mb-6">Course Overview</h2>
            <div className="prose prose-invert max-w-none text-subtext leading-relaxed">
              <p>This comprehensive program is designed to take you from fundamentals to advanced engineering. You will build production-grade systems using the exact same tech stacks employed by top AI companies.</p>
              <br/>
              <p>Forget toy projects. By the end of this track, your GitHub will showcase robust, scalable AI architectures.</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-text mb-6">Curriculum</h2>
            <div className="space-y-4">
              {[
                { title: "Module 1: Foundations & Architecture", lessons: 8 },
                { title: "Module 2: Core Engineering Patterns", lessons: 12 },
                { title: "Module 3: Advanced Implementation", lessons: 10 },
                { title: "Module 4: Deployment & Scaling", lessons: 6 },
              ].map((mod, i) => (
                <div key={i} className="bg-card border border-card rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors">
                  <h3 className="font-bold text-text">{mod.title}</h3>
                  <span className="text-sm text-subtext">{mod.lessons} lessons</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
