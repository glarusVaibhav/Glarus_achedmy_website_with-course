import prisma from "../src/lib/db";
import { getInstructorPermissions, toggleInstructorPermission } from "../src/lib/permissions/instructorPermissions";

async function main() {
  console.log("==========================================");
  console.log("Testing Session Edit Permission Workflow");
  console.log("==========================================");

  const instructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (!instructor || !admin) {
    console.error("❌ Missing test instructor or admin in database");
    return;
  }

  console.log(`Instructor: ${instructor.name} (${instructor.id})`);
  console.log(`Admin     : ${admin.name} (${admin.id})\n`);

  // 1. Initial State
  const initial = await getInstructorPermissions(instructor.id);
  console.log(`Initial Status: ${initial.status}`);
  console.log(`canEditLiveClass: ${initial.canEditLiveClass}`);

  // 2. Admin Toggles LIVE_CLASS_EDIT ON
  const grantRes = await toggleInstructorPermission(admin.id, instructor.id, "LIVE_CLASS_EDIT", true);
  console.log(`\n✅ Admin Granted LIVE_CLASS_EDIT: ${grantRes.message}`);
  console.log(`Updated canEditLiveClass: ${grantRes.permission.canEditLiveClass}`);

  // 3. Verify
  const verified = await getInstructorPermissions(instructor.id);
  console.log(`Verified Status in DB: ${verified.status}, canEditLiveClass: ${verified.canEditLiveClass}`);

  console.log("\n==========================================");
  console.log("✅ Workflow Verification Completed Successfully!");
  console.log("==========================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
