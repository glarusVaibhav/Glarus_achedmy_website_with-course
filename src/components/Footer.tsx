import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-card py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-text">
              Edu<span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="text-subtext text-sm leading-relaxed">
            Master Artificial Intelligence from Beginner to Expert. The premium platform for modern learners.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-text mb-4">Platform</h3>
          <ul className="space-y-2 text-sm text-subtext">
            <li><Link href="/courses" className="hover:text-primary transition-colors">Browse Courses</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Student Dashboard</Link></li>
            <li><Link href="/instructor" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-text mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-subtext">
            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-text mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-subtext">
            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-card text-center text-subtext text-sm">
        <p>&copy; {new Date().getFullYear()} EduAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
