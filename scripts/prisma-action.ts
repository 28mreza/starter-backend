import { execSync } from "child_process"


(async () => {
  /* IVENDOR_REBORN */
  execSync(`npx prisma db pull --schema=prisma/schema.ivendor_reborn.prisma`, { stdio: "inherit" })
  execSync(`npx prisma generate --schema=prisma/schema.ivendor_reborn.prisma`, { stdio: "inherit" })
})()
