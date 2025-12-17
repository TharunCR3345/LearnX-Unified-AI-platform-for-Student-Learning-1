import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GeneratorCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: "cyan" | "purple" | "pink" | "mixed";
  delay?: number;
}

const GeneratorCard = ({
  title,
  description,
  icon: Icon,
  href,
  delay = 0,
}: GeneratorCardProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "group relative block rounded-2xl border border-border bg-card p-5 ios-transition hover:shadow-ios-lg hover:border-foreground/20 ios-bounce",
        "animate-fade-in-up opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 ios-transition group-hover:bg-foreground group-hover:scale-105">
          <Icon className="w-6 h-6 text-foreground ios-transition group-hover:text-background" />
        </div>

        {/* Content */}
        <h3 className="font-display text-lg font-semibold text-foreground mb-1.5 tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="flex items-center text-sm font-medium text-muted-foreground ios-transition group-hover:text-foreground">
          Open
          <ArrowRight className="w-4 h-4 ml-1 ios-transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default GeneratorCard;