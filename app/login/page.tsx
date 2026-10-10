import Link from "next/link";
import { Brand } from "@/components/brand";

import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <main className="ms-auth">
      <div className="ms-card ms-auth-card">
        <Brand />
        <span className="rx-workspace-eyebrow">DIRECT FROM THE SOURCE</span>
        <h1>Roxodeal Admin</h1>
        <p>Interactive design preview · no live authentication.</p>
        <Button asChild>
          <Link href="/admin/dashboard">Open admin workspace</Link>
        </Button>
      </div>
    </main>
  );
}
