import React from "react";
import { FloatingDock } from "./floating-dock";
import {
  Home,
  Trophy,
  Users,
  Activity,
  Github,
  Twitter,
  Calendar,
} from "lucide-react";

export default function FloatingDockDemo() {
  const links = [
    {
      title: "Home",
      icon: (
        <Home className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Ranks",
      icon: (
        <Trophy className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Teams",
      icon: (
        <Users className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Warrior Profile",
      icon: (
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          className="h-full w-full rounded-full object-cover"
          alt="Warrior Avatar"
        />
      ),
      href: "#",
    },
    {
      title: "Activity",
      icon: (
        <Activity className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Calendar",
      icon: (
        <Calendar className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Twitter",
      icon: (
        <Twitter className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <Github className="h-full w-full text-neutral-300" />
      ),
      href: "#",
    },
  ];

  return (
    <div className="flex h-[35rem] w-full items-center justify-center">
      <FloatingDock mobileClassName="translate-y-20" items={links} />
    </div>
  );
}
