import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Finding } from "@/lib/types";

const CONFIG = {
  critical: { label: "Critical", Icon: AlertCircle },
  major: { label: "Major", Icon: AlertTriangle },
  minor: { label: "Minor", Icon: Info },
} as const;

interface FindingCardProps {
  finding: Finding;
}

export function FindingCard({ finding }: FindingCardProps) {
  const { label, Icon } = CONFIG[finding.severity];

  return (
    <div
      className={`finding-card finding-card--${finding.severity}`}
      role="note"
      aria-label={`${label} finding: ${finding.title}`}
    >
      <div className="finding-header">
        <span
          className={`finding-badge finding-badge--${finding.severity}`}
          aria-label={`${label} severity`}
        >
          <Icon size={11} aria-hidden="true" />
          {label}
        </span>
        {finding.criterion && (
          <code className="finding-criterion">{finding.criterion}</code>
        )}
        <span className="finding-title">{finding.title}</span>
      </div>
      <p className="finding-message">{finding.message}</p>
      <div className="finding-suggestion">
        <strong>Suggestion:</strong> {finding.suggestion}
      </div>
    </div>
  );
}
