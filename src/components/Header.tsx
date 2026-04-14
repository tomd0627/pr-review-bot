import { GitPullRequest } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <div className="header-brand">
            <GitPullRequest size={22} aria-hidden="true" className="brand-icon" />
            <div>
              <span className="brand-name">PR Review Bot</span>
              <span className="brand-tagline">AI-powered a11y &amp; perf review</span>
            </div>
          </div>
          <nav className="header-nav" aria-label="Site navigation">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
