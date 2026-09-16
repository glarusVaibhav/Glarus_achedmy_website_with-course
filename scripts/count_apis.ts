import fs from "fs";
import path from "path";

const apiDir = path.join(process.cwd(), "src", "app", "api");

interface RouteInfo {
  route: string;
  methods: string[];
  file: string;
  category: string;
}

const routes: RouteInfo[] = [];

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      const relPath = path.relative(apiDir, path.dirname(fullPath)).replace(/\\/g, "/");
      const routePath = "/api" + (relPath ? "/" + relPath : "");
      
      const content = fs.readFileSync(fullPath, "utf-8");
      const methods: string[] = [];
      const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
      for (const m of httpMethods) {
        if (new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(content) ||
            new RegExp(`export\\s+const\\s+${m}\\b`).test(content)) {
          methods.push(m);
        }
      }

      let category = "General / Core";
      if (routePath.startsWith("/api/admin")) category = "Admin Module";
      else if (routePath.startsWith("/api/instructor")) category = "Instructor Module";
      else if (routePath.startsWith("/api/student") || routePath.startsWith("/api/learn")) category = "Student & Learning";
      else if (routePath.startsWith("/api/auth")) category = "Authentication & Security";
      else if (routePath.startsWith("/api/courses") || routePath.startsWith("/api/modules") || routePath.startsWith("/api/lectures")) category = "Courses & Curriculum";
      else if (routePath.startsWith("/api/live") || routePath.startsWith("/api/meetings")) category = "Live Classes & Meetings";
      else if (routePath.startsWith("/api/notifications")) category = "Notifications";
      else if (routePath.startsWith("/api/storage") || routePath.startsWith("/api/upload")) category = "Storage & Media (MinIO)";
      else if (routePath.startsWith("/api/certificates") || routePath.startsWith("/api/assessment") || routePath.startsWith("/api/quizzes") || routePath.startsWith("/api/quiz")) category = "Assessments & Certificates";
      else if (routePath.startsWith("/api/payments") || routePath.startsWith("/api/orders")) category = "Payments & Orders";
      else if (routePath.startsWith("/api/reviews") || routePath.startsWith("/api/discussions") || routePath.startsWith("/api/feedback")) category = "Community & Reviews";

      routes.push({
        route: routePath,
        methods: methods.length ? methods : ["GET"],
        file: fullPath,
        category
      });
    }
  }
}

scanDir(apiDir);

routes.sort((a, b) => a.route.localeCompare(b.route));

const categoryGroups: Record<string, RouteInfo[]> = {};
let totalEndpoints = 0;

for (const r of routes) {
  if (!categoryGroups[r.category]) {
    categoryGroups[r.category] = [];
  }
  categoryGroups[r.category].push(r);
  totalEndpoints += r.methods.length;
}

console.log("==================================================================");
console.log(`🚀 GLARUS ACADEMY - TOTAL BACKEND API AUDIT`);
console.log(`Total Route Files: ${routes.length} | Total HTTP Endpoints: ${totalEndpoints}`);
console.log("==================================================================");

for (const [cat, group] of Object.entries(categoryGroups)) {
  console.log(`\n### ${cat} (${group.length} routes, ${group.reduce((acc, g) => acc + g.methods.length, 0)} methods)`);
  for (const item of group) {
    console.log(`  - [${item.methods.join(", ")}] ${item.route}`);
  }
}

console.log("\n==================================================================");
console.log(`SUMMARY: ${routes.length} API Routes | ${totalEndpoints} HTTP Endpoints across ${Object.keys(categoryGroups).length} categories`);
console.log("==================================================================");
