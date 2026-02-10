import { useEffect } from "react";

interface ExternalRedirectPageProps {
  to: string;
}

export default function ExternalRedirectPage({ to }: ExternalRedirectPageProps) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return null;
}
