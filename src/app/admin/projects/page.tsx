import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectManager from "@/components/admin/ProjectManager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const projects = await prisma.project.findMany({
    include: { _count: { select: { projectUrls: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-50 tracking-tight">
          Projects
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Group URLs into projects with unique worker-facing links
        </p>
      </div>
      <ProjectManager initialProjects={projects} />
    </div>
  );
}
