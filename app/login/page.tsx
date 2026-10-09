import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <main className="ms-auth">
      <div className="ms-card ms-auth-card">
        <h1>MandiSetu Admin</h1>
        <p>Interactive design preview · no live authentication.</p>
        <Button asChild>
          <Link href="/admin/dashboard">Open admin workspace</Link>
        </Button>
      </div>
    </main>
  );
}
